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

function email_exist(connection, email) {
  return new Promise((resolve, reject) => {
    connection.query(`CALL EMAIL_EXIST( '${email}' )`, (error, result) => {
      if (error)
         return reject(error);
      else
         return resolve( result[0][0].email_exist );
    })
  });
}

function verify_customer(connection, login_details) {
  return new Promise((resolve, reject) => {
    connection.query(`CALL VERIFY_CUSTOMER('${JSON.stringify(login_details)}');`, (error, result) => {
      if (error) 
        return reject(error);
      else 
        return resolve(result[0][0]);
    });
  });
}

function add_customer(connection, login_details) {
  return new Promise((resolve, reject) => {
    connection.query(`CALL ADD_CUSTOMER('${JSON.stringify(login_details)}');`, (error, result) => {
      if (error) 
        return reject(error);
      else 
        return resolve(result[0][0]);
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

function add_unverified_user(connection, email, password) {
  return new Promise((resolve, reject) => {
    connection.query(`CALL ADD_UNVERIFIED_USER('${email}', '${password}')`, (error, result) => {
      if (error)
          return reject(error);
      else
          return resolve( JSON.parse(JSON.stringify(result))[0][0] );
    });
  });
}

function get_unverified_user_by_id(connection, user_id) {
  return new Promise((resolve, reject) => {
    connection.query(`CALL GET_UNVERIFIED_USER_BY_ID(${user_id})`, (error, result) => {
      if (error)
          return reject(error);
      else
          return resolve( JSON.parse(JSON.stringify(result))[0][0] );
    });
  });
}

function get_states(connection) {
  return new Promise((resolve, reject) => {
    connection.execute(`CALL GET_STATES;`, (error, result) => {
      if (error)
        return reject(error);
      else {
        let states = [];
        result[0].forEach( obj => states.push(obj.state) );
        return resolve(states);
      }
    });
  });
}

function get_local_governments(connection, state) {
  return new Promise((resolve, reject) => {
    connection.execute(`CALL GET_LOCAL_GOVERNMENTS('${state}');`, (error, result) => {
      if (error)
        return reject( error );
      else {
        let local_governments = [];
        result[0].forEach( obj => local_governments.push( obj.local_government ) );
        return resolve( local_governments );
      }
    });
  });
}

function get_products_supplier_mapping(connection, cart_items) {

  function get_supplier_by_id(connection, supplier_id) {
    return new Promise((resolve, reject) => {
      connection.query(`CALL GET_SUPPLIER_BY_ID(${supplier_id})`, (error, result) => {
        if (error)
            return reject(error);
        else
            return resolve( JSON.parse(JSON.stringify(result))[0][0] );
      });
    });
  }

  function get_unique_supplier_ids( arr ) {
    let tmp = {};
    for (let id of arr.map(a => a.supplier_id))
      tmp[id] = '';
    return Object.keys( tmp ).map(a => Number(a));
  }

  let supplier_ids = get_unique_supplier_ids(cart_items);

  return Promise.all( supplier_ids.map(id => get_supplier_by_id(connection, id)) )
  .then( suppliers => {
    let orderMap = new Map();

    suppliers.forEach(supplier => {
      if (supplier) {
        orderMap.set(supplier, cart_items.filter(a => a.supplier_id == supplier.supplier_id));
      }
    });
    return orderMap; 
  });
}



module.exports = {

  get_products(limit, index) {
    return get_products(connection, limit, index);
  },

  get_product_by_id(product_id) {
    return get_product_by_id(connection, product_id);
  },

  email_exist(email) {
    return email_exist(connection, email);
  },

  verify_customer(login_details) {
    return verify_customer(connection, login_details);
  },

  add_customer(login_details) {
    return add_customer(connection, login_details);
  },

  get_customer_orders(customer_id) {
    return get_customer_orders(connection, customer_id);
  },

  add_unverified_user(email, password) {
    return add_unverified_user(connection, email, password);
  },

  get_unverified_user_by_id(user_id) {
    return get_unverified_user_by_id(connection, user_id);
  },

  get_states( ) {
    return get_states(connection);
  },

  get_local_governments(state) {
    return get_local_governments(connection, state);
  },

  get_products_supplier_mapping(cart_items) {
    return get_products_supplier_mapping(connection, cart_items);
  }

};
