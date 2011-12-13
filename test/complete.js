/*jslint node:true*/
/*global should:false, require:false, beforeEach:false, describe:false, it:false */
describe("complete", function () {
    var complete = require("../bin/complext").complete,
        should = require('should');

    function parseResult(r) {
        var arrStr = r.split("=")[1].trim();
        return JSON.parse(arrStr);
    }

    it("should export a function called 'complete'", function () {
        complete.should.be.a('function');
    });

    it("should format the completions correctly", function () {
        var result = complete("Ext");
        result.should.match(/^let g:complextions = .*/);
    });

    it("should complete 'Ex' with ['Ext', 'ExceptionEvent']", function () {
        var result = complete("Ex"),
            results = parseResult(result);
        should.exist(results[0].word);
        results[0].word.should.eql("Ext");
    });

    it("should return an array of objects of with the right properties", function () {
        var result = complete("Ex"),
            results = parseResult(result);
        results[0].word.should.eql("Ext");
        should.exist(results[0].menu);
        results[0].menu.should.eql("Ext");
        should.exist(results[0].kind);
        results[0].kind.should.eql("c");
    });
    
    it("should complete capitalized barewords with top-level classes", function () {
        var result = complete("Ar"),
            results = parseResult(result);
        results.length.should.eql(1);
    });

    it("should complete class members", function () {
        var result = complete("Ext.cr"),
            results = parseResult(result);

        results[0].word.should.eql("Ext.create");
    });

    it("should complete class properties", function () {
        var result = complete("Ext.enableF"),
            results = parseResult(result);

        results[0].word.should.eql("Ext.enableFx");
    });

    it("should complete child classes of Ext", function () {
        var result = complete("Ext.Arr"),
            results = parseResult(result);

        results[0].word.should.eql("Ext.Array");

    });


});
