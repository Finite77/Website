import { Pool } from 'jsr:@db/postgres@^0'
import { withSupabase } from 'npm:@supabase/server@^1'
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};



// Pain and suffering in a nutshell (paypal token):
async function getAccessToken() {
  const clientId = Deno.env.get('CLIENT_ID');
  const clientSecret = Deno.env.get('SECRET_KEY');

  if (!clientId || !clientSecret) {
    throw new Error('Missing PayPal credentials');
  }
  const credentials = btoa(`${clientId}:${clientSecret}`);
  const response = await fetch(
    'https://api-m.sandbox.paypal.com/v1/oauth2/token',
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    }
  );

  if (!response.ok) {
    throw new Error(`PayPal authentication failed: ${await response.text()}`);
  }

  const data = await response.json();

  return data.access_token;
}
// Returns json products object to send to paypal.... bro i resorted to js is crazy


  async function getProducts(userId: string) {
    const pool = new Pool(Deno.env.get('SUPABASE_DB_URL'), 1);
    let connection: any;
    async function acquireStuffFromBasket() {
      connection = await pool.connect();
      let shipping = 254.99;
      let arrayOfProductsToSendToPaypal = [];
      let total = 0;
      try {
        const itemsInBasket =  await connection.query(`SELECT * FROM basket WHERE user_id = $1`, [userId]);
        const items = itemsInBasket.rows;
        
        if (items.length === 0) {
          console.log('No items found in the basket.');
          throw new Error('Basket is empty');
        } else {
          // Where item is each item in the basket and product is the item details from the Products table
          for (const item of items) {
            const productDetails = await connection.query(`SELECT * FROM Products WHERE id = $1`, [item.product_id]);
            const product = productDetails.rows[0];
            if (!product) {
              console.error('Product not found');
              throw new Error('Product not found')
            }
            total += Number(product.product_price) * Number(item.product_quantity);
            arrayOfProductsToSendToPaypal.push({
              'name': product.product_name,
              'unit_amount': { 
                'currency_code': 'GBP', 
                'value': Number(product.product_price).toFixed(2)},
              'quantity': String(item.product_quantity),
              'category': 'PHYSICAL_GOODS',
              'image_url': product.product_image1_path,
            })}
        }
      } catch (error) {
        throw error;
      } finally {
        connection?.release();
        await pool.end();
      }

      return {
          intent: "CAPTURE",
          purchase_units: [
            {
              invoice_id: "90210",

              amount: {
                currency_code: "GBP",
                value: (total + shipping).toFixed(2),

                breakdown: {
                  item_total: {
                    currency_code: "GBP",
                    value: total.toFixed(2)
                  },

                  shipping: {
                    currency_code: "GBP",
                    value: shipping.toFixed(2)
                  }
                }
              },

              items: arrayOfProductsToSendToPaypal
            }
          ]
        };
    }
      return acquireStuffFromBasket();
  }


async function getProduct(id: number) {
const pool = new Pool(Deno.env.get('SUPABASE_DB_URL'), 1);
let connection = await pool.connect();

let shipping = 254.99;
let total = 0;
let arrayOfProductsToSendToPaypalv2 = []
  try {
    const productDetails = await connection.query(`SELECT * FROM Products WHERE id = $1`, [id]);
    const product = productDetails.rows[0];
    total += Number(product.product_price);
    arrayOfProductsToSendToPaypalv2.push({
      'name': product.product_name,
      'unit_amount': { 
        'currency_code': 'GBP', 
        'value': Number(product.product_price).toFixed(2)},
      'quantity': String(1),
      'category': 'PHYSICAL_GOODS',
      'image_url': product.product_image1_path,
    });
  } catch (error){
    throw error;
  } finally {
    connection?.release();
    await pool.end();
  }
    return {
          intent: "CAPTURE",
          purchase_units: [
            {
              invoice_id: "90210",

              amount: {
                currency_code: "GBP",
                value: (total + shipping).toFixed(2),

                breakdown: {
                  item_total: {
                    currency_code: "GBP",
                    value: total.toFixed(2)
                  },

                  shipping: {
                    currency_code: "GBP",
                    value: shipping.toFixed(2)
                  }
                }
              },

              items: arrayOfProductsToSendToPaypalv2
            }
          ]
        };

}

// param1 is userid when string or product id when number
async function sendOrderOff(param1: string | number) {
  const accesstoken =  await getAccessToken();
  if (typeof param1 === 'string') {
  const response = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', 
    { method: 'POST',
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${accesstoken}`,
      }, 
      body: JSON.stringify(await getProducts(param1))
    });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(JSON.stringify(result));
  }

  return result;
  } else {
  const response = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', 
    { method: 'POST',
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${accesstoken}`,
      }, 
      body: JSON.stringify(await getProduct(param1))
    });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(JSON.stringify(result));
  }
  return result;
  }
  };
// run once a request happens
export default {
  fetch: withSupabase({ auth: ['user', 'none'] }, async (req, ctx) => {
    try {
      if (req.method === 'OPTIONS') {
        return Response.json({ok: true}, {
          headers: corsHeaders
        });
      }
      const body = await req.json();
      if (body.checkoutType === 'single' && body.productId) {
        try{
          const anonPayPalOrder = await sendOrderOff(body.productId)
          return Response.json(anonPayPalOrder, { headers: corsHeaders })
        } catch (error){
          console.error(error)
          return Response.json(
            { error: 'Unable to create PayPal order' },
            { status: 500, headers: corsHeaders }
  );
        }
          
    }
      else if (body.checkoutType === 'basket') {
        const userId = ctx.userClaims?.id ?? null;
        if (!userId) {
          return Response.json(
            { error: 'Authentication required' },
            { status: 401, headers: corsHeaders })
          } else {
            try{
            const paypalOrder = await sendOrderOff(userId);
            return Response.json(paypalOrder, { headers: corsHeaders })
            } catch (error) {
              console.error(error)
            }
          }
  }

  // Retrieve this user's basket
} catch (error) {
  console.error(error);

  return Response.json(
    { error: 'Unable to create PayPal order' },
    { status: 500, headers: corsHeaders }
  );
}
       
      // ctx.supabase runs queries as the authenticated user, so RLS applies.
      // ctx.userClaims holds the verified user identity.
      
})}