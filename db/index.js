const { Pool } = require('pg');
const bcrypt = require('bcrypt');
 
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
      firstName, 
      lastName, 
      phoneNumber, 
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
      let addressId = await findAddressId(address); // address is an object

      if(!addressId) {
        address_id = await createAddress(address); // address is an object
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const insertParams = [username, email, firstName, lastName, phoneNumber, addressId, id, hashedPassword];
      const newUser = await query(
        'INSERT INTO users (username, email, first_name, last_name, phone_number, address_id, id, password) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        insertParams
      );
      const userReturn = newUser.rows[0];
      return userReturn;
    }
  } catch (error) {
    console.error(error);
    throw new Error('Error creating user');
  }
};

// Finds address id or false value. Accepts an object as parameter. Use async/await upson calling
const findAddressId = async (address) => {
  try {
    const insertParams = [
      address.numberStreet.toLowerCase(), 
      address.locality.toLowerCase(), 
      address.stateProvince.toLowerCase(), 
      address.country.toLowerCase(), 
      address.zipcode.toLowerCase()
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

// Creates a new address and returns id. Accepts an object as parameter. Use async/await upon calling
const createAddress = async (address) => {
  try {
    // Create address id - to be updated later
    const id = Math.floor(Math.random * 2000000000);
    const insertParams = [
      id, 
      address.numberStreet, 
      address.locality, 
      address.stateProvince, 
      address.country, 
      address.zipcode
    ];
    await query(
      'INSERT INTO addresses (id, number_street, locality, state_province, country, zipcode) VALUES ($1, $2, $3, $4, $5, $6)',
      insertParams
    )
    return id;
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
    console.error(error);
    throw new Error('Error retrieving search');
  }
};

// Returns either an review object or a false value. Use async/await upon calling
const getReview = async (reviewId) => {
  try {
    const result = await query(`SELECT * FROM reviews WHERE id = ${reviewId}`);

    if (result.rows.length === 0) {
      return false;
    } else {
      return result.rows[0];
    }
  } catch (error) {
    console.error(error);
    throw new Error('Error retrieving item by ID');
  }
};

// Returns cart object or a false value. Use async/await upon calling
const getCart = async (userId) => {
  try {
    const result = await query(`SELECT * FROM carts WHERE user_id = ${userId}`);

    if (result.rows.length === 0) {
      return false;
    } else {
      return result.rows[0];
    }
  } catch (error) {
    console.error(error);
    throw new Error('Error retrieving cart');
  }
};

const addItemToCart = async (userId, itemString) => {
  try {
    await query(`UPDATE carts SET items = array_append(items, ${itemString}) WHERE user_id = ${userId}`);
  } catch (error) {
    console.error(error);
    throw new Error('Error adding items to cart');
  }
};

const removeItemFromCart = async (userId, itemString) => {
  try {
    await query(`UPDATE carts SET items = array_remove(items, ${itemString}) WHERE user_id = ${userId}`);
  } catch (error) {
    console.error(error);
    throw new Error('Error adding items to cart');
  }
};

const updateCartItem = async (userId, oldValue, newValue) => {
  try {
    await query(`UPDATE carts SET items = array_replace(items, ${oldValue}, ${newValue}) WHERE user_id = ${userId}`);
  } catch (error) {
    console.error(error);
    throw new Error('Error adding items to cart');
  }
};

const clearCart = async(userId)  => {
  try {
    await query(`DELETE FROM carts WHERE user_id = ${userId}`);
  } catch (error) {
    console.error(error);
    throw new Error('Error adding items to cart');
  }
};

const getPurchaseById = async (purchaseId) => {
  try {
    const result = await query(`SELECT * FROM purchases WHERE id = ${purchaseId}`);

    if (result.rows.length === 0) {
      return false;
    } else {
      console.error(error);
      return result.rows[0];
    }
  } catch (error) {
    throw new Error('Error retrieving purchase');
  }
};

const createPurchase = async (purchaseBodyObject) => {
  try {
    const {
      cart, // this will be an object with user id and items
      firstName,
      lastName,
      address // this will be an object
    } = purchaseBodyObject;

    // destructure cart object
    const {
      userId,
      items
    } = cart;

    // Create purchase id - to be updated later
    const id = Math.floor(Math.random * 2000000000);
    // Obtain address id and create if it doesn't exist
    let addressId = await findAddressId(address); // address is an object

    if(!addressId) {
      addressId = await createAddress(address); // address is an object
    }

    const insertParams = [id, addressId, userId, items, firstName, lastName];
    const newPurchase = await query(
      'INSERT INTO purchases (id, delivery_address_id, user_id, items, first_name, last_name, timestamp) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP) RETURNING *',
      insertParams
    );

    const purchaseReturn = newPurchase.rows[0];
    return purchaseReturn;
  } catch (error) {
    console.error(error);
    throw new Error('Error creating purchase');
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
  getReview,
  getCart,
  addItemToCart,
  clearCart,
  removeItemFromCart,
  updateCartItem,
  getPurchaseById,
  createPurchase
};