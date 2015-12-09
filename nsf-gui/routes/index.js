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
    agent      : req.body.agent, // Should be either 'robot' or 'human'; this will need a binary selector
    descript   : req.body.descript, // Task name; 'grip', 'ungrip', etc.; this will need to have a list of options
    duration   : req.body.duration, // some time; autopopulate for robot?
    skills     : req.body.skills, 
    tools      : req.body.tools,
    parents    : req.body.parents,
    updated_at : Date.now()
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
