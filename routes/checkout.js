const checkoutRouter = require('express').Router();
const { getCart, createPurchase, getPurchaseById } = require('../db/index.js')

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

checkoutRouter.get('/', isAuthenticated, async (req, res, next) => {
  try {
    const cart = await getCart(req.user.id);
    
    if (cart) {
      res.send(cart);
    } else {
      res.status(404).send('404 Cart not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

checkoutRouter.post('/', isAuthenticated, async (req, res, next) => {
  try {
    const newPurchase = await createPurchase(req.body);
    if (newPurchase) {
      res.redirect(`/complete?purchaseId=${newPurchase.id}`);
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

checkoutRouter.put('/', async (req, res, next) => {
  try {
    await updateCartItem(req.user.id, req.body.oldVAlue, req.body.newValue);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Redirect to "Order Complete" page
checkoutRouter.get('/complete', async (req, res) => {
  try {
    const purchase = await getPurchaseById(req.query.purchaseId);
    res.render('Your order is now complete', purchase);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = checkoutRouter;