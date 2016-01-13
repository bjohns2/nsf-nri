This is a GUI for an MIT/Wisconsin NSF/NRI project. It allows a user to enter in a series of tasks with various parameters, order them, and then send the tasks to a robot. (That last part is still a work in progress.) Other features inclue exporting the tasks to a CSV file and importing such a CSV file of tasks.

## Getting Started

This is built with Node.js, Mongodb, Express.js, and Mongoose. 

Once all dependencies are installed (I'll list them soon), run the app by starting mongodb (run 'mongod' in the mongo directory) and then starting the app (run 'npm start' in the nsf-gui directory). 

## Navigating the file system

## Misc.
message_lookup.json: It is imperative that the order of the parameters for each task be the same order as the server is expecting, ie match the structs file. 

## Copyright and License
Based on [Bare](http://startbootstrap.com/template-overviews/bare/)
Copyright 2013-2015 Iron Summit Media Strategies, LLC. Code released under the [Apache 2.0](https://github.com/IronSummitMedia/startbootstrap-bare/blob/gh-pages/LICENSE) license.# nsf-nri
