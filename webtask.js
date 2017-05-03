//globals
var admin = require('firebase-admin');
var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
var tone_analyzer = null;

var helping_words = ["the", "of", "and", "in", "to", "a", "on", "was", "at", "as", "by", "is", "for", "it", "its", "were", "are", "with", "from", "than", "an", "had", "or", "be", "that", "about", "he", "you", "what", "like", "also", "more", "your", "me", "if", "when", "which", "would", "because", "they", "do", "get", "no", "my", "how", "thats", "then", "got", "be", "have", "so", "i", "one", "there", "their", "theyre", "any", "us", "most", "day", "give", "these", "want", "up", "this", "just", "yeah", "dont", "but", "not", "oh", "we", "out", "him", "his", "two", "being", "could", "well", "why", "still", "thing", "ive", "can", "has", "am", "are", "is", "was", "were", "be", "being", "been", "have", "has", "had", "shall", "will", "do", "does", "did", "may", "must", "might", "can", "could", "would", "should"];
var top_limit = 8;

const username, password, key;

//secret for firebase saved in webtask as enviornment variable
// var key = {
//     "type": "....",
//     "project_id": "....",
//     "private_key_id": "....",
//     "private_key": "....",
//     "client_email": "....",
//     "client_id": "....",
//     "auth_uri": "....",
//     "token_uri": "....",
//     "auth_provider_x509_cert_url": "....",
//     "client_x509_cert_url": "...."
// };


//initalize Fireabase and tone analyzer
//dont create another app if there is already an app, will throw an error
if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(key),
        databaseURL: "https://{your-firebase-host}.firebaseio.com"
    });
}

//IBM Watson Tone Analyzer
function initToneAnalyzer(username, password) {
    tone_analyzer = new ToneAnalyzerV3({
        username: username,
        password: password,
        version_date: '2016-05-19'
    });
}



//program entry point
module.exports = function(ctx, cb) {
    var event = ctx.body.event;
    //only need text messages to get sentimental feelings
    if (event.type != 'message') return;

    //firebase database references 
    var db = admin.database();
    var moods = db.ref("moods");
    var words = db.ref("words");
    var counter = db.ref("counter");

    //set globals
    username = ctx.secrets.username;
    password = ctx.secrets.password;
    key = ctx.secrets.key;


    initToneAnalyzer(username, password);

    tone_analyzer.tone({ text: event.text }, function(err, tone) {
        var data = tone.document_tone.tone_categories.filter(x => x.category_id == "emotion_tone")[0].tones;

        moodTableUpdate(data, moods, counter);
        frequencyTableUpdate(event.text, words);
        counterUpdate(counter);

    });

    cb(null);
};


// add new mood to running avergage
function moodTableUpdate(mood_obj, ref, counter_ref) {
    counter_ref.once('value').then(function(snapshot) {
    	
        var count = snapshot.val().count;
        count = count > top_limit ? top_limit : count;
        ref.once('value').then(function(snapshot) {

            var mood = snapshot.val() || {};
            var new_mood = {};
            
            for (var i = 0; i < mood_obj.length; i++) {
                var m = mood_obj[i];
                new_mood[m.tone_id] = runningAverage(mood[m.tone_id] || 0, m.score, count);
            }
            console.log(new_mood);
            ref.set(new_mood);
        });
    });
}
 
// count frequency of words for word cloud
function frequencyTableUpdate(sentence, ref) {
    var words = sentence.match(/\S+/g) || [];
      words = words.filter(function(word){
      return (word.length > 2) && (helping_words.indexOf(word.toLowerCase()) < 0);
    });
    words.forEach(function(word){
      word = word.toLowerCase();
      ref.push().set(word);
    });
    
 }

// for every message update counter, helps with average and activity
function counterUpdate(ref) {
    ref.once('value').then(function(snapshot) {
        var count = snapshot.val().count;
        if (count === undefined || count === "" || count < 0) {
            usersRef.set({ count: 0 });
        } else {
            ref.set({ count: count + 1 });
        }
    });
}




//utils
function runningAverage(avg, n_v, n) {
    return avg + (n_v - avg) / (n+1);
}