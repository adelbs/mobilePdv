const { strNumber, config } = require('./util');
const configObj = config();

function now() {
    const date = new Date();
    let result = `${strNumber(2, date.getDate())}/${strNumber(2, date.getMonth())}/${date.getFullYear()}`;
    result = `${result} ${strNumber(2, date.getHours())}:${strNumber(2, date.getMinutes())}:${strNumber(2, date.getSeconds())}`;
    return result;
}

const logLevel = {
    error: 0,
    info: 1,
    debug: 2
};

function log(level, msg, objError, req) {
    let logMsg = `${now()}: ${msg}`;

    if (logLevel[level] <= logLevel[configObj.log.level]) {
        if (objError) {
            logMsg = `${logMsg}\nError Message: ${objError.message}`;

            try {
                logMsg = `${logMsg}\nError: ${JSON.stringify(objError)}`;
            } catch (err) { }
        }

        if (req) {
            logMsg = `${logMsg}\nURL: ${req.method} ${req.url}`;

            try {
                logMsg = `${logMsg}\nRequest: ${JSON.stringify(req)}`;
            } catch (err) { }            
        }

        console.log(logMsg);
    }

    // TODO
    //format
};

module.exports.error = (msg, objError, req) => log('error', msg, objError, req);
module.exports.info = (msg, objError, req) => log('info', msg, objError, req);
module.exports.debug = (msg, objError, req) => log('debug', msg, objError, req);