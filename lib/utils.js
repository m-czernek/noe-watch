/**
 * This is a helper module used for parsing of the junit xml.
 */

'use strict';

function parseBodyXml(xmlBody) {
    const tests = xmlBody.testsuite.testcase;
    
    // Get all fails -> Map them to an array of custom objects
    const fails = tests.filter(function(test) {
        return typeof test.failure !== "undefined"
    }).map(test => ({
        classname:test['$'].classname,
        testname: test['$'].name,
        fail: {
            failMsg: test.failure[0]['$'].message,
            stackTrace: test.failure[0]['_'],
            numOfFails: 1
        }
        })
    );
    const errs = tests.filter(function(test) {
        return typeof test.error !== "undefined"
    }).map(test => ({
        classname:test['$'].classname,
        testname: test['$'].name,
        fail: {
            failMsg: test.error[0]['$'].message,
            stackTrace: test.error[0]['_'],
            numOfFails: 1
        }
        })
    );

    return [...fails, ...errs];
}

function containsFailsOrErrors(xmlBody) {
    const testsuite = xmlBody.testsuite['$'];
    return testsuite.failures !== '0' || testsuite.errors !== '0';
}

module.exports = {
    parseBodyXml,
    containsFailsOrErrors
}