/*jslint node:true evil:true*/

var fs = require('fs'),
    data = fs.readFileSync(__dirname + '/data.js', 'utf8'),
    Docs = {};

eval(data);

function complete(base) {
    var matches = Docs.data.search.filter(function (item) {
            return item.member.substr(0, base.length) === base;
        }),
        completions = matches.map(function (match) {
            return match.member;
        }),
        //note - we don't return everything for empty string
        result = "let g:complextions = " + (base ? JSON.stringify(completions) : '[]');
    return result;
}

exports.complete = complete;
