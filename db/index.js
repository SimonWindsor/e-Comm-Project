const { Pool } = require('pg');
 
const pool = new Pool()
 
export const query = (text, params, callback) => {
  return pool.query(text, params, callback)
};

export const getClient = () => {
  return pool.connect()
};