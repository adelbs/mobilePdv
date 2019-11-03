var os = require('os');
var fs = require('fs');
var ifaces = os.networkInterfaces();

function ips() {
    const ips = [];
    Object.keys(ifaces).forEach(function (ifname) {
        var alias = 0;

        ifaces[ifname].forEach(function (iface) {
            if ('IPv4' !== iface.family || iface.internal !== false) {
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                return;
            }

            if (alias >= 1) {
                // this single interface has multiple ipv4 addresses
                // console.log(ifname + ':' + alias, iface.address);
                ips.push(iface.address);
            }
            else {
                // this interface has only one ipv4 adress
                // console.log(ifname, iface.address);
                ips.push(iface.address);
            }

            ++alias;
        });
    });

    return ips;
}

function config() {
    let configObj = {
        httpPort: 8080,
        httpsPort: 8443,
        openHttp: false,
        openHttps: true,
        database: 'mongodb://localhost/mobilepdv',
        log: {
            level: 'info' //error, info, debug
        }
    };

    if (!fs.existsSync('config.json'))
        fs.writeFileSync('config.json', JSON.stringify(configObj));
    else
        configObj = JSON.parse(fs.readFileSync('config.json'));

    return configObj;
}

function strNumber(qtdDigits, number) {
    let str = String(number);
    for (let i = str.length; i < qtdDigits; i++)
        str = `0${str}`;
    return str;
}

function currencyValue(value) {
    let newVal = value.replace('R$ ', '');
    newVal = newVal.replace('.', '');
    newVal = newVal.replace(',', '.');
    return Number(newVal);
}

module.exports.strNumber = strNumber;
module.exports.ips = ips;
module.exports.config = config;
module.exports.currencyValue = currencyValue;