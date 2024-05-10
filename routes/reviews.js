const reviewsRouter = require('express').Router();
const {query, getReview, createReview} = require('../db/index.js');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// Show all item's review by item id
reviewsRouter.get('items/:itemId', async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM reviews WHERE item_id = $1', [req.params.itemId]);
    if (result.rows.length > 0) {
      res.status(200).send(result.rows);
    } else {
      res.status(404).send('404 No reviews found!');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Show all user's reviews by username
reviewsRouter.get('users/:username', async (req, res, next) => {
  try {
    const queryText = `
      SELECT reviews.*, users.username
      FROM reviews
      JOIN users ON reviews.user_id = users.id
      WHERE LOWER(users.username) = $1
    `;
    const result = await query(queryText, [req.params.username]);
    if (result.rows.length > 0) {
      res.status(200).send(result.rows);
    } else {
      res.status(404).send(`No reviews found for username: '${req.params.username}'`);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Show item's review by and review id
reviewsRouter.get('/:reviewId', async (req, res, next) => {
  try {
    const review = await getReview(req.params.reviewId);
    if (review) {
      res.status(200).send(review);
    } else {
      res.status(404).send('404 Review not found!')
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Posts a new review
reviewsRouter.post('/items/:itemId', isAuthenticated, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const newReview = await createReview(userId, req.body);
    res.redirect(`/items?itemId=${newReview.id}`);
    res.status(201).send(newReview);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = reviewsRouter;