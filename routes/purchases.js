const purchasesRouter = require('express').Router();
const {query, getPurchaseById, createPurchase, clearCart} = require('../db/index.js');

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
    const result = await query(`SELECT * FROM purchases WHERE user_email = $1 ORDER BY timestamp`, [req.user.email]);
    if(result.rows.length > 0) {
      res.send(result.rows);
    } else {
      res.status(404).send('404 No purchases found!');
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});


// Shows purchase by id but uses req.user.email so that it can only be shown if user is logged in
purchasesRouter.get('/:id', isAuthenticated, async (req, res, next) => {
  try {  
    const purchase = await getPurchaseById(req.user.email, req.params.id);
    if (purchase) {
      res.send(purchase);
    } else {
      res.status(404).send('404 Purchase not found!');
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// Creates a new purchase
purchasesRouter.post('/', isAuthenticated, async (req, res, next) => {
  try {
    const newPurchase = await createPurchase(req.body);
    if (newPurchase) {
      await clearCart(req.user.email);
      res.status(201).json({
        msg: 'Purchase completed successfully',
        purchaseId: newPurchase.id
      });
    } else {
      res.status(500).json({
        msg: 'Purchase not completed'
      });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = purchasesRouter;