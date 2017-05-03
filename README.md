
**Live**: https://slackmood.herokuapp.com/

Welcome to Axtion!
===================


This project was made for **CUNY Hackathon** in 1 day. Came in 3rd (honorable mentions). This works with 3 technologies:
 

 1. Firebase (https://firebase.google.com)
 2. Webtask (https://webtask.io/make) 
 3. Tone Analyzer (https://www.ibm.com/watson/developercloud/tone-analyzer.html)

### How to set it up?  <i class="icon-file"></i> 

 1. Create a slackbot with permissions to read public channel messages.
 2. Create a task on webtask, and copy paste code from webtask.js in it. Make sure to put api keys into their places as listed in the file, you need IBM's api keys, and Firebase api keys.
 3. Take webtask webhook url and put it in slack bot configuration where it will send some code which you would need to verify too.

### How does it work?  <i class="icon-cog"></i> 

 - Slack bot reads messages in all public channels, on every message Slack sends the text to Webtask webhook.
 - Webtask file checks if it's a text message, then sends it to ibm for tone analysis.
 - After it get sentimental data back it adds it to Firebase
 - On dashboard Firebase library fires update event through 'value' and there dashboard is updated

### What does it do?  <i class="icon-up"></i> 

It allows company managers to overview company's mood by analyzing what is being said on slack and set baseline, which they can see over days, weeks, months to see if general mood is improving or not. Turnover is biggest problem in Tech, and primary reason is unaddressed emotional needs. Future version would allow private and anonymous messaging to the bot. That would allow employees to give emotional feedback without repercussions of any kind. 


