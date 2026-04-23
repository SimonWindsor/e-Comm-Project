const reviewsRouter = require('express').Router();
const { getReviewsByItemId, getReviewsByUser, createReview, updateReview, deleteReview } = require('../db/index.js');
const { validateReview, handleValidationErrors } = require('../middleware/validation');

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// Show all reviews for an item
reviewsRouter.get('/items/:itemId', async (req, res, next) => {
  try {
    const reviews = await getReviewsByItemId(req.params.itemId);
    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
});

// Show all reviews for the logged in user
reviewsRouter.get('/', isAuthenticated, async (req, res, next) => {
  try {
    const reviews = await getReviewsByUser(req.user.email);
    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
});

// Create a new review
reviewsRouter.post('/', isAuthenticated, validateReview, handleValidationErrors, async (req, res, next) => {
  try {
    const newReview = await createReview(req.user.email, req.body);
    res.status(201).json(newReview);
  } catch (error) {
    next(error);
  }
});

// Edit a review
reviewsRouter.put('/:reviewId', isAuthenticated, async (req, res, next) => {
  try {
    const updatedReview = await updateReview(req.params.reviewId, req.body);
    res.status(200).json(updatedReview);
  } catch (error) {
    next(error);
  }
});

// Delete a review
reviewsRouter.delete('/:reviewId', isAuthenticated, async (req, res, next) => {
  try {
    await deleteReview(req.params.reviewId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = reviewsRouter;