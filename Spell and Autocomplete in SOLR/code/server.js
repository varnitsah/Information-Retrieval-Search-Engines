
// server.js
// set up ========================
var request = require('request');
var express  = require('express');
var app      = express();                               // create our app w/ express
var morgan = require('morgan');             // log requests to the console (express4)
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
var fs = require('fs');
var NorvigSpellChecker = function () {
    var that = {},
        filter = /([a-z]+)/g,
        alphabets = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'],
        NWORDS = {};//Training Model
    
    var train = function(trainingText) {
        var features = trainingText.match(filter);
        for(var f in features) {
            var feature = features[f];
            if (NWORDS.hasOwnProperty(feature)) {
                NWORDS[feature] += 1;
            }
            else {
                NWORDS[feature] = 1;
            }
        }
    };
    
    var edits1 = function (words) {
        var edits1Set = [];
        for(var w = 0; w < words.length; w++) {
            var word = words[w];
            for (var i = 0; i <= word.length; i++) {
                //splits (a & b)
                var a = word.slice(0,i),
                    b = word.slice(i),
                    c = b.slice(1),
                    d = b.slice(2);
                if (b != '') {
                    //deletes
                    edits1Set.push(a + c);
                    //transposes
                    if (b.length > 1) {
                        edits1Set.push(a + b.charAt(1) + b.charAt(0) + d);
                    }
                    //replaces & inserts
                    for (var j = 0; j < alphabets.length; j++) {
                        edits1Set.push(a + alphabets[j] + c);//replaces
                        edits1Set.push(a + alphabets[j] + b);//inserts
                    }
                }
                else {
                    //inserts (remaining set for b == '')
                    for (var j = 0; j < alphabets.length; j++) {
                        edits1Set.push(a + alphabets[j] + b);
                    }
                }
            }
        }
        return edits1Set;
    };
    
    var edits2 = function (words) {
        return edits1(edits1(words));
    };

    Object.prototype.isEmpty = function () {
        var that = this;
        for(var prop in that) {
            if(that.hasOwnProperty(prop))
                return false;
        }
        return true;
    };

    Function.prototype.curry = function () {
        var slice = Array.prototype.slice,
            args = slice.apply(arguments),
            that = this;
        return function () {
            return that.apply(null, args.concat(slice.apply(arguments)));
        };
    };
    
    var known = function () {
        var knownSet = {};
        for (var i = 0; knownSet.isEmpty() && i < arguments.length; i++) {
            var words = arguments[i];
            for (var j = 0; j < words.length; j++) {
                var word = words[j];
                if (!knownSet.hasOwnProperty(word) && NWORDS.hasOwnProperty(word)) {
                    knownSet[word] = NWORDS[word];
                }
            }
        }
        return knownSet;
    };
    
    var max = function(candidates) {
        var maxCandidateKey = null,
            maxCandidateVal = 0,
            currentCandidateVal;
        for (var candidate in candidates) {
            currentCandidateVal = candidates[candidate];
            if (candidates.hasOwnProperty(candidate) && currentCandidateVal > maxCandidateVal) {
                maxCandidateKey = candidate;
                maxCandidateVal = currentCandidateVal;
            }
        }
        return maxCandidateKey;
    };

    var correct = function () {
        var corrections = {};
        for (var i = 0; i < arguments.length; i++) {
            var word = arguments[i];
            var candidates = known.curry()([word],edits1([word]),edits2([word]));
            corrections[word] = candidates.isEmpty() ? word : max(candidates);
        }
        return corrections;
    };
    
    that.train = train;
    that.correct = correct.curry();
    
    return that;
};


var htmlToText = require('html-to-text');


// configuration =================

app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users

app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());

// listen (start app with node server.js) ======================================


app.listen(8080);
console.log("Port 8080 assigned");


var nsc = NorvigSpellChecker();
filename = "big.txt";
var trainingText="";
var a ;
fs.readFile(filename, 'utf8', function(err, data) {
    if (err) throw err;
    console.log("Training..Please wait");
    trainingText =data;
    a=trainingText.length;
    var t1 = new Date();
    nsc.train(trainingText);
    var t2 = new Date();    
    console.log("Training Complete. Time elapsed: " + (t2-t1).toString() + " msec");
    console.log(nsc.correct("Berxit","assalt","angeles","imigration"));
    console.log( nsc.correct("acess", "accesing", "accomodation", "acommodation", "acomodation", "acount"));
    console.log("Listening on port 8080");
});





// x = nsc.correct("berxit");

// console.log(x);

