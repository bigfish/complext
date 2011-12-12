/*jslint node:true evil:true*/

var fs = require('fs'),
    data = fs.readFileSync(__dirname + '/data.js', 'utf8'),
    Docs = {};

eval(data);

//private functions
function getKind(type) {
    switch(type) {
        case 'cls':
            return 'c';
        case 'cfg':
            return 'cfg';
        case 'event':
            return 'e';
        case 'method':
            return 'm';
        case 'property':
            return 'p';
        default:
            return '';
    }
}

function isBareWord(word) {
    return word.indexOf('.') === -1;
}

function completeBareword(base) {
    //filter on matching toplevel classnames
    var matches = Docs.data.search.filter(function (item) {
        if (item.type === 'cls' && isBareWord(item.cls) &&
            item.cls.substr(0, base.length) === base) {
            return true;
        } else {
            return false;
        }
    });
    return matches;
}
function getClassData(className) {
    var contents = fs.readFileSync(__dirname + '/../output/' + className + '.js', 'utf8'),
        Ext = {
            data: {
                JsonP: {}
            }
        },
        data;

    Ext.data.JsonP[className.replace('.', '_')] = function (d) {
        data = d;
    };
    eval(contents);
    delete data.html;//very verbose
    return data;

}
//public API
function complete(base) {
    var matches, completions, result, parent, chain, incomplete_member, classData;

    if (isBareWord(base)) {
        matches = completeBareword(base);
    } else {
        chain = base.split('.');
        incomplete_member = chain.pop();
        parent = chain.length === 1 ? chain[0] : chain.join('.');
        //load class data for details
        classData = getClassData(parent);
        //singletons
        if (classData.singleton) {
            //try to find matching members
            matches = classData.members.method.filter(function (item) {
                return item.name.substr(0, incomplete_member.length) === incomplete_member;
            });
            //normalize matches
            matches = matches.map(function (match) {
                return {
                    member: parent + '.' + match.name,
                    type: match.tagname,
                    cls: parent
                };
            });
        } 
    }
    console.log(matches);

    //catch-all: filter on any matching members
    if(!matches || !matches.length) {
        matches = Docs.data.search.filter(function (item) {
            return item.member.substr(0, base.length) === base;
        });
    }
    
    //format output as dictionaries
    completions = matches.map(function (match) {
        return {
            word: match.member,
            kind: getKind(match.type),
            menu: match.cls
        };
    });
    //note - we don't return everything for empty string
    result = "let g:complextions = " + (base ? JSON.stringify(completions) : '[]');
    return result;
}

exports.complete = complete;
