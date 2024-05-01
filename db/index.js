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
  } catch (error) {
    console.error(error);
  }
};

const getClient = () => {
  return pool.connect()
};

// Returns either a user object or a false value. Use async/await upon calling
const getUserById = async (id) => {
  try { 
    const result = await query(`SELECT * FROM users WHERE id = ${id}`);

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
    const result = await query('SELECT * FROM users WHERE LOWER(username) = $1', [username].toLowerCase());
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

// Returns new user object ot a false value. Use async/await upson calling
const createUser = async (userBodyObject) => {
  try {
    // Destructure user object
    const {
      username,
      email,
      first_name, 
      last_name, 
      phone_number, 
      address, // this will be an object
      password
    } = userBodyObject;
    // Check if user already exists
    const user = await getUserByUsername(username);

    if (user) {
      throw new Error('User already exists');
    } else {
      // Create user id - to be updated later
      const id = Math.floor(Math.random * 2000000000);
      // Obtain address id and create if it doesn't exist
      let address_id = await findAddressId(
        address.number_street,
        address.locality,
        address.state_province,
        address.country,
        address.zipcode
      );

      if(!address_id) {
        address_id = await createAddress(
          address.number_street,
          address.locality,
          address.state_province,
          address.country,
          address.zipcode
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const insertParams = [username, email, first_name, last_name, phone_number, address_id, id, hashedPassword];
      const newUser = await query(
        'INSERT INTO users (username, email, first_name, last_name, phone_number, address_id, id, password) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        insertParams
      );
      return newUser;
    }
  } catch (error) {
    console.error(error);
    throw new Error('Error creating user');
  }
};

// Finds address id or false value. Use async/await upson calling
const findAddressId = async (number_street, locality, state_province, country, zipcode) => {
  try {
    const insertParams = [
      number_street.toLowerCase(), 
      locality.toLowerCase(), 
      state_province.toLowerCase(), 
      country.toLowerCase(), 
      zipcode.toLowerCase()
    ];
    const result = await query(
      'SELECT id FROM addresses WHERE LOWER(number_street) = $1 AND LOWER(locality) = $2, AND LOWER(state_province) = $3 AND LOWER(country) = $4 AND LOWER(zipcode) = $5',
      insertParams
    );

    if (result.rows.length > 0) {
      return result.rows[0].id;
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
    throw new Error('Error finding address');
  }
};

// Creates a new address and returns id. Use async/await upon calling
const createAddress = async (number_street, locality, state_province, country, zipcode) => {
  try {
    // Create address id - to be updated later
    const id = Math.floor(Math.random * 2000000000);
    const insertParams = [id, number_street, locality, state_province, country, zipcode];
    await query(
      'INSERT INTO addresses (id, number_street, locality, state_province, country, zipcode) VALUES ($1, $2, $3, $4, $5, $6)',
      insertParams
    )

  } catch (error) {
    console.error(error);
    throw new Error('Error creating address');
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
    // In case users use '+' between words, above regex does not filter them out
    allWords = allWords.filter(element => {return element != '+'});
    
    const promises = allWords.map(async (word) => {
      const result = await query(`SELECT * FROM items WHERE LOWER(name) LIKE '%${word}%'`);
      return result.rows;
    });

    const results = await Promise.all(promises);
    flatResults = results.flat();

    if (flatResults.length === 0) {
      return false;
    } else {
      return flatResults;
    }
  } catch (error) {
    throw new Error('Error retrieving search');
  }
};

// Returns cart object or a false value. Use async/await upon calling
const getCart = async (userId) => {
  try {
    const result = await query(`SELECT * FROM carts WHERE user_id = ${userId}`);

    if (result.rows.length === 0) {
      return false;
    } else{
      return result.rows[0];
    }
  } catch (error) {
    throw new Error('Error retrieving cart');
  }
};

const addItemToCart = async (userId, itemString) => {
  try {
    await query(`UPDATE carts SET items = array_append(items, ${itemString}) WHERE user_id = ${userId}`);
  } catch (error) {
    throw new Error('Error adding items to cart');
  }
};

const removeItemFromCart = async (userId, itemString) => {
  try {
    await query(`UPDATE carts SET items = array_remove(items, ${itemString}) WHERE user_id = ${userId}`);
  } catch (error) {
    throw new Error('Error adding items to cart');
  }
};

const updateCartItem = async (userId, oldValue, newValue) => {
  try {
    await query(`UPDATE carts SET items = array_replace(items, ${oldValue}, ${newValue}) WHERE user_id = ${userId}`);
  } catch (error) {
    throw new Error('Error adding items to cart');
  }
};

module.exports = {
  query,
  getClient,
  getUserById,
  getUserByUsername,
  createUser,
  getItemById,
  getItemsFromSearch,
  getCart,
  addItemToCart,
  removeItemFromCart,
  updateCartItem
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