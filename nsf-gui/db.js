var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;

// var Todo = new Schema({
//     user_id    : String,
//     content    : String,
//     updated_at : Date
// });

// mongoose.model( 'Todo', Todo );
// mongoose.connect( 'mongodb://localhost/todo' ); //express-todo

var Task = new Schema({
    agent      : String, // Should be either 'robot' or 'human'; this will need a binary selector
    type       : String, // Task name; 'grip', 'ungrip', etc.; this will need to have a list of options
    duration   : String, // some time; autopopulate for robot?
    updated_at : Date
});

mongoose.model( 'Task', Task );
mongoose.connect( 'mongodb://localhost/tasks');
