const { Pool } = require('pg');
 
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Daintree Store',
  password: 'postgres',
  port: 5432,
});

pool.connect();

// For making database queries. Use async/await upon calling outside this module
const query = (text, params, callback) => {
  try {
    return pool.query(text, params, callback);
  } catch (err) {
    console.log(err);
  }
};

const getClient = () => {
  return pool.connect()
};

// Returns either a user object or a false value. Use async/await upon calling
 
const getUserById = (id) => {
  try { 
    const result = query(`SELECT * FROM users WHERE id = ${id}`);

    if (result.rows.length === 0) {
      return false;
    } else {
      return result.rows[0];
    }
  } catch (error) {
    console.error(error);
    throw new Error('Error retrieving user by ID');
  }
};

// Returns either a user object or a false value. Use async/await upon calling
const getUserByUsername = async (username) => {
  try {
    const result = await query('SELECT * FROM users WHERE LOWER(username) = $1', [username]);
    console.log(result.rows);

    if (result.rows.length === 0) {
      return false;
    } else {
      return result.rows[0];
    }
  } catch (error) {
    console.error(error);
    throw new Error('Error retrieving user by username');
  }
};

// Returns either an item object or a false value. Use async/await upon calling
const getItemById = async (id) => {
  try {
    const result = await query(`SELECT * FROM items WHERE id = ${id}`);

    if (result.rows.length === 0) {
      return false;
    } else {
      return result.rows[0];
    }
  } catch (error) {
    // Handle any errors that occur during the database query
    console.error(error);
    throw new Error('Error retrieving item by ID');
  }
};

// Returns items a user searchs for or a false value. Use async/await upon calling
const getItemsFromSearch = async (searchTerms) => {
  try {
    let allWords = searchTerms.match(/(?:[^\s,"]+|"[^"]*")+/g);
    allWords = allWords.filter(element => {return element != '+'});
    console.log(allWords);
    const results = allWords.map(async (word) => {
      return await query(`SELECT * FROM items WHERE LOWER(name) LIKE '%${word}%'`)
    });
    console.log(results);

    if (results.rows.length = 0) {
      return false;
    } else {
      return results.rows;
    }
  } catch (error) {
    throw new Error('Error retrieving search');
  }
};

const addItemToCart = (itemId) => {

};

const removeItemFromCart = (itemId) => {

};

module.exports = {
  query,
  getClient,
  getUserById,
  getUserByUsername,
  getItemById,
  getItemsFromSearch
};

// Below is just an example of how to do a query and log it to console
// I've tried using try/catch in query() in case of any errors

// pool.query('SELECT * FROM items;', (err, res) => {
//   if(!err) {
//     console.log(res.rows);
//   } else {
//     console.log(err.message);
//   }
// })