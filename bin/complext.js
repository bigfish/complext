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
    //define the function which is called in the data file
    //to capture the data passed as argument
    Ext.data.JsonP[className.replace('.', '_')] = function (d) {
        data = d;
    };
    //evaluate the file, causing the function to be called
    eval(contents);
    delete data.html;//remove very verbose html
    return data;
}

function formatMatches(base, matches) {
    //format output as dictionaries
    
    var prefix = base.indexOf('.') !== -1 ? base.substr(0, base.lastIndexOf('.')) : '',
        completions = matches.map(function (match) {
            return {
                word: (prefix ? prefix + '.' : '') + match.member,
                kind: getKind(match.type),
                menu: match.cls
            };
        }),
        result = "let g:complextions = " + (base ? JSON.stringify(completions) : '[]');
    return result;
}

//public API
function complete(base) {
    var matches, completions, result, parent, chain, members, incomplete_member, classData, matchingClasses;
    fs.writeFileSync(__dirname + '/log.txt', base + "\n");
    if (isBareWord(base)) {
        matches = completeBareword(base);
    } else {
        chain = base.split('.');
        incomplete_member = chain.pop();
        parent = chain.length === 1 ? chain[0] : chain.join('.');
        
        //if incomplete part starts with capital
        //try to find matching class
        if (/^[A-Z]/.test(incomplete_member)) {
            matchingClasses = Docs.data.search.filter(function (item) {
                var itemParent = item.cls.split('.');
                itemParent.pop();
                itemParent = itemParent.join('.');
                if(item.type === 'cls') {
                    return (itemParent === parent &&
                            item.member.substr(0, incomplete_member.length) === incomplete_member);

                } else {
                    return false;
                }
            });
        }

        if(matchingClasses && matchingClasses.length) {
            //normalize matches
            return formatMatches(base, matchingClasses);
        }

        //load class data for details
        classData = getClassData(parent);
        //singletons
        if (classData.singleton) {
            //try to find matching members
            //combine properties and methods
            members = classData.members.method.concat(classData.members.property);
            matches = members.filter(function (item) {
                return item.name.substr(0, incomplete_member.length) === incomplete_member;
            });
            //normalize matches
            matches = matches.map(function (match) {
                return {
                    member: match.name,
                    type: match.tagname,
                    cls: parent
                };
            });
        } 
    }
    //catch-all: filter on any matching members
    if(!matches || !matches.length) {
        matches = Docs.data.search.filter(function (item) {
            return item.member.substr(0, base.length) === base;
        });
    }
    return formatMatches(base, matches);

}

exports.complete = complete;
