const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { uuid } = require('uuidv4');
 
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect();

// For making database queries. Use async/await upon calling outside this module
const query = async (text, params, callback) => {
  try {
    return await pool.query(text, params, callback);
  } catch (error) {
    console.error(error);
  }
};

const getClient = () => {
  return pool.connect()
};

// Returns either a user object or a false value. Use async/await upon calling
const getUserByEmail = async (email) => {
  try { 
    const result = await query(
      `SELECT * FROM users WHERE LOWER(email) = $1`,
      [email.toLowerCase()]
    );
    if (result.rows.length === 0) {
      return false;
    } else {
      return result.rows[0];
    }
  } catch (error) {
    console.error(error);
    throw new Error('Error retrieving user by email');
  }
};

// Returns new user object ot a false value. Use async/await upson calling
const createUser = async (userBodyObject) => {
  try {
    // Destructure user object
    const {
      email,
      firstName, 
      lastName, 
      phoneNumber, 
      address, // this will be an object
      password
    } = userBodyObject;
    // Check if user already exists
    const user = await getUserByEmail(email);

    if (user) {
      throw new Error('User already exists');
    } else {
      // Obtain address id and create if it doesn't exist
      let addressId = await findAddressId(address); // address is an object

      if(!addressId) {
        addressId = await createAddress(address); // address is an object
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const queryText = `
        INSERT INTO users (email, first_name, last_name, phone_number, address_id, password)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
      `;
      const insertParams = [email, firstName, lastName, phoneNumber, addressId, hashedPassword];
      const newUser = await query(
        queryText,
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
    const queryText = `
      SELECT id FROM addresses
      WHERE LOWER(number_street) = $1 AND LOWER(locality) = $2
      AND LOWER(state_province) = $3 AND LOWER(country) = $4
      AND LOWER(zipcode) = $5
    `;
    const insertParams = [
      address.numberStreet.toLowerCase(), 
      address.locality.toLowerCase(), 
      address.stateProvince.toLowerCase(), 
      address.country.toLowerCase(), 
      address.zipcode.toLowerCase()
    ];
    const result = await query(queryText, insertParams);

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
    // Create address id
    const id = uuid();
    const queryText = `
      INSERT INTO addresses (id, number_street, locality, state_province, country, zipcode)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const insertParams = [
      id, 
      address.numberStreet, 
      address.locality, 
      address.stateProvince, 
      address.country, 
      address.zipcode
    ];
    
    const result = await query(queryText, insertParams);
    if(result) {
      return id;
    } else {
      throw new Error('Error creating address');
    }
  } catch (error) {
    console.error(error);
    throw new Error('Error creating address');
  }
};

// Returns either an item object or a false value. Use async/await upon calling
const getItemById = async (id) => {
  try {
    const result = await query(
      `SELECT i.*, ip.file AS picture
      FROM items i JOIN item_pictures ip
      ON i.id = ip.item_id
      WHERE i.id = $1
      AND ip.main_picture = TRUE
      LIMIT 1`,
      [id]
    );

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

// Get all item pictures or return a false value. Use async/await upon calling
// Multiple pictures is likely to be out of scope for this project
const getAllItemPictures = async (id) => {
  try {
    const result = await query(
      `SELECT ip.file AS picture
      FROM item_pictures ip JOIN items i
      ON ip.item_id = i.id
      WHERE i.id = $1`, [id]
    );

    if (result.rows.length === 0) {
      return false;
    } else {
      return result.rows;
    }
  } catch (error) {
    console.error(error);
    throw new Error('Error item pictures by ID');
  }
}

// Returns an array of objects or a false value. Use async/await upon calling
const getItemsByCategory = async (category) => {
  try {
    const result = await query(
      `SELECT i.*, ip.file AS picture FROM items i
      JOIN item_pictures ip
      ON i.id = ip.item_id
      WHERE LOWER(category) = $1
      AND ip.main_picture = TRUE`,
      [category.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return false;
    } else {
      return result.rows;
    }
  } catch (error) {
    console.error(error);
    throw new Error('Error retrieving item by category');
  }
};

// Returns items a user searchs for or a false value. Use async/await upon calling
const getItemsFromSearch = async (searchTerms) => {
  try {
    let allWords = searchTerms.match(/(?:[^\s,"]+|"[^"]*")+/g);
    // In case users use '+' between words, above regex does not filter them out
    // Also filters empty strings and single spaces
    allWords = allWords.filter(element => {return element && element != '+'});
    
    const promises = allWords.map(async (word) => {
      const result = await query(
        `SELECT i.*, ip.file AS picture FROM items i
        JOIN item_pictures ip
        ON i.id = ip.item_id 
        WHERE LOWER(name) ILIKE $1`,
        [`%${word.toLowerCase()}%`]
      );
      return result.rows;
    });

    const results = await Promise.all(promises);
    const flatResults = results.flat();

    return flatResults.length > 0 ? flatResults : false;
  } catch (error) {
    console.error(error);
    throw new Error('Error retrieving search');
  }
};

// Adds items into database. This is only for admins!
//add later

// Modifies items in database. This is only for admins!
//add later

// Removes items from database. This is only for admins!
//add later

// Returns either an review object or a false value. Use async/await upon calling
const getReview = async (reviewId) => {
  try {
    const result = await query(`
      SELECT * FROM reviews WHERE id = $1`,
      [reviewId]
    );

    if (result.rows.length === 0) {
      return false;
    } else {
      return result.rows[0];
    }
  } catch (error) {
    console.error(error);
    throw new Error('Error retrieving review by ID');
  }
};

// Creates a new item review
const createReview = async (userEmail, reviewBodyObject) => {
  try {
    const {
      itemId,
      rating,
      review
    } = reviewBodyObject;
    const id = uuid();

    const insertParams = [id, itemId, userEmail, rating, review];
    const queryText = `
      INSERT INTO reviews (id, item_id, user_email, rating, review, timestamp)
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const newReview = await query(queryText, insertParams)
    return newReview.rows[0];
  } catch (error) {
    console.error(error);
    throw new Error('Error creating review');
  }
};

//Edits an item review
const updateReview = async (reviewId, reviewBodyObject) => {
  try {
    const { rating, review } = reviewBodyObject;
    const updatedReview = await query(`
      UPDATE reviews
      SET rating = $1, review = $2
      WHERE id = $3
    `, [rating, review, reviewId]);

    return updatedReview;
  } catch (error) {
    console.error(error);
    throw new Error('Error updating review');
  }
};

//Deletes an item review
const deleteReview = async (reviewId) => {
  try {
    await query('DELETE FROM reviews WHERE id = $1', [reviewId]);
  } catch (error) {
    console.error(error);
    throw new Error('Error deleting review');
  }
};

// Returns cart object or a false value. Use async/await upon calling
const getCart = async (userEmail) => {
  try {
    const result = await query(`
      SELECT * FROM carts WHERE user_email = $1`,
      [userEmail]
    );
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

const addItemToCart = async (userEmail, itemString) => {
  try {
    const addedItem = await query(
      `UPDATE carts SET items = array_append(items, $1) WHERE user_email = $2
      RETURNING *`,
      [itemString, userEmail]
    );
    return addedItem;
  } catch (error) {
    console.error(error);
    throw new Error('Error adding items to cart');
  }
};

const removeItemFromCart = async (userEmail, itemString) => {
  try {
    await query(
      `UPDATE carts SET items = array_remove(items, $1) WHERE user_email = $2`,
      [itemString, userEmail]
    );
  } catch (error) {
    console.error(error);
    throw new Error('Error removing items to cart');
  }
};

const updateCartItem = async (userEmail, oldValue, newValue) => {
  try {
    const updatedItem = await query(
      `UPDATE carts SET items = array_replace(items, $1, $2)
      WHERE user_email = $3
      RETURNING *`,
      [oldValue, newValue, userEmail]
    );
    return updatedItem;
  } catch (error) {
    console.error(error);
    throw new Error('Error updating items in cart');
  }
};

const clearCart = async(userEmail)  => {
  try {
    await query(`DELETE FROM carts WHERE user_email = $1`, [userEmail]);
  } catch (error) {
    console.error(error);
    throw new Error('Error clearing cart');
  }
};

// Returns a purchase with purchase Id, but only if user is currently logged in
const getPurchaseById = async (userEmail, purchaseId) => {
  try {
    const result = await query(
      `SELECT * FROM purchases WHERE id = $1 AND user_email = $2`,
      [purchaseId, userEmail]
    );

    if (result.rows.length === 0) {
      return false;
    } else {
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
    const {userEmail, items} = cart;

    // Create purchase id
    const id = uuid();
    // Obtain address id and create if it doesn't exist
    let addressId = await findAddressId(address); // address is an object

    if(!addressId) {
      addressId = await createAddress(address); // address is an object
    }

    const queryText = `
      INSERT INTO purchases (id, delivery_address_id,
        user_email, items, first_name, last_name, timestamp)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP) RETURNING *
    `;
    const insertParams = [id, addressId, userEmail, items, firstName, lastName];
    const newPurchase = await query(queryText, insertParams);

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
  getUserByEmail,
  createUser,
  getItemById,
  getAllItemPictures,
  getItemsByCategory,
  getItemsFromSearch,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  getCart,
  addItemToCart,
  clearCart,
  removeItemFromCart,
  updateCartItem,
  getPurchaseById,
  createPurchase
};