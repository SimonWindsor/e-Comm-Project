const express = require('express');
const apiRouter = express.Router({mergeParams: true});

const itemsRouter = require('./items');
const usersRouter = require('./users');
const cartRouter = require('./cart');
const purchasesRouter = require('./purchases');
const reviewsRouter = require('./reviews');

apiRouter.use('/items', itemsRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/cart', cartRouter);
apiRouter.use('/purchases', purchasesRouter);
apiRouter.use('/reviews', reviewsRouter)

module.exports = apiRouter;
