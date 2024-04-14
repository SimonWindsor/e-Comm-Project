const express = require('express');
const apiRouter = express.Router();

const itemsRouter = require('./items');
const usersRouter = require('./users');
const cartRouter = require('./cart');
const purchasesRouter = require('./purchases');

apiRouter.use('/items', itemsRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/cart', cartRouter);
apiRouter.use('/mpurchases', purchasesRouter);

module.exports = apiRouter;
