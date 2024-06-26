const checkoutRouter = require('express').Router();
const { getCart, createPurchase, getPurchaseById, clearCart } = require('../db/index.js')

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

//Gets the cart contents into the checkout
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
});+

// Creates a new purchase
checkoutRouter.post('/', isAuthenticated, async (req, res, next) => {
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

// Update the quantity of an item at the checkout stage
checkoutRouter.put('/', async (req, res, next) => {
  try {
    const updatedItem = await updateCartItem(req.user.id, req.body.oldVAlue, req.body.newValue);
    res.status(200).send(updatedItem);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Remove item from cart at checkout stage
checkoutRouter.delete('/', async (req, res, next) => {
  try {
    await removeItemFromCart(req.user.id, req.body.item);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Redirect to "Order Complete" page
checkoutRouter.get('/complete', async (req, res) => {
  try {
    const purchase = await getPurchaseById(req.query.purchaseId);

    if (purchase) {
      res.send('Your order is now complete', purchase);
    } else {
      res.status(404).send('Purchase not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = checkoutRouter;