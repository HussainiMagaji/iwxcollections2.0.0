class Cart {

  constructor( ) {
    this.items = [],
    this.amount = 0,
    this.length = 0;
  }
  
  static getItem(cart, id) {
    return cart.items.find(item => item.id == id);
  }

  static append(cart, item) {
    if(this.getItem(cart, item.id)) {
       return;
    }
    cart.items.push(item);
    cart.amount += (item.price * item.quantity);
    ++cart.length;

    return item.id;
  }

  static remove(cart, id) {
    let i, deleted;
    for(i = 0; i < cart.length; ++i) {
      if(cart.items[i].id == id) {
	 cart.amount -= (cart.items[i].price * cart.items[i].quantity);
	 --cart.length;
         return cart.items.splice(i, 1);
      }
    }
    return null;
  }

  static clear(cart) { 
    cart.items = [ ];
    cart.amount = 0;
    cart.length = 0;
  }

}

module.exports = Cart;
