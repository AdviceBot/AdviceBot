var env = require('node-env-file');
env(__dirname + '/.env');


if (!process.env.clientId || !process.env.clientSecret || !process.env.PORT) {
  usage_tip();
  // process.exit(1);
}

var Botkit = require('botkit');
var debug = require('debug')('botkit:main');
var attractions = require('./attractions.json');
var trips = require('./components/trips.js');

// ta funkcja znajduje wszystkie wycieczki ktore byly wczesniej niz 2 dni od teraz
// jest async wiec trzeba uzyc then
/*trips.getRecentTripsToNotifyAsync().then((snapshot) => {
    snapshot.forEach((doc) => {
        console.log(doc.id, '=>', doc.data());
        // W doc.data jest obiekt z bazy:
        // {
        //     date: Timestamp,
        //     attraction: "Wawel Cathedral",
        //     user: "UDDJ0HZ29",
        //     notified: false
        // }

        // ustawiam wycieczke ze bot o niej napisal do uzytkownika
        // trzeba to zrobic zeby nie pisac 100 razy do kogos o ta sama wycieczke
        trips.setTripAsNotified(doc.id);
    });
})
.catch((err) => {
    console.log('Error getting documents', err);
});*/

var bot_options = {
    clientId: process.env.clientId,
    clientSecret: process.env.clientSecret,
    clientSigningSecret: process.env.clientSigningSecret,
    stats_optout: true,
    // debug: true,
    scopes: ['bot'],
    studio_token: process.env.studio_token,
    studio_command_uri: process.env.studio_command_uri
};

// Use a mongo database if specified, otherwise store in a JSON file local to the app.
// Mongo is automatically configured when deploying to Heroku
if (process.env.MONGO_URI) {
    var mongoStorage = require('botkit-storage-mongo')({mongoUri: process.env.MONGO_URI});
    bot_options.storage = mongoStorage;
} else {
    bot_options.json_file_store = __dirname + '/.data/db/'; // store user data in a simple JSON format
}

const watsonMiddleware = require('botkit-middleware-watson')({
    iam_apikey: process.env.watsonApiKey,
    url: process.env.watsonUrl,
    workspace_id: process.env.watsonWorkspaceId,
    version: '2018-07-10',
  });
var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
const toneAnalyzer = new ToneAnalyzerV3({
    version: '2016-05-19',
    iam_apikey: process.env.watsonToneAnalyzerApiKey,
    url: process.env.watsonToneAnalyzerUrl,
    workspace_id: process.env.watsonWorkspaceId
});
// Create the Botkit controller, which controls all instances of the bot.
var controller = Botkit.slackbot(bot_options);


controller.middleware.receive.use(watsonMiddleware.receive);
// slackBot.startRTM();

controller.startTicking();

// Set up an Express-powered webserver to expose oauth and webhook endpoints
var webserver = require(__dirname + '/components/express_webserver.js')(controller);

