const itemsRouter = require('express').Router();
const { getAllItems, getAllCategories, getItemById, getAllItemPictures, getItemsByCategory, getItemsFromSearch } = require('../db/index.js');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// Get all items
itemsRouter.get('/', async (req, res, next) => {
  try {
    const items = await getAllItems();
    items.length > 0
      ? res.status(200).json(items)
      : res.status(404).json({ message: 'No items found' });
  } catch (error) {
    next(error);
  }
});


// Show item by id
itemsRouter.get('/id/:id', async (req, res, next) => {
  try {
    const result = await getItemById(req.params.id);
    if (result) {
      res.status(200).send(result);
    } else {
      res.status(404).send('404 Item not found!');
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// Get all an item's pictures
itemsRouter.get('/pictures/:id', async (req, res, next) => {
  try {
    const pictures = await getAllItemPictures(req.params.id);
    if (pictures) {
      res.status(200).send(pictures);
    } else {
      res.status(404).send('404 Pictures not found!');
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// Get all categories
itemsRouter.get('/allcategories', async (req, res, next) => {
  try {
    const categories = await getAllCategories();
    categories.length > 0
      ? res.status(200).json(categories)
      : res.status(404).json({ message: 'No categories found' });
  } catch (error) {
    next(error);
  }
});

// Get items by category
itemsRouter.get('/categories/:category', async (req, res, next) => {
  try {
    const items = await getItemsByCategory(req.params.category);
    if (items) {
      res.status(200).send(items);
    } else {
      res.status(404).send('404 Categories not found!');
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// Show items from search
itemsRouter.get('/search/:searchTerms', async (req, res, next) => {
  try {
    const results = await getItemsFromSearch(req.params.searchTerms);
    if (results) {
      res.status(200).send(results);
    } else {
      res.send(`Could not find any items based on your search: '${req.params.searchTerms}'`);
    }
  } catch (error) {
    console.error(error);
    console.error('Error in GET /categories:', error.message, error.stack);
    res.status(500).send('Internal Server Error');
  }
});

// For adding an item into the database- this is for admins only!
//add later

// For modifying an item in database - this is for admins only!
//add later

// For removing an item from database - this is for admins only!
//add later

module.exports = itemsRouter;
