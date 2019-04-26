const messageBlock = (text) => ({
  "type": "section",
  "text": {
      "type": "plain_text",
      text,
      "emoji": true
  }
});

const yesButton = {
  "type": "button",
  "text": {
      "type": "plain_text",
      "text": "Yes",
      "emoji": true
  },
  "value": "yes"
};

const noButton = {
  "type": "button",
  "text": {
      "type": "plain_text",
      "text": "No",
      "emoji": true
  },
  "value": "no"
};

const helpButton = {
  "type": "button",
  "text": {
      "type": "plain_text",
      "text": "Help",
      "emoji": true
  },
  "value": "help"
};

const restartButton = {
  "type": "button",
  "text": {
      "type": "plain_text",
      "text": "Restart",
      "emoji": true
  },
  "value": "restart"
};

const endButton = {
  "type": "button",
  "text": {
      "type": "plain_text",
      "text": "End",
      "emoji": true
  },
  "value": "end"
};

const actionsBlock = (buttons) = ({
  "type": "actions",
  "elements": [
      helpButton,
      restartButton,
      endButton,
  ]
});

module.exports.content = (text) => ({
  blocks: [messageBlock(text), actionsBlock],
});