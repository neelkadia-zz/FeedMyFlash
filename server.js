var Twitter = require('twitter');
var mongo = require('mongodb');
var client = new Twitter({
  
  //for Neel
  /*consumer_key: 'Ktr2wcSmylc2YAl8aZddwXaxz',
  consumer_secret: 'XFezblfiqxHkcbt2IwNV631e5zkqaGCckvt0tTimYSnghTNrau',
  access_token_key: '95264379-0CVoAxjjbc3zYnut2MJoUl7k8WLysZmyCCUncVtBB',
  access_token_secret: 'Y2DTSjuGvUTW5eU0JxO2Jf1ZVNHnqKvNfWj3341GA6lxX'*/
  //for Flash
  consumer_key: 'zXPRIkYkoFyWNZ3Lh6Q5FHo3r',
  consumer_secret: 'So4XZBRxuulKSKpZF6XUe3CHubyd8qBMnoMP4VGkirl7puI3vj',
  access_token_key: '749522238651629568-xdGPgcPUOBPOyyoW6KmXsXrJMltlWXD',
  access_token_secret: 'KSc1gpRcbOpPFtaKrBQA2NnFhkXnImnN5ac9nwXIM4Cwh'
});
/*
var mongoUri = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://neelkadia:nokia7020@ds011765.mlab.com:11765/feedmyflash';

var mongoUri = process.env.MONGOLAB_URI || 'mongodb://neelkadia:nokia7020@ds011765.mlab.com:11765/feedmyflash'
*/
var databaseUrl = "mongodb://neel:nokia2505@ds011765.mlab.com:11765/feedmyflash";
var mongojs = require('mongojs')
var db = mongojs(databaseUrl);
var feed = db.collection('feed')
var Particle = require('particle-api-js');
var particle = new Particle();
var token ;
var sparkData= "NO";
particle.login({username: 'neelkadia@gmail.com', password: 'nokia7020'}).then(
  function(data){
    console.log('API call completed on promise resolve: ', data.body.access_token);
    token = data.body.access_token;
  },
  function(err) {
    console.log('API call completed on promise fail: ', err);
  }
);

var yes_counter = 0;
var no_counter = 0;
var currentHour = 0;

function getDateTime() {
  //Getting IST Time

var currentTime = new Date();
var currentOffset = currentTime.getTimezoneOffset();

var ISTOffset = 330;   // IST offset UTC +5:30 
var ISTTime = new Date(currentTime.getTime() + (ISTOffset + currentOffset)*60000);

// ISTTime now represents the time in IST coordinates
//var hoursIST = ISTTime.getHours()
//var minutesIST = ISTTime.getMinutes()

    var year    = ISTTime.getFullYear();
    var month   = ISTTime.getMonth()+1; 
    var day     = ISTTime.getDate();
    var hour    = ISTTime.getHours();
    var minute  = ISTTime.getMinutes();
    var second  = ISTTime.getSeconds(); 
    if(month.toString().length == 1) {
        var month = '0'+month;
    }
    if(day.toString().length == 1) {
        var day = '0'+day;
    }   
    if(hour.toString().length == 1) {
        var hour = '0'+hour;
    }
    if(minute.toString().length == 1) {
        var minute = '0'+minute;
    }
    if(second.toString().length == 1) {
        var second = '0'+second;
    }   
    //var dateTime = year+'/'+month+'/'+day+' '+hour+':'+minute+':'+second;   
    var dateTime = year+'/'+month+'/'+day;   
     return dateTime;
}

