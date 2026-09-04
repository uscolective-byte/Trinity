/**
 * SHOP API ENDPOINT
 * GET /api/shop/products - List products
 * GET /api/shop/products/:id - Get product details
 * POST /api/shop/orders - Create order
 */

import StreetWearShop from '../modules/shop.js';

export async function handleShop(request, env) {
  const url = new URL(request.url);
  const parts = url.pathname.split('/');
  const action = parts[3]; // products, orders, etc
  const id = parts[4]; // product ID

  const shop = new StreetWearShop(env);

  try {
    // GET /api/shop/products
    if (action === 'products' && !id && request.method === 'GET') {
      const products = await shop.getProducts();
      return new Response(JSON.stringify(products), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // GET /api/shop/products/:id
    if (action === 'products' && id && request.method === 'GET') {
      const product = await shop.getProduct(id);
      return new Response(JSON.stringify(product), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // POST /api/shop/orders
    if (action === 'orders' && request.method === 'POST') {
      const orderData = await request.json();
      const order = await shop.createOrder(orderData);
      return new Response(JSON.stringify(order), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
