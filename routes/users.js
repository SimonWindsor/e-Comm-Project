const usersRouter = require('express').Router();
const {query, getUserById, getUserByUsername} = require('../db/index');

// Shows user by username
usersRouter.get('/:username', async (req, res, next) => {
  // Quotes are needed around the template variable as the SQL is searching for text
  const user = await getUserByUsername(req.params.username);
  if(user) {
    res.send(user);
  } else {
    res.status(404).send('404 User not found!');
  }
});

// Registering a new user
usersRouter.post('/register', (req, res, next) => {

});

// Unregistering a new user
usersRouter.delete('/unregister/:id', (req, res, next) => {

});

module.exports = usersRouter;