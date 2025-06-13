const purchasesRouter = require('express').Router();
const {query, getPurchaseById} = require('../db/index.js');

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
      res.send(result.rows);
    } else {
      res.status(404).send('404 No purchases found!');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


// Shows purchase by id but uses req.user.id so that it can only be shown if use is logged in
purchasesRouter.get('/:id', isAuthenticated, async (req, res, next) => {
  try {  
    const purchase = await getPurchaseById(req.user.id, req.params.id);
    if (purchase) {
      res.send(purchase);
    } else {
      res.status(404).send('404 Purchase not found!');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Creates a new purchase
purchasesRouter.post('/', isAuthenticated, async (req, res, next) => {
  try {
    const newPurchase = await createPurchase(req.body);
    if (newPurchase) {
      await clearCart(newPurchase.id);
      res.status(201).redirect(`/complete?purchaseId=${newPurchase.id}`);
    } else {
      res.status(500).json({
        msg: 'Purchase not completed'
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = purchasesRouter;