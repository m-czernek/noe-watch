function parseBodyXml(xmlBody) {
    const tests = xmlBody.testsuite.testcase
    
    // Get all fails -> Map them to an array of custom objects
    return tests.filter(function(test) {
        return typeof test.failure != "undefined"
    }).map(test => ({
        classname:test['$'].classname,
        testname: test['$'].name,
        fail: {
            failMsg: test.failure[0]['$'].message,
            stackTrace: test.failure[0]['_'],
            numOfFails: 1
        }
        })
    )
}

function containsFails(xmlBody) {
    return xmlBody.testsuite['$'].failures !== '0'
}

module.exports = {
    parseBodyXml,
    containsFails
}