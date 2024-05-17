const usersRouter = require('express').Router();
const {getUserByUsername} = require('../db/index.js');

// Shows user by username. This is likely to only be for admins
usersRouter.get('/:username', async (req, res, next) => {
  // Quotes are needed around the template variable as the SQL is searching for text
  const user = await getUserByUsername(req.params.username);
  if(user) {
    res.send(user); // This may need to be changed so passwords or other private data is sent
  } else {
    res.status(404).send('404 User not found!');
  }
});

module.exports = usersRouter;