if (!process.env.clientId || !process.env.clientSecret) {

  webserver.get('/', function(req, res){
    res.render('installation', {
      studio_enabled: controller.config.studio_token ? true : false,
      domain: req.get('host'),
      protocol: req.protocol,
      glitch_domain:  process.env.PROJECT_DOMAIN,
      layout: 'layouts/default'
    });
  })

  var where_its_at = 'https://' + process.env.PROJECT_DOMAIN + '.glitch.me/';
  console.log('WARNING: This application is not fully configured to work with Slack. Please see instructions at ' + where_its_at);
}else {

  webserver.get('/', function(req, res){
    res.render('index', {
      domain: req.get('host'),
      protocol: req.protocol,
      glitch_domain:  process.env.PROJECT_DOMAIN,
      layout: 'layouts/default'
    });
  })
  // Set up a simple storage backend for keeping a record of customers
  // who sign up for the app via the oauth
  require(__dirname + '/components/user_registration.js')(controller);

  // Send an onboarding message when a new team joins
  require(__dirname + '/components/onboarding.js')(controller);

  function invokeToneAsync(message, toneAnalyzer) {
    return new Promise(function(resolve, reject) {
      toneAnalyzer.tone({
        text: message.text
      }, (error, data) => {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    });
  }

  function simplifyTone(original) {
    const tones = original
        .document_tone
        .tone_categories
        .map(category => category.tones)
        .reduce((x, y) => x.concat(y));

    const tone = tones.reduce((obj, item) => {
        obj[item.tone_id] = item.score;
        return obj;
    }, {});
    return tone;
  }

  watsonMiddleware.before = function(message, assistantPayload, callback) {
    invokeToneAsync(message, toneAnalyzer).then((tone)=> {

        if (!assistantPayload.context) assistantPayload.context = {};
        assistantPayload.context.tone = simplifyTone(tone);

        callback(null, assistantPayload);
    }).catch(err => {
        console.log(err);
        console.log('error analysing tone');
        callback(err, null);
    });
  }

  //TODO: ugly hack, keep last recommendation in memory
  // Should probably be stored in conversation context
  const recommendationsByUser = new Map();
  function setLastRecommendationForUser(trip, user) {
      recommendationsByUser.set(user, trip);
  }

  function getLastRecommendationForUser(user) {
    return recommendationsByUser.get(user);
  }

  function findRecommendedAttraction(emotion) {
    const trips = attractions.trips;
    const tripsForEmotion = trips
        .filter(trip => trip.emotions.includes(emotion));

    if (tripsForEmotion.length === 0)
        return null;

    return tripsForEmotion[Math.floor(Math.random()*tripsForEmotion.length)];
  }

  function buildRecommendationMessage(trip) {
    if (!trip)
        return 'I could not find anything interesting for your current emotional state :-( Maybe just stay at home with a cup of tea?';

    return `How about *${trip.name}*?. \nHere is the location: ${trip.address}. Do you want to go?`;
  }

  function handleRecommendAttraction(action, message, output) {
    const trip = findRecommendedAttraction(action.parameters.emotion);
    setLastRecommendationForUser(trip, message.user);
    output.push(buildRecommendationMessage(trip));
  }

  function handleAcceptAttraction(message) {
    const user = message.user;
    const trip = getLastRecommendationForUser(user);
    if (!trip) {
        console.error('Unexpected - last recommendation not found for user: ', user);
        return;
    }

    trips.store(trip.name, user);
  }

  var normalizedPath = require("path").join(__dirname, "skills");
  require("fs").readdirSync(normalizedPath).forEach(function(file) {
    require("./skills/" + file)(controller, watsonMiddleware);
  });

  controller.hears(['.*'], ['direct_message', 'direct_mention', 'mention'], function(bot, message) {
    if (message.watsonError) {
        bot.reply(message, "I'm sorry, but for technical reasons I can't respond to your message");
    } else {
        const output = message.watsonData.output.text;

        if (message.watsonData.actions) {
            const actions = message.watsonData.actions;
            for (action of actions) {
                switch(action.name) {
                    case 'recommendAttraction':
                        handleRecommendAttraction(action, message, output);
                        break;
                    case 'acceptAttraction':
                        handleAcceptAttraction(message);
                        break;
                }
            }
        }

        bot.reply(message, output.join('\n'));

    }
  });

}


function usage_tip() {
    console.log('~~~~~~~~~~');
    console.log('Botkit Starter Kit');
    console.log('Execute your bot application like this:');
    console.log('clientId=<MY SLACK CLIENT ID> clientSecret=<MY CLIENT SECRET> PORT=3000 studio_token=<MY BOTKIT STUDIO TOKEN> node bot.js');
    console.log('Get Slack app credentials here: https://api.slack.com/apps')
    console.log('Get a Botkit Studio token here: https://studio.botkit.ai/')
    console.log('~~~~~~~~~~');
}
