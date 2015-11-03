var express = require('express');
var router = express.Router();

var mongoose = require( 'mongoose' );
var Task     = mongoose.model( 'Task' );

/* GET home page. */
router.get('/', function(req, res, next) {
  Task.find( function ( err, tasks, count ){
    // console.log(todos)
    // console.log(count)
    console.log("Hi!")
    res.render( 'index', {
      title : 'Express Todo Example',
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
  new Task({
    agent      : req.body.agent, // Should be either 'robot' or 'human'; this will need a binary selector
    type       : req.body.mytype, // Task name; 'grip', 'ungrip', etc.; this will need to have a list of options
    duration   : req.body.duration, // some time; autopopulate for robot?
    updated_at : Date.now()
    })
    .save( function( err, task, count ){
    res.redirect( '/' );
  });
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
