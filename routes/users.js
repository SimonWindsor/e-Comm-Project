const usersRouter = require('express').Router();

// Shows user by id
usersRouter.get('/:id', (req, res, next) => {
  res.send()
});

// Registering a new user
usersRouter.post('/register', (req, res, next) => {

});

// Unregistering a new user
usersRouter.delete('/unregister', (req, res, next) => {

});

module.exports = usersRouter;