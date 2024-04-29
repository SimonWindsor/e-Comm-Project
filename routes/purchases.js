const purchasesRouter = require('express').Router();
const {query} = require('../db/index');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// Shows purchase history
purchasesRouter.get('/', isAuthenticated, async (req, res, next) => {
  try {  
    const result = await query(`SELECT * FROM purchases WHERE user_id = ${req.user.id} ORDER BY timestamp`);
    if(result.rows.length > 0) {
      res.send(result.rows[0]);
    } else {
      res.status(404).send('404 Purchase not found!');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


// Shows purchase by id
purchasesRouter.get('/:id', async (req, res, next) => {
  try {  
    const result = await query(`SELECT * FROM purchases WHERE id = ${req.params.id}`);
    if(result.rows.length > 0) {
      res.send(result.rows[0]);
    } else {
      res.status(404).send('404 Purchase not found!');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = purchasesRouter;