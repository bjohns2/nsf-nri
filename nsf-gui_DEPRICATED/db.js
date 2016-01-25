var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;
var mongooseToCsv = require( 'mongoose-to-csv');
var fs = require("fs");

// var MArray = mongoose.Schema.Types.Array;

// var Todo = new Schema({
//     user_id    : String,
//     content    : String,
//     updated_at : Date
// });

// mongoose.model( 'Todo', Todo );
// mongoose.connect( 'mongodb://localhost/todo' ); //express-todo

var Task = new Schema({
    // agent      : String, // Should be either 'robot' or 'human'; this will need a binary selector
    descript    : String, // Task name; 'grip', 'ungrip', etc.; this will need to have a list of options
    duration    : String, // some time; autopopulate for robot?
    skills      : Array,
    tools       : Array,
    parents     : Array,
    updated_at  : Date,
    arm         : String,
    grasp_effort: String,
    object      : String,
    orientation : String,
    angle       : String,
    position    : String,
    size        : String,
    relativeX   : String,
    relativeY   : String,
    relativeZ   : String,
    order_number : String,
});

Task.plugin(mongooseToCsv, {
  headers: 'ID Descript Duration Skills Skill2 Tools Tool2 Updated_At Parents Arm Grasp_Effort Object Orientation Angle Position Size RelativeX RelativeY RelativeZ OrderNumber',
  constraints: {
    'ID': '_id',
    // 'Agent': 'agent',
    'Descript': 'descript',
    'Duration': 'duration',
    'Skills': 'skills',
    'Tools': 'tools',
    'Parents': 'parents',
    'Updated_At': 'updated_at',
    'Arm': 'arm',
    'Grasp_Effort': 'grasp_effort',
    'Object': 'object',
    'Orientation': 'orientation',
    'Angle': 'angle',
    'Position': 'position',
    'Size': 'size',
    'RelativeX': 'relativeX',
    'RelativeY': 'relativeY',
    'RelativeZ': 'relativeZ',
    'OrderNumber': 'order_number'
  }
  // virtuals: {
  //   'Skills': function(doc) {
  //       return implode(', ',docs.skills)
  //     //   var skills_list = '';
  //     //   for skill in doc.skills:
  //     //       skills_list = skills_list + skill + " ";
  //     // return skills_list;
  //   }
  //}
});

// var TaskS = mongoose.model('TaskS', TaskSchema);


var TaskModel = mongoose.model( 'Task', Task );
mongoose.connect( 'mongodb://localhost/tasks2');


 
