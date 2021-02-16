# TripBot

This is affective bot working on Slack platform.
Users can write with bot to get town trips ideas depending on the emotions derived from their messages.

![image](https://user-images.githubusercontent.com/11357486/58758881-78962980-8522-11e9-8d33-bf0ed3f39784.png)

This slack bot:
- uses Watson ToneAnalyzer to distinguish one of 7 emotions (joy, sadness, anger, tentative, analytical, fear, confident) from text conversation.
- asks about trip after a time
- asks for rank of conversation

# Instruction for setting up environment for bot

create slack application at https://api.slack.com/apps

create node.js server  at https://cloud.ibm.com

create database at https://console.firebase.google.com

create Watson ToneAnalyzer and Watson Assistant services at https://cloud.ibm.com/developer/watson/services

create skill in Watson Assistant and import skill data from skill-trip.json included in repository
![image](https://user-images.githubusercontent.com/11357486/58759942-04fc1880-8532-11e9-9998-7dfae0932096.png)

create .env file in root folder and fill it up with app credentials

```
# https://api.slack.com/apps
clientId=
clientSecret=
clientSigningSecret=
botToken=

# https://cloud.ibm.com/resources
watsonApiKey=
watsonUrl=
watsonWorkspaceId=
watsonToneAnalyzerUrl=
watsonToneAnalyzerApiKey=

PORT=3000
```
create firebase-credentials.json in root folder and fill it up with credentials from database

```
{
  "type": "",
  "project_id": "",
  "private_key_id": "",
  "private_key": "",
  "client_email": "",
  "client_id": "",
  "auth_uri": "",
  "token_uri": "",
  "auth_provider_x509_cert_url": "",
  "client_x509_cert_url": ""
}
```


# Installation and usage
1. Run 
```bash
npm install
```
2. Run the bot server:
```bash
node bot.js
```
3. Install localtunnel *globally*:
```bash
npm install -g localtunnel
```
4. Run localtunnel:
```bash
lt --port 3000 --subdomain advicebot
```
If advicebot.localtunnel.me is taken, it probably means that someone else is running server.

If working with your own bot: 
Create new app https://api.slack.com/apps?new_app=1 and run 
```bash
lt --port 3000 --subdomain {namebot}
```
Add in OAuth & Permissions: https://{namebot}.localtunnel.me/oauth 


In Envent subscriptions Request Url: https://{namebot}.localtunnel.me/slack/receive

Subscribe to Bot Events (example ones):

message.channels
message.groups
message.im
message.mpim

On https://{namebot}.localtunnel.me login and authorize bot to slack workspace

# Botkit Starter Kit for Slack Bots

This repo contains everything you need to get started building a Slack bot with [Botkit](https://botkit.ai) and [Botkit Studio](https://botkit.ai).

Botkit is designed to ease the process of designing and running useful, creative bots that live inside messaging platforms. Bots are applications that can send and receive messages, and in many cases, appear alongside their human counterparts as users.

Some bots talk like people, others silently work in the background, while others present interfaces much like modern mobile applications. Botkit gives developers the necessary tools for building bots of any kind! It provides an easy-to-understand interface for sending and receiving messages so that developers can focus on creating novel applications and experiences instead of dealing with API endpoints.

Our goal with Botkit is to make bot building easy, fun, and accessible to anyone with the desire to create a future filled with talking machines!

If you are looking to create a bot on other platforms using Glitch, check out the [Botkit project page](https://glitch.com/botkit).

### What's Included
* [Botkit core](https://botkit.ai/docs/core.html) - a complete programming system for building conversational software
* [Pre-configured Express.js webserver](https://expressjs.com/) including:
   * A customizable "Install my Bot" homepage
   * Login and oauth endpoints that allow teams to install your bot
   * Webhook endpoints for communicating with platforms
* Sample skill modules that demonstrate various features of Botkit
* A customizable onboarding experience for new teams powered by Botkit Studio

### Getting Started

There are a myriad of methods you can use to set up an application on Slack, here are some of your options:

#### Install Botkit

[Remix this project on Glitch](https://glitch.com/~botkit-slack)

[Deploy to Heroku](https://heroku.com/deploy?template=https://github.com/howdyai/botkit-starter-slack/master)

Clone this repository using Git:

`git clone https://github.com/howdyai/botkit-starter-slack.git`

Install dependencies, including [Botkit](https://github.com/howdyai/botkit):

```
cd botkit-starter-slack
npm install
```

#### Set up your Slack Application 
Once you have setup your Botkit development enviroment, the next thing you will want to do is set up a new Slack application via the [Slack developer portal](https://api.slack.com/). This is a multi-step process, but only takes a few minutes. 

* [Read this step-by-step guide](https://botkit.ai/docs/provisioning/slack-events-api.html) to make sure everything is set up. 

* We also have this [handy video walkthrough](https://youtu.be/us2zdf0vRz0) for setting up this project with Glitch.

Update the `.env` file with your newly acquired tokens.

Launch your bot application by typing:

`node .`

Now, visit your new bot's login page: http://localhost:3000/login

Now comes the fun part of [making your bot!](https://botkit.ai/docs/#build-your-bot)

 
 [Full video of our 2016 event is available on Youtube.](https://www.youtube.com/playlist?list=PLD3JNfKLDs7WsEHSal2cfwG0Fex7A6aok)



# About Botkit

Botkit is a product of [Howdy](https://howdy.ai) and made in Austin, TX with the help of a worldwide community of botheads.
