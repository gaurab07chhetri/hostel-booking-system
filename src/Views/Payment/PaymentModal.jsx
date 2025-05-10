const request = require('request');

const options = {
  method: 'POST',
  url: 'https://khalti.com/api/v2/epayment/initiate/',
  headers: {
    Authorization: 'Key live_secret_key_68791341fdd94846a146f0457ff7b455', // Use 'Key' with capital 'K'
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    return_url: 'http://example.com/payment-verification', // Change to your actual return URL
    website_url: 'https://yourwebsite.com',               // Replace with your real website
    amount: 1000,                                          // Amount in paisa, must be a number, not string
    purchase_order_id: 'Order01',
    purchase_order_name: 'Test Package',
    customer_info: {
      name: 'Ram Bahadur',
      email: 'test@khalti.com',
      phone: '9800000001',
    },
  }),
};

request(options, function (error, response, body) {
  if (error) throw new Error(error);
  
  const resData = JSON.parse(body);
  console.log('Khalti Response:', resData);

  if (resData.payment_url) {
    console.log('Redirect user to:', resData.payment_url);
  } else {
    console.error('Error:', resData);
  }
});
