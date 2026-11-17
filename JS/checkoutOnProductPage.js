// Now create the paypal button
const id2 = new URLSearchParams(window.location.search).get('id');
async function createOrder() {
  const { data, error } = await window.supabaseClient.functions.invoke('return-paypal-order',
    {
        body: {
        checkoutType: 'single',
        productId: id2
        }
    }
  );

  if (error) {
    console.error(error);
    throw error;
  };
  console.log(data);
  console.log(data)
  return { orderId: data.id }
}

async function onApprove(data) {
  const { data: orderData, error } = await window.supabaseClient.functions.invoke('capture-paypal-order',
    {
      body: {
          paypalOrderId: data.orderID
      }
    }
  );
  if(error) {
    throw error;
  }
  console.log('Capture result:', orderData);
  return orderData;
}

function onCancel(data) {
  document.getElementById("resultMessage").innerHTML =
    `<h2 id='paymentStatus'>PAYMENT CANCELLED</h2>`;
  setTimeout(() => {
    document.getElementById("resultMessage").innerHTML = '';
  }, 3000)
}

function onError(err) {
  console.error("PayPal Error:", err);
  let errorMessage = "An error occurred. Please try again.";
  // Handle specific error codes
  if (err.message && err.message.includes("INSUFFICIENT_FUNDS")) {
    errorMessage = "Payment declined due to insufficient funds.";
  } else if (err.message && err.message.includes("INSTRUMENT_DECLINED")) {
    errorMessage =
      "Your payment method was declined. Please try another.";
  } else if (err.message && err.message.includes("TRANSACTION_REFUSED")) {
    errorMessage = "Transaction was refused. Please contact support.";
  } else if (err.message && err.message.includes("DUPLICATE_INVOICE")) {
    errorMessage =
      "This order has already been processed. Please refresh and try again.";
  }
  document.getElementById("resultMessage").innerHTML =
    `<p style="color: red;">${errorMessage}</p>`;
}        

window.onLoad2 = async function() {
  try {
    const sdkInstance = await window.paypal.createInstance({
      clientId: "AWhoSnhKU0PdQ2Rnx09eAYTlbC-wdT4h_fayalqWLaLdvsZyVvLh3W0UFbH9KbYNLK-mds2osy8ybV6G", // clientId is safe to put in plaintext on the client
      components: ["paypal-payments"],
    });
    console.log('stage1diff')
    const eligibility = await sdkInstance.findEligibleMethods();
    const isPayPalEligible = eligibility.isEligible("paypal");
    console.log('stage2')
    if (isPayPalEligible) {
      const payTitle = document.createElement("h2")
      payTitle.id = 'payTitle';
      payTitle.textContent = 'Pay with:'
      document
        .querySelector("#paypalButtonContainer")
        .append(payTitle);
      const paypalButton = document.createElement("paypal-button");
      paypalButton.id ='paypalButton'
      document
        .querySelector("#paypalButtonContainer")
        .append(paypalButton);

      const paypalCheckoutSession =
        await sdkInstance.createPayPalOneTimePaymentSession({
          onApprove,
          onCancel,
          onError,
        });
    console.log('stage3')
      paypalButton.addEventListener("click", async () => {
        try {
          // Get the promise reference by invoking createOrder()
          // Do not await this async function since it can cause transient activation issues
          const createOrderPromise = createOrder();
          paypalCheckoutSession.start(
            { presentationMode: "auto" },
            createOrderPromise,
          );
        } catch (error) {
          console.error(error);
        }
      });
    }
  } catch (error) {
    console.error(error);
  }
}
