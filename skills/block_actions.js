const { content } = require('./../blocks/content');
module.exports = function(controller, watsonMiddleware) {

    controller.middleware.receive.use(function(bot, message, next) {
        if (message.type == 'block_actions') {
            watsonMiddleware.sendToWatsonAsync(bot, message)
            .then(() => {
                bot.reply(message, content(message.watsonData.output.text.join('\n')));
            });
                console.log('received help button ')
        }
        
        next();    
        
      });
}
