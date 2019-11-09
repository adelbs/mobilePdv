// LIBS - START
const os = require('os');
const open = require('open');
const log = require('./helper/logger');
const { ips, config } = require('./helper/util');
const mongoose = require('mongoose');

const express = require('express');
const http = require('http');
const https = require('https');
const app = express();

const fs = require('fs');
const path = require('path');

const commonRouter = require('./router/common-router');
const apiRouter = require('./router/api-router');
// LIBS = END

log.info(`Aguarde, carregando sistema...`);

const configObj = config();
const privateKey = fs.readFileSync(path.join(__dirname, 'sslcert/server.key'), 'utf8');
const certificate = fs.readFileSync(path.join(__dirname, 'sslcert/server.cert'), 'utf8');
const credentials = { key: privateKey, cert: certificate };

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(commonRouter);

// Static e API routers
app.use(express.static(path.join(__dirname, 'www')));
app.use('/api', apiRouter);

// 404
app.use('/api/*', (req, res) => res.status(404).type('application/json').send({ result: 'not found' }));
app.use('*', (req, res) => res.status(404).type('html').sendFile(path.join(__dirname, 'www', 'errors', '404.html')));

mongoose.connect(configObj.database.url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        let server;
        let pref;

        if (configObj.server.ssl) server = https.createServer(credentials, app);
        else server = http.createServer(app);

        pref = (configObj.server.ssl) ? 'https://' : 'http://';
        server.listen(configObj.server.port, () => {
            log.info(`Aplicação no ar! Endereços:`);
            log.info(`${pref}${os.hostname()}:${configObj.server.port} (PADRÃO)`);
            ips().forEach(ip => log.info(`${pref}${ip}:${configObj.server.port}`));
            log.info(`--------------------------------------`);

            if (configObj.server.open) open(`${pref}${os.hostname()}:${configObj.server.port}`);
        });
    })
    .catch(err => {
        log.error('Erro ao conectar no banco de dados', err);
    });