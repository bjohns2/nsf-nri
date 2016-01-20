var express = require('express');
var router = express.Router();

var mongoose = require( 'mongoose' );
var Task     = mongoose.model( 'Task' );
var fs = require('fs');

/* GET index page. */
router.get('/', function(req, res, next) {
  Task.find( function ( err, tasks, count ){
    tasks.sort(function(a, b){
      return parseInt(a.order_number) - parseInt(b.order_number);
    });
    res.render( 'index', {
      title : 'Express Todo Example',
      tasks : tasks
    });
  });
});

/* GET refine page. */
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

// redirect to index when finish
router.update = function ( req, res ){
  Task.findById( req.body.id, function ( err, task ){
    task.descript    = req.body.descript, // Task name; 'grip', 'ungrip', etc.; this will need to have a list of options
    task.duration    = req.body.duration, // some time; autopopulate for robot?
    task.skills      = req.body.skills, 
    task.tools       = req.body.tools,
    task.parents     = req.body.parents,
    task.updated_at  = Date.now(),
    task.arm         = req.body.arm,
    task.grasp_effort= req.body.grasp_effort,
    task.object      = req.body.object,
    task.orientation = req.body.orientation,
    task.angle       = req.body.angle,
    task.position    = req.body.position,
    task.size        = req.body.size,
    task.relativeX   = req.body.relativeX,
    task.relativeY   = req.body.relativeY,
    task.relativeZ   = req.body.relativeZ
    task.save( function ( err, task, count ){
      res.redirect( '/' );
    });
  });
};


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
    grasp_effort: req.body.grasp_effort,
    object      : req.body.object,
    orientation : req.body.orientation,
    angle       : req.body.angle,
    position    : req.body.position,
    size        : req.body.size,
    relativeX   : req.body.relativeX,
    relativeY   : req.body.relativeY,
    relativeZ   : req.body.relativeZ
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
        headers: ['_id', 'descript', 'duration', 'skills', 'Skill2', 'tools', 'Tool2', 'updated_at', 'parents', 'arm', 'grasp_effort', 'object','orientation','angle','position','size','relativeX','relativeY','relativeZ','order_number']//'ID Descript Duration Skills Skill2 Tools Tool2 Updated_At Parents'//
      }
    }
  //adjust this path to the correct location
  // var TaskModel = mongoose.model( 'Task', Task );
  csv.importFile('/Users/bjohns/Desktop/nsf_gui/nsf-gui/task_export.csv', csvHeaders.Task.headers, 'Task');
  res.redirect( '/' );
};

router.sendtasks = function (req, res){
  tasks = Task.find( function ( err, tasks, count ){  // Get all the tasks
    tasks.sort(function(a, b){
      return parseInt(a.order_number) - parseInt(b.order_number);
    });

    var PORT = 9999;
    var HOST = '128.30.9.193';

    // var dgram = require('dgram'); // TODO creat socket on startup and keep it open
    // var header = toBytesInt32(1000);

    // var client = dgram.createSocket('udp4');

    // var myBigMessage = getMessageFromTasks(tasks);
    // console.log(myBigMessage);
    // for (var i=0; i<myBigMessage.length;i++){
    //   // console.log("myMessage: " + myMessage);
    //   var message = new Buffer(myBigMessage[i]);
    //   console.log('SENDING UDP message sent to ' + HOST +':'+ PORT + ' with length: ' + message.length); 
    //   console.log('Specifically, sending ' + myBigMessage[i]);
      
    //   client.send(message, 0, message.length, PORT, HOST, function(err, bytes) {
    //       if (err) throw err;
    //       console.log('UDP message sent to ' + HOST +':'+ PORT); 
    //       // client.close();
    //   });
    // }

    var myBigMessage = getMessageFromTasks(tasks);
    // console.log(myBigMessage);
    // var message = new Buffer(myBigMessage);

    var net = require('net');

    var client = new net.Socket();
    client.connect(PORT, HOST, function() {
      if (err) throw err;
      console.log('Connected');
      for (var i=0; i<myBigMessage.length;i++){
        message = Buffer(myBigMessage[i]);
        console.log('Sending message to ' + HOST +':'+ PORT + ': ' + myBigMessage[i]); 
        client.write(message);
      }
      
    });

    client.on('data', function(data) {
      data = data.readDoubleLE(0);
      console.log('Received: ' + data);
      // client.destroy(); // kill client after server's response
    });

    // client.on('close', function() {
    //   console.log('Connection closed');
    // });
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
  for (var i = 0; i < parameterArray.length; i=i+2) { // Loop over xs to turn them into bytes
    x = parameterArray[i];
    y = parameterArray[i+1];
    xBytes = new Array(y);
    for (var j = 0; j < y; j++) {                     // Loop over ys to make each byte of the x value
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
  // console.log(tasks.length);
  for (var i = 0; i < tasks.length; i++) {      // For each task, make a message

    task = tasks[i];
    taskHeader = makeHeader(i, timestamp, messageLookup[task.descript]["messageTypeCode"]);
    taskMessage = [];
    taskMessage.push(i,4);
    // console.log(i);
    for (param in messageLookup[task.descript]["parameters"]){  // For each parameter of a given task, add its param code and number of bytes
      taskMessage.push(paramValToInt(task[param]));                 // This works given that each param is  [ (int) param code, (int) number of bytes ]
      taskMessage.push(messageLookup[task.descript]["parameters"][param]);
    }
    taskMessage = makeMessage(taskMessage); 
    bigMessage.push(taskHeader);
    bigMessage.push(taskMessage);
  }
  // TODO: and an end_msg
  console.log(bigMessage);
  return bigMessage;
}

function paramValToInt(paramVal) {
  if (paramVal == "left") {
    return 0;
  }
  else if (paramVal == "right") {
    return 1;
  }
  else {
    paramVal = parseInt(paramVal);
  }
  return paramVal;
}


router.saveworkspace = function (req, res){
  function asyncLoop( k, callback ) {         // loop through each task and update its order number
    loopsize = Object.keys(req.body).length;
    if (k<loopsize) {
      task = Object.keys(req.body)[k];
      Task.findById(task, function (err, doc){
        doc.order_number = req.body[task];
        doc.save();
        asyncLoop( k+1, callback );
      });
    }
    else {
        callback();
    }
  }
  asyncLoop( 0, function() {              // when done looping, sort the tasks by their new order number and refresh the page
    Task.find( function ( err, tasks, count ){
      tasks.sort(function(a, b){
        return parseInt(a.order_number) - parseInt(b.order_number);
      });
    });
  }); 
};

module.exports = router;
