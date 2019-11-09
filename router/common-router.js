const log = require('../helper/logger');
const express = require('express');
const router = express.Router();

// const url = require('url');
// const fs = require('fs');
// const path = require('path');

// function parseHtml(fileUrl) {
//     let fileContent = fs.readFileSync(fileUrl).toString();
//     let templatePath;

//     let beforeContent;
//     let templateContent;
//     let afterContent;

//     try {
//         while (fileContent.indexOf('<include>') > -1) {
//             templatePath = fileContent.substring(fileContent.indexOf('<include>') + 9, fileContent.indexOf('</include>'));

//             beforeContent = fileContent.substring(0, fileContent.indexOf('<include>'));
//             templateContent = fs.readFileSync(path.join(__dirname, '../www', templatePath)).toString();
//             afterContent = fileContent.substring(fileContent.indexOf('</include>') + 10, fileContent.length);

//             fileContent = `${beforeContent}${templateContent}${afterContent}`;
//         }
//     }
//     catch (err) {
//         fileContent = err.message;
//     }

//     return fileContent;
// }

router.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,session');
    res.setHeader('Access-Control-Allow-Credentials', true);
    log.debug(`${req.method} ${req.url}`, null, req);

    // let pathUrl = url.parse(req.url).pathname;
    // let fileUrl = path.join(__dirname, '../www', pathUrl);
    // let gotoNext = true;

    // if (fileUrl.endsWith('\\') || fileUrl.endsWith('/')) fileUrl = fileUrl.substring(0, fileUrl.length - 1);

    // if (!pathUrl.startsWith('/api') && pathUrl.indexOf('.') == -1) {
    //     gotoNext = false;

    //     if (fs.existsSync(`${fileUrl}.html`)) fileUrl = `${fileUrl}.html`;
    //     else if (fs.existsSync(`${fileUrl}/index.html`)) fileUrl = `${fileUrl}/index.html`;
    //     else gotoNext = true;

    //     if (!gotoNext) res.type('html').send(parseHtml(fileUrl));
    // }

    // if (gotoNext) next();

    next();
});

module.exports = router;