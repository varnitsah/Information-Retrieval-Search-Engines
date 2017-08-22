
// server.js
// set up ========================
var request = require('request');
var express  = require('express');
var app      = express();                               // create our app w/ express
var morgan = require('morgan');             // log requests to the console (express4)
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)

// configuration =================

app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users

app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());

// listen (start app with node server.js) ======================================


app.listen(8080);
console.log("App listening on port 8080");


// routes ======================================================================

app.post('/api/search', function(req, res) {
    // console.log(req.body);
    console.log("hello");
    var string = req.body.q.replace(" ", "%20");
    var url = "http://localhost:8983/solr/hwcore/select?indent=on&wt=json&q="+string;
    console.log(url);
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.json(response.body);
            // console.log(response.body); // Print the google web page.
        }
    })
    // console.log(req.body);

});

app.post('/api/search2', function(req, res) {
    console.log("here :"+ req.body.q);

    var string = req.body.q.replace(" ", "%20");
    console.log(string)
    var url = "http://localhost:8983/solr/hwcore/select?indent=on&wt=json&sort=pagerank%20desc&q="+string;
    console.log(url);
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.json(response.body);
            // console.log(response.body.length);
        }
    })
    

});
// application -------------------------------------------------------------
// app.get('*', function(req, res) {
//     res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
// });