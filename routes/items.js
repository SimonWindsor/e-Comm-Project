const itemsRouter = require('express').Router();
const {query, getItemById, getAllItemPictures, getItemsByCategory, getItemsFromSearch} = require('../db/index.js');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// Get all items with their main picture
itemsRouter.get('/', async (req, res, next) => {
  try {
    const result = await query(`
      SELECT i.*, ip.file As picture FROM items i
      JOIN item_pictures ip
      ON i.id = ip.item_id
      WHERE ip.main_picture = TRUE`);
    if (result.rows.length > 0) {
      res.status(200).send(result.rows);
    } else {
      res.status(404).send('404 No items found!');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Show item by id
itemsRouter.get('/id/:id', async (req, res, next) => {
  try {
    const item = await getItemById(req.params.id);
    if (item) {
      res.status(200).send(item);
    } else {
      res.status(404).send('404 Item not found!');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Get all an item's pictures
itemsRouter.get('/pictures/:id', async (req, res, next) => {
  try {
    const item = await getAllItemPictures(req.params.id);
    if (item) {
      res.status(200).send(item);
    } else {
      res.status(404).send('404 Pictures not found!');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Get all categories
itemsRouter.get('/allcategories', async (req, res, next) => {
  try {
    const result = await query(`SELECT category FROM items GROUP BY category`);
    if (result.rows.length > 0) {
      res.status(200).send(result.rows);
    } else {
      res.status(404).send('404 Category not found!');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
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
    res.status(500).send('Internal Server Error');
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