function getFullDateTime() {
  //Getting IST Time

var currentTime = new Date();
var currentOffset = currentTime.getTimezoneOffset();

var ISTOffset = 330;   // IST offset UTC +5:30 
var ISTTime = new Date(currentTime.getTime() + (ISTOffset + currentOffset)*60000);

// ISTTime now represents the time in IST coordinates
//var hoursIST = ISTTime.getHours()
//var minutesIST = ISTTime.getMinutes()

    var year    = ISTTime.getFullYear();
    var month   = ISTTime.getMonth()+1; 
    var day     = ISTTime.getDate();
    var hour    = ISTTime.getHours();
    var minute  = ISTTime.getMinutes();
    var second  = ISTTime.getSeconds(); 
    if(month.toString().length == 1) {
        var month = '0'+month;
    }
    if(day.toString().length == 1) {
        var day = '0'+day;
    }   
    if(hour.toString().length == 1) {
        var hour = '0'+hour;
    }
    if(minute.toString().length == 1) {
        var minute = '0'+minute;
    }
    if(second.toString().length == 1) {
        var second = '0'+second;
    }   
    var dateTime = year+'/'+month+'/'+day+' '+hour+':'+minute+':'+second;   
    //var dateTime = year+'/'+month+'/'+day;   
     return dateTime;
}


function getDateTimeIST() {
  //Getting IST Time

var currentTime = new Date();
var currentOffset = currentTime.getTimezoneOffset();

var ISTOffset = 330;   // IST offset UTC +5:30 
var ISTTime = new Date(currentTime.getTime() + (ISTOffset + currentOffset)*60000);

     return ISTTime;
}

currentHour = getDateTimeIST().getHours();

//console.log(getDateTime());
//console.log(hoursIST + ":" + minutesIST + " : "+getDateTime());


//var db = require('mongojs').connect('mongodb://neelkadia:nokia7020@ds011765.mlab.com:11765/feedmyflash');

/**
 * Stream statuses filtered by keyword
 * number of tweets per second depends on topic popularity
 **/
 
client.stream('statuses/filter', {track: 'FeedMyFlash'},  function(stream) {
  stream.on('data', function(tweet) {
    if(tweet.text.search(/yes/i)>0){
      yes_counter++;
    }else if(tweet.text.search(/no/i)>0){
      no_counter++;
    }
    //console.log("Yes:"+yes_counter + "   No:"+no_counter);
  });

  stream.on('error', function(error) {
    console.log(error);
  });
});




setInterval(function(){ 
    //code goes here that will be run every 5 seconds.    
    //Update database
    ///console.log("Update called!" + "   " + "govt:"+yes_counter + "   india:"+no_counter);
    //console.log('setInterval yes_counter:'+yes_counter + ', no_counter:'+no_counter);
    
    feed.findAndModify({
        query: { date:getDateTime(), startHour: getDateTimeIST().getHours() },
        update: { $set: { yes: yes_counter, no: no_counter} },
        new: true
      }, function (err, doc, lastErrorObject) {
        // doc.tag === 'maintainer'
    });
    //END Update Database
    
    //Check and update counter
    if(currentHour != getDateTimeIST().getHours()){
      //Check Feed or Not feed?    
      if(yes_counter>no_counter){
        sparkData = "YES";
      }else{
        sparkData = "NO";
      }
    
    //Send a Feed/NoFeed data to Particle
    var fnPr = particle.callFunction({ deviceId: '440034000e47343233323032', name: 'tweet', argument: sparkData, auth: token });
    fnPr.then(
      function(data) {
        //console.log('Function called succesfully:', data);
        //Post a Tweet about Feeding or not feeding
        client.post('statuses/update', {status: getFullDateTime()+" #FeedMyFlashStatus: " + "Yes:"+yes_counter+", No:"+no_counter + " Feeding? = "+sparkData}, function(error, tweet, response){
          if (!error) {
            //console.log(tweet);
          }else{
            console.log(error);
            //console.log(response);
          }
          //Clear counters and log that update happen
          // console.log('last1 yes_counter:'+yes_counter + ', no_counter:'+no_counter);
          yes_counter = 1;
          no_counter = 0;
          sparkData = "NO";
          currentHour = getDateTimeIST().getHours();
        });
        //End Post a Tweet about Feeding or not feeding
      }, function(err) {
        console.log('An error occurred:', err);
      });
    //End Send a Feed/NoFeed data to Particle
    }//END Check and update counter
}, 300000); // Make it 600000 mss