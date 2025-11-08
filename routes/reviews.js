const reviewsRouter = require('express').Router();
const {query, getReview, createReview, updateReview, deleteReview} = require('../db/index.js');
const { validateReview, handleValidationErrors } = require('../middleware/validation');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// Show all item's review by item id
reviewsRouter.get('/:itemId', async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM reviews WHERE item_id = $1', [req.params.itemId]);
    if (result.rows.length > 0) {
      res.status(200).send(result.rows);
    } else {
      res.status(404).send('404 No reviews found!');
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// Show all user's reviews
reviewsRouter.get('/', async (req, res, next) => {
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
    next(error);
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
    next(error);
  }
});

// Posts a new review
reviewsRouter.post('/', isAuthenticated, validateReview, handleValidationErrors, async (req, res, next) => {
  try {
    const newReview = await createReview(req.user.email, req.body);
    res.status(201).send(newReview);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// Edits a review
reviewsRouter.put('/:reviewId', isAuthenticated, async(req, res, next) => {
  try {
    const updatedReview = await updateReview(req.params.reviewId, req.body);
    res.status(200).send(updatedReview);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// Deletes a review
reviewsRouter.delete('/:reviewId', isAuthenticated, async(req, res, next) => {
  try {
    await deleteReview(req.params.reviewId);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = reviewsRouter;