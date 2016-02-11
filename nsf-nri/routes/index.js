var express = require('express');
var router = express.Router();

var mongoose = require( 'mongoose' );
var Task     = mongoose.model( 'Task' );
var fs = require('fs');

mongoose.set('debug', true);


/* GET index page. */
router.get('/', function(req, res, next) {
  parents={};
  // console.log("parents: " + parents);
  // Sort the tasks by their order number
  Task.find( function ( err, tasks, count ){
    tasks.sort(function(a, b){
      return parseInt(a.order_number) - parseInt(b.order_number);
    });
    // Get the short IDs of parents before loading the page
    for (task in tasks) {
      parents[tasks[task]._id] = [];
      for (task2 in tasks) {
        if ( tasks[task].parents.indexOf(tasks[task2]._id.toString()) > -1) {
          parents[tasks[task]._id].push( tasks[task2].short_id);
        }
      }
    }
    // console.log("parents: " + parents);
    res.render( 'index', {
      title : 'Express Todo Example',
      tasks : tasks,
      parents: parents,
      times : []
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
    task.location    = req.body.location,
    task.size        = req.body.size,
    task.relativeX   = req.body.relativeX,
    task.relativeY   = req.body.relativeY,
    task.relativeZ   = req.body.relativeZ,
    task.max_joint_vel = req.body.max_joint_vel,
    task.save( function ( err, task, count ){
      res.redirect( '/' );
    });
  });
};


//Redirect the page back to index after the record is created.
router.create = function ( req, res ){
  // First, make tools the relevant info
  tools = [];
  if (req.body.descript =="transport_empty"){
    tools=["object"]
  } else if (req.body.descript =="transport_loaded"){
    tools=["location"]
  } else if (req.body.descript =="position"){
    tools=["orientation","angle"]
  }
  new Task({
    // agent      : req.body.agent, // Should be either 'robot' or 'human'; this will need a binary selector
    descript    : req.body.descript, // Task name; 'grip', 'ungrip', etc.; this will need to have a list of options
    duration    : req.body.duration, // some time; autopopulate for robot?
    skills      : req.body.skills, 
    tools       : tools,
    parents     : req.body.parents,
    updated_at  : Date.now(),
    arm         : req.body.arm,
    grasp_effort: req.body.grasp_effort,
    object      : req.body.object,
    orientation : req.body.orientation,
    angle       : req.body.angle,
    location    : req.body.location,
    size        : req.body.size,
    relativeX   : req.body.relativeX,
    relativeY   : req.body.relativeY,
    relativeZ   : req.body.relativeZ,
    max_joint_vel: req.body.max_joint_vel,
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
        headers: ['_id', 'descript', 'duration', 'skills', 'Skill2', 'tools', 'Tool2', 'updated_at', 'parents', 'arm', 'grasp_effort', 'object','orientation','angle','location','size','relativeX','relativeY','relativeZ','order_number','short_id', 'max_joint_vel']//'ID Descript Duration Skills Skill2 Tools Tool2 Updated_At Parents'//
      }
    }
  //adjust this path to the correct location
  // var TaskModel = mongoose.model( 'Task', Task );
  csv.importFile('/Users/bjohns/Desktop/nsf_gui/nsf-nri/task_export.csv', csvHeaders.Task.headers, 'Task');
  res.redirect( '/' );
};

router.sendtasks = function (req, res){
  tasks = Task.find( function ( err, tasks, count ){  // Get all the tasks
    tasks.sort(function(a, b){
      return parseInt(a.order_number) - parseInt(b.order_number);
    });

    var PORT = 9999;
    var HOST = req.body.ip_destination; //'128.30.9.193';

    var myBigMessage = getMessageFromTasks(tasks);

    var net = require('net');
    var times = [];

    var client = new net.Socket();
    client.connect(PORT, HOST, function() {
      if (err){
        console.log("ERROR: There was an error with the client connection.");
        throw err;
      } 
      console.log('Connected to client on host ' + HOST+':'+ PORT);
      for (var i=0; i<myBigMessage.length;i++){
        message = Buffer(myBigMessage[i]);
        console.log('Sending message ' + i + ' to ' + HOST +':'+ PORT + ': ' + myBigMessage[i]); 
        // console.log(myBigMessage[i]);
        client.write(message);
      }
      
    });

    client.on('data', function(data) {
      if (err){
        console.log("ERROR: There was an error with the client connection while recieving.");
        throw err;
      } 
      data = data.readDoubleLE(0);
      console.log('Received: ' + data);
      times.push(data);
      if (times.length == myBigMessage.length/2){
        console.log("finished recieving message");
        client.destroy();
      }
      // client.destroy(); // kill client after server's response
    });
    // Get the short IDs of parents before loading the page
    for (task in tasks) {
      parents[tasks[task]._id] = [];
      for (task2 in tasks) {
        if ( tasks[task].parents.indexOf(tasks[task2]._id.toString()) > -1) {
          parents[tasks[task]._id].push( tasks[task2].short_id);
        }
      }
    }
    console.log("parents: " + parents);
    // client.on('close', function() {
    //   console.log('Connection closed');
    // });
    res.render( 'index', {
      title : 'Express Todo Example',
      tasks : tasks,
      parents: parents,
      times : times
    });
  });
};

// Convert an int to a byte
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

// Make the header for some task message
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

// Make the byte-level message to send from the array of parameters and values
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

// Get the total message from all populated tasks
function getMessageFromTasks(tasks) {
  timestamp = 0;
  messageLookup = require("../public/json_data/message_lookup.json");
  bigMessage = [];
  // console.log(tasks.length);
  var seqNum = 0;
  for (var i = 0; i < tasks.length; i++) {      // For each task, make a message

    task = tasks[i];
    if (task.descript == "pick_and_place") {
      var tasks_in_pp = ["transport_empty","grasp","transport_loaded","release_load"];
      for (var j=0; j<4; j++){
        bigMessage = makeAndPushMessage(seqNum, timestamp, tasks_in_pp[j], task, bigMessage);
      }
    }
    else {
      bigMessage = makeAndPushMessage(seqNum, timestamp, task.descript, task, bigMessage)
    }
  }
  // TODO: and an end_msg
  // console.log(bigMessage);
  console.log("I made a big message");
  return bigMessage;
}

// Add the message header and message content to bigMessage for some individual task
function makeAndPushMessage(seqNum, timestamp, taskDescription, task, bigMessage){
  taskHeader = makeHeader(seqNum, timestamp, messageLookup[taskDescription]["messageTypeCode"]);
  taskMessage = [];
  taskMessage.push(seqNum,4);
  seqNum = seqNum + 1;
  // console.log(i);
  for (param in messageLookup[taskDescription]["parameters"]){  // For each parameter of a given task, add its param code and number of bytes
    taskMessage.push(paramValToInt(task[param]));                 // This works given that each param is  [ (int) param code, (int) number of bytes ]
    taskMessage.push(messageLookup[taskDescription]["parameters"][param]);
  }
  taskMessage = makeMessage(taskMessage); 
  bigMessage.push(taskHeader);
  bigMessage.push(taskMessage);
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

///// FRONT-SIDE FUNCTIONS /////

function validateMyForm()
{
  if (formValid) { 
    return true;
  }
  alert("Please correct invalid form entries.");
  return false;
}





module.exports = router;
