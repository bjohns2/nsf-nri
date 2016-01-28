## About this Project

This is a GUI for an MIT/Wisconsin NSF/NRI project. It allows a user to enter in a series of tasks with various parameters, order them, and then send the tasks to a robot.

## Getting Started

This is built with Node.js, Mongodb, Express.js, Mongoose, Mongolab, and Bootstrap. A version is hosted on Heroku.  

Once all dependencies are installed (listed in package.json, installed by running "npm install"), run the app by running 'npm start' in the nsf-nri directory. This will run the GUI on localhost. It is currently hosted on heroku at nsf-nri.herokuapp.com. 

## Navigating the file system
public/: stylesheets, common javascript, and currently the json for storing task parameters and details; very little 
routes/: backend processing for each web page
static/: front-end javascript written exclusively for this app 
views/: the HTML (technically ejs) files for each web page
app.js: configuration for serving the app
db.js: database configuration and connection
package.json: dependencies/requirements for this app; running "npm install" installs all of these



## Misc.
message_lookup.json: It is imperative that the order of the parameters for each task be the same order as the server is expecting, ie match the structs file. 

## Copyright and License
Based on [Bare](http://startbootstrap.com/template-overviews/bare/)
Copyright 2013-2015 Iron Summit Media Strategies, LLC. Code released under the [Apache 2.0](https://github.com/IronSummitMedia/startbootstrap-bare/blob/gh-pages/LICENSE) license.# nsf-nri
