const open = require('open');
const log = require('./helper/logger');
const { ips, config } = require('./helper/util');
const mongoose = require('mongoose');

const express = require('express');
const serveStatic = require('serve-static');
const http = require('http');
const https = require('https');
const app = express();

const fs = require('fs');
const path = require('path');

const userRouter = require('./router/ob1-user-router');
const customerRouter = require('./router/pdv-customer-router');
const categoryRouter = require('./router/pdv-category-router');
const productRouter = require('./router/pdv-product-router');
const productItemRouter = require('./router/pdv-productitem-router');
const orderRouter = require('./router/pdv-saleorder-router');

const configObj = config();

log.info(`Aguarde, carregando sistema...`);

const privateKey = fs.readFileSync(path.join(__dirname, 'sslcert/server.key'), 'utf8');
const certificate = fs.readFileSync(path.join(__dirname, 'sslcert/server.cert'), 'utf8');
const credentials = { key: privateKey, cert: certificate };

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,session');
    res.setHeader('Access-Control-Allow-Credentials', true);
    log.debug(`${req.method} ${req.url}`, null, req);

    console.log(req.url);

    next();
});

// app.use(express.static(path.join(__dirname, 'www')));
app.use(serveStatic(path.join(__dirname, 'www'), {
    extensions: ['html']
}));

app.use('/user', userRouter);
app.use('/customer', customerRouter);
app.use('/category', categoryRouter);
app.use('/product', productRouter);
app.use('/productitem', productItemRouter);
app.use('/order', orderRouter);

app.use('/api/*', (req, res) => {
    console.log('api not found');
    res.type('json').send({result: 'not found'});
});

app.use('*', (req, res) => {
    console.log('not found');
    res.type('html').sendFile(path.join(__dirname, 'www', 'teste2.html'));
});


mongoose.connect(configObj.database, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        const httpServer = http.createServer(app);
        const httpsServer = https.createServer(credentials, app);

        httpServer.listen(configObj.httpPort, () => {
            log.info(`Serviço HTTP no ar!`);
            ips().forEach(ip => log.info(`http://${ip}:${configObj.httpPort}`));
            log.info(`--------------------------------------`);

            if (configObj.openHttp) open(`http://localhost:${configObj.httpPort}`);
        });

        httpsServer.listen(configObj.httpsPort, () => {
            log.info(`Serviço HTTPS no ar!`);
            ips().forEach(ip => log.info(`https://${ip}:${configObj.httpsPort}`));
            log.info(`--------------------------------------`);

            if (configObj.openHttps) open(`https://localhost:${configObj.httpsPort}`);
        });
    })
    .catch(err => {
        log.error('Erro ao conectar no banco de dados', err);
    });