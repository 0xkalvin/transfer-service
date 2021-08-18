require('../../lib/tracer').init();
const express = require('express');
const helmet = require('helmet');

const errorHandler = require('./middlewares/error-handler');
const httpLogger = require('./middlewares/http-logger');
const wrapAsync = require('./middlewares/wrap-async');
const traceInjector = require('./middlewares/trace-injector');

const accountController = require('./controllers/account');
const transferController = require('./controllers/transfer');

const application = express();

application.use(express.json());
application.use(helmet());
application.get('/_health_check_', (_, response) => response.sendStatus(200));
application.use(traceInjector);
application.use(httpLogger);

application.post('/accounts', wrapAsync(accountController.create));
application.get('/accounts/:id', wrapAsync(accountController.show));
application.get('/accounts/:id/transfers', wrapAsync(accountController.listTransfers));
application.post('/transfers', wrapAsync(transferController.create));
application.use(errorHandler);

module.exports = application;
