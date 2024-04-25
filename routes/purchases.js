const purchasesRouter = require('express').Router();
const {query} = require('../db/index');

// Shows purchase history
purchasesRouter.get('/', (req, res, next) => {

});


// Shows purchase by id
purchasesRouter.get('/:id', async (req, res, next) => {
  const result = await query(`SELECT * FROM purchases WHERE id = ${[req.params.id]}`);
  if(result.rows.length > 0) {
    res.send(result.rows[0]);
  } else {
    res.status(404).send('404 Purchase not found!');
  }
});

module.exports = purchasesRouter;