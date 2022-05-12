const connection = require('./config.js');

function get_products(connection, limit, index) {
    return new Promise((resolve, reject) => {
      connection.query(`CALL GET_PRODUCTS(${limit}, ${index})`, (error, result) => {
        if (error) {
            return reject(error);
        } else {
            return resolve( JSON.parse(JSON.stringify(result))[0] );
        }
      });
    })
}

function get_product_by_id(connection, product_id) {
  return new Promise((resolve, reject) => {
    connection.query(`CALL GET_PRODUCT_BY_ID(${product_id})`, (error, result) => {
      if (error)
          return reject(error);
      else
          return resolve( JSON.parse(JSON.stringify(result))[0][0] );
    });
  });
}

function get_customer_orders(connection, customer_id) {
  return new Promise((resolve, reject) => {
    connection.query(`CALL GET_CUSTOMER_ORDERS(${customer_id})`, (error, result) => {
      if (error)
         return reject(error);
      else
         return resolve( result[0] );
    })
  });
}

module.exports = {

  get_products(limit, index) {
    return get_products(connection, limit, index);
  },

  get_product_by_id(product_id) {
    return get_product_by_id(connection, product_id);
  },

  get_customer_orders(customer_id) {
    return get_customer_orders(connection, customer_id);
  }

};
