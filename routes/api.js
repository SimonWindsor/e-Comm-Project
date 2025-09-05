const express = require('express');
const apiRouter = express.Router({mergeParams: true});

const itemsRouter = require('./items');
const cartRouter = require('./cart');
const purchasesRouter = require('./purchases');
const reviewsRouter = require('./reviews');

apiRouter.use('/items', itemsRouter);
apiRouter.use('/cart', cartRouter);
apiRouter.use('/purchases', purchasesRouter);
apiRouter.use('/reviews', reviewsRouter)

module.exports = apiRouter;