app.post('/api/correct', function(req, res) {
    // console.log("spell check");
    var input= req.body.q;
    var op=nsc.correct(input);
    // console.log(op);
    res.json(op);
    // var output={
    //       abc:op    
    // };
    // res.json(output);

});


app.post('/api/snippet', function(req, res) {
    var list= req.body.l;
    var ip=req.body.q;
    var file = list.split("\n");
    var output=[];
    var i=0;
    htmlToText.fromFile(file[i], (err, text) => {
        if (err) return console.error(err);var splits=[];
        splits=text.split("\n");
        for(j=0;j<splits.length;j++){
            var line=splits[j];if(line.includes(ip)) break;
        }
        output.push(splits[j]);
        i++;
        htmlToText.fromFile(file[i], (err, text) => {
        if (err) return console.error(err);var splits=[];
        splits=text.split("\n");
        for(j=0;j<splits.length;j++){
            var line=splits[j];if(line.includes(ip)) break;
        }
        output.push(splits[j]);
        i++;
        htmlToText.fromFile(file[i], (err, text) => {
        if (err) return console.error(err);var splits=[];
        splits=text.split("\n");
        for(j=0;j<splits.length;j++){
            var line=splits[j];if(line.includes(ip)) break;
        }
        output.push(splits[j]);
        i++;
        htmlToText.fromFile(file[i], (err, text) => {
        if (err) return console.error(err);var splits=[];
        splits=text.split("\n");
        for(j=0;j<splits.length;j++){
            var line=splits[j];if(line.includes(ip)) break;
        }
        output.push(splits[j]);
        i++;
        htmlToText.fromFile(file[i], (err, text) => {
        if (err) return console.error(err);var splits=[];
        splits=text.split("\n");
        for(j=0;j<splits.length;j++){
            var line=splits[j];if(line.includes(ip)) break;
        }
        output.push(splits[j]);
        i++;
        htmlToText.fromFile(file[i], (err, text) => {
        if (err) return console.error(err);var splits=[];
        splits=text.split("\n");
        for(j=0;j<splits.length;j++){
            var line=splits[j];if(line.includes(ip)) break;
        }
        output.push(splits[j]);
        i++;
        htmlToText.fromFile(file[i], (err, text) => {
        if (err) return console.error(err);var splits=[];
        splits=text.split("\n");
        for(j=0;j<splits.length;j++){
            var line=splits[j];if(line.includes(ip)) break;
        }
        output.push(splits[j]);
        i++;
        htmlToText.fromFile(file[i], (err, text) => {
        if (err) return console.error(err);var splits=[];
        splits=text.split("\n");
        for(j=0;j<splits.length;j++){
            var line=splits[j];if(line.includes(ip)) break;
        }
        output.push(splits[j]);
        i++;
        htmlToText.fromFile(file[i], (err, text) => {
        if (err) return console.error(err);var splits=[];
        splits=text.split("\n");
        for(j=0;j<splits.length;j++){
            var line=splits[j];if(line.includes(ip)) break;
        }
        output.push(splits[j]);
        i++;
        htmlToText.fromFile(file[i], (err, text) => {
        if (err) return console.error(err);var splits=[];
        splits=text.split("\n");
        for(j=0;j<splits.length;j++){
            var line=splits[j];if(line.includes(ip)) break;
        }
        output.push(splits[j]);
        i++;
        console.log(output);
        var retval={
             t:output
        }    
        res.json(retval);
    });
    });
    });
    });
    });
    });
    });
    });
    });
    });
    
    //    
});

app.post('/api/search', function(req, res) {
    var string = req.body.q.replace(" ", "%20");
    var c=req.body.c;
    var url="";
    if(c=="1")
        url = "http://localhost:8983/solr/hwcore/select?indent=on&wt=json&q="+string;
    else
        url = "http://localhost:8983/solr/hwcore/select?indent=on&wt=json&sort=pagerank%20desc&q="+string;

    // console.log(string);
    // console.log(url);
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.json(response.body);
            console.log(response.body.response);
        }
    })
});

app.post('/api/complete', function(req, res) {
    
    // console.log(req.body.q);
    var string = req.body.q.replace(" ","%20");
    var url = "http://localhost:8983/solr/hwcore/suggest?indent=on&wt=json&q="+string;
    // console.log(string);
    // console.log(url);
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // console.log(response.body);

            res.json(response.body);
        }
    })
});

// http://localhost:8983/solr/hwcore/suggest?indent=on&q=bre&wt=json
// http://localhost:8983/solr/hwcore/suggest?indent=on&wt=json&q=Brex