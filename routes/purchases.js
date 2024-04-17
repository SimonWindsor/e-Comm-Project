const purchasesRouter = require('express').Router();
import * as db from '../db/index.js';

// Shows purchase history
purchasesRouter.get('/', (req, res, next) => {

});


// Shows purchase by id
purchasesRouter.get('/:id', (req, res, next) => {

});

module.exports = purchasesRouter;