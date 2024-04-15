const express = require('express');
const apiRouter = express.Router();

const itemsRouter = require('./items');
const usersRouter = require('./users');
const cartRouter = require('./cart');
const checkoutRouter = require('./checkout');
const purchasesRouter = require('./purchases');

apiRouter.use('/items', itemsRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/cart', cartRouter);
apiRouter.use('/checkout', checkoutRouter);
apiRouter.use('/purchases', purchasesRouter);

module.exports = apiRouter;
