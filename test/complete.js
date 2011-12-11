/*jslint node:true*/
/*global require:false, beforeEach:false, describe:false, it:false */
describe("complete", function () {
    var complete;
    require('should');

    beforeEach(function () {
        //get a new instance of the complete function
        complete = require("../bin/complext").complete;
    });
    
    it("should export a function called 'complete'", function () {
        complete.should.be.a('function');
    });

    it("should format the completions correctly", function () {
        var result = complete("Ext");
        result.should.match(/^let g:complextions = .*/);
    });

    //it("should complete 'Ex' with ['Ext', 'ExceptionEvent']")
});
