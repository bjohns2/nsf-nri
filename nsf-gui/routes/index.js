var express = require('express');
var router = express.Router();

var mongoose = require( 'mongoose' );
var Task     = mongoose.model( 'Task' );
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  Task.find( function ( err, tasks, count ){
    res.render( 'index', {
      title : 'Express Todo Example',
      tasks : tasks
    });
  });
});

/* GET home page. */
router.get('/refine', function(req, res, next) {
  Task.find( function ( err, tasks, count ){
    res.render( 'refine', {
      title : 'Express Todo Example - Refine',
      tasks : tasks
    });
  });
});

/* GET Userlist page. */
router.get('/userlist', function(req, res) {
    var db = req.db;
    var collection = db.get('usercollection');
    collection.find({},{},function(e,docs){
        res.render('userlist', {
            "userlist" : docs
        });
    });
});


//Redirect the page back to index after the record is created.
router.create = function ( req, res ){
  console.log("HI")
  console.log(req.body.skills)
  console.log(req.body.tools)
  new Task({
    // agent      : req.body.agent, // Should be either 'robot' or 'human'; this will need a binary selector
    descript    : req.body.descript, // Task name; 'grip', 'ungrip', etc.; this will need to have a list of options
    duration    : req.body.duration, // some time; autopopulate for robot?
    skills      : req.body.skills, 
    tools       : req.body.tools,
    parents     : req.body.parents,
    updated_at  : Date.now(),
    arm         : req.body.arm,
    grasp_effort: req.body.grasp_effort
    })
    .save( function( err, task, count ){
    res.redirect( '/' );
  });
};

// remove todo item by its id
router.destroy = function ( req, res ){
  Task.findById( req.params.id, function ( err, todo ){
    todo.remove( function ( err, todo ){
      res.redirect( '/' );
    });
  });
};

router.exports = function (req, res){
  // Query and stream 
  Task.findAndStreamCsv()
    .pipe(fs.createWriteStream('task_export.csv'));
  res.redirect( '/' );
};


router.imports = function (req, res){
  var csv = require('./csv');
  var csvHeaders = {
      Task: {
        headers: ['_id', 'descript', 'duration', 'skills', 'Skill2', 'tools', 'Tool2', 'updated_at', 'parents', 'arm', 'grasp_effort']//'ID Descript Duration Skills Skill2 Tools Tool2 Updated_At Parents'//
      }
    }
  //adjust this path to the correct location
  // var TaskModel = mongoose.model( 'Task', Task );
  csv.importFile('/Users/bjohns/Desktop/nsf_gui/nsf-gui/task_export.csv', csvHeaders.Task.headers, 'Task');
  res.redirect( '/' );
};

router.sendtasks = function (req, res){
  tasks = Task.find( function ( err, tasks, count ){  // Get all the tasks
    console.log("HI AGAIN");
      var myMessage = getMessageFromTasks(tasks);

    var PORT = 9999;
    var HOST = '128.31.35.204';

    var dgram = require('dgram');
    var header = toBytesInt32(1000);

    // var myMessage = makeHeader(1, 0, 8); 
    // var myOtherMessage = makeMessage([55,2,1,4,0,4,8,4]);

    // console.log(myMessage);
    // console.log(myOtherMessage);

    var message = new Buffer(myMessage);
    console.log('SENDING UDP message sent to ' + HOST +':'+ PORT); 
    var client = dgram.createSocket('udp4');
    client.send(message, 0, message.length, PORT, HOST, function(err, bytes) {
        if (err) throw err;
        console.log('UDP message sent to ' + HOST +':'+ PORT); 
        client.close();
    });

    res.redirect( '/' );
  });
};

function toBytesInt32 (num) {
    bytes=new Array(3);
    x=num;
    bytes[0]=x & (255);
    x=x>>8;
    bytes[1]=x & (255);
    x=x>>8;
    bytes[2]=x & (255);
    x=x>>8;
    bytes[3]=x & (255);
    return bytes;
}

function makeHeader(seqNum, timestamp, messageType) {
  var check = new Array(1);
  check[0]=55;
  check[1]=0;
  var seqNumBytes = toBytesInt32(seqNum);
  var timestampBytes = toBytesInt32(timestamp);
  var messageTypeBytes = toBytesInt32(messageType);
  var header = check.concat(seqNumBytes).concat(timestampBytes).concat(messageTypeBytes);
  return header;
}

function makeMessage(parameterArray) {            // parameterArray is of the format [x1,y1,x2,y2,x3,y3] 
  allBytes = [];                                  // where x is the int message and y is number of bytes to output for x
  for (i = 0; i < parameterArray.length; i=i+2) { // Loop over xs to turn them into bytes
    x = parameterArray[i];
    y = parameterArray[i+1];
    xBytes = new Array(y);
    for (j = 0; j < y; j++) {                     // Loop over ys to make each byte of the x value
      xBytes[j] = x & (255);
      x = x>>8;
    }
    allBytes = allBytes.concat(xBytes); // possibly better to initialize a properly sized array and add in; not sure if it matters
  }
  return allBytes;
}

function getMessageFromTasks(tasks) {
  timestamp = 0;
  messageLookup = require("../public/json_data/message_lookup.json");
  bigMessage = [];
  console.log("HI");
      for (i = 0; i < tasks.length; i++) {      // For each task, make a message
      task = tasks[i];
      taskHeader = makeHeader(i, timestamp, messageLookup[task.descript]["messageTypeCode"]);
      taskMessage = [];
      for (param in messageLookup[task.descript]["parameters"]){  // For each parameter of a given task, add its param code and number of bytes
        taskMessage.push(paramValToInt(task[param]));                 // This works given that each param is  [ (int) param code, (int) number of bytes ]
        taskMessage.push(messageLookup[task.descript]["parameters"][param]);
      }
      // console.log(taskHeader);
      bigMessage = bigMessage.concat(taskHeader).concat(taskMessage);
      // console.log(bigMessage);
    }
  // console.log(tasks);
  // console.log("what");
  // TODO: and an end_msg
  console.log(bigMessage);
  return bigMessage;
}

function paramValToInt(paramVal) {
  if (paramVal == "left") {
    return 0;
  }
  if (paramVal == "right") {
    return 1;
  }
  return paramVal;
}

// // query db for all todo items
// router.index = function ( req, res ){
//   Todo.find( function ( err, todos, count ){
//     // console.log(todos)
//     // console.log(count)
//     console.log("Hi!")
//     res.render( 'index', {
//       title : 'Express Todo Example',
//       todos : todos
//     });
//   });
// };

module.exports = router;
