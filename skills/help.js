const { content } = require('./../blocks/content');
module.exports = function(controller, watsonMiddleware) {

    controller.hears(['help'], ['direct_message', 'direct_mention', 'mention'], watsonMiddleware.hear, function(bot, message) {
        bot.reply(message, content(message.watsonData.output.text.join('\n')));

        console.log('user requested help');
    });
}
