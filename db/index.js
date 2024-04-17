const { Pool } = require('pg');
 
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Daintree Store',
  password: 'postgres',
  port: 5432,
});

pool.connect();
 
const query = (text, params, callback) => {
  return pool.query(text, params, callback)
};

const getClient = () => {
  return pool.connect()
};

module.exports = {query, getClient};

// Below is just an example of how to do a query and log it to console

// pool.query('SELECT * FROM items;', (err, res) => {
//   if(!err) {
//     console.log(res.rows);
//   } else {
//     console.log(err.message);
//   }
// })