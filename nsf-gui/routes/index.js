var express = require('express');
var router = express.Router();

var mongoose = require( 'mongoose' );
var Todo     = mongoose.model( 'Todo' );

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
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
  console.log("I'm gonna make something!")
  new Todo({
    content    : req.body.content,
    updated_at : Date.now()
    })
    .save( function( err, todo, count ){
    console.log(req.body.content)
    res.redirect( '/' );
  });
};

// query db for all todo items
router.index = function ( req, res ){
  Todo.find( function ( err, todos, count ){
    console.log(todos)
    // console.log(count)
    console.log("Hi!")
    res.render( 'index', {
      title : 'Express Todo Example',
      todos : todos
    });
  });
};

module.exports = router;
