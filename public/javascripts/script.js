var config = {
  apiKey: "AIzaSyAccAtHxQKGmrefBGSjG553kR2DZauzvIo",
  authDomain: "hackathon-fd920.firebaseapp.com",
  databaseURL: "https://hackathon-fd920.firebaseio.com",
  projectId: "hackathon-fd920",
  storageBucket: "hackathon-fd920.appspot.com",
  messagingSenderId: "564664901970"
};
firebase.initializeApp(config);

var database = firebase.database();
var ref = database.ref("moods/");
var data = null;
var words_ref = database.ref('words/').limitToLast(50);


var charts_pie = ["fear", "joy", "sadness", "disgust", "anger"];
var elems = [];
charts_pie.forEach(function(term) {
  elems.push({ elem: $('.'+term + "_box"), term: term });
});


var total_updates = 0;

setInterval(function(){
 if (total_updates - .1 <= 0 ) {
   total_updates = 0;
 } else {
  total_updates -= .1;  
 }

 updateTimer();
},1000);


function updateTimer() {
  $('.participation .time span').text(total_updates.toFixed(2));
}

var canvas = document.getElementById('morale_chart'),
    ctx = canvas.getContext('2d'),
    startingData = {
      labels: [1, 2, 3, 4, 5, 6, 7],
      datasets: [
          {
              fillColor: "rgba(220,220,220,0.2)",
              strokeColor: "rgba(220,220,220,1)",
              pointColor: "rgba(220,220,220,1)",
              pointStrokeColor: "#fff",
              data: [65, 59, 80, 81, 56, 55, 40]
          }
      ]
    },
    latestLabel = startingData.labels[6];

// Reduce the animation steps for demo clarity.
var myLiveChart = new Chart(ctx).Line(startingData, {animationSteps: 15});


generatePies();

ref.on("value", function(snap) {
  var value = snap.val();
  if (value == null) return;
  data = value;
  update();
});

function update() {
  total_updates++;
  getInsights();
  elems.forEach(function(obj) {
     var value = Math.round(data[obj.term]*100);
     var morale = null;
     if (obj.term == 'joy') {
        myLiveChart.addData([value], ++latestLabel);
        myLiveChart.removeData();
     } 

     obj.elem.data("easyPieChart").update(value);
     obj.elem.find('.percentage span').text(value);
  });
  
}

function generatePies() {
  charts_pie.forEach(function(obj) {
    $(".chart").easyPieChart({
      animate: {
        duration: 600,
        enabled: true
      },
      barColor: "#fff",
      trackColor: "rgba(0,0,0,.5)",
      scaleColor: false,
      lineWidth: 5,
      lineCap: "circle"
    });
  });
}

var cloud_timer = null;
words_ref.on('value',function(snap){
  var words = snap.val();
  var data = [];
  var freq = {};
  console.log(words);
  for (var k in words) {
    var word = words[k];
    freq[word] = freq[word] || 0;
    freq[word] +=1;
  }
  for (var f in freq) {
    data.push({text: f, weight: freq[f]});  
  }

  data.sort(function(a,b){
    return a.weight < b.weight;
  });

  var data = data.slice(0, 8);
  if (cloud_timer) clearTimeout(cloud_timer);
  cloud_timer = setTimeout(function(){
    $('#keywords').empty().jQCloud(data, {width: 200, height: 200});  
  },400);
  
  
});

$('#keywords').jQCloud([{text:'customers', weight:3}], {width: 200, height: 200});


var insights = [
"Morale has been up over 60% for the last week, keep it up! See what's working?",
"Oh no! Your team's participation went down by 20%. See why?",
"Heads up: your team's fear has increased by 10%. Touch base with them.",
"New trending word detected! The word \"UNITY\" is now trending among your team members.",
"Alas, your team has experienced a 30% increase in disgust. Investigate causes?",
"Urgent: your team's morale has plummeted by 75%. Get in touch with them ASAP.",
"Hey, CUNY Hackathon organizers! Your team's morale has increased by 500%! Indicators suggest this may be due to the presence of Insomnia Cookies."
];

function getInsights() {
  var text = insights[Math.round(Math.random()*(insights.length-1))];
  $('.insights .text').text(text);
}
