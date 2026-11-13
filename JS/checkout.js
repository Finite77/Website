
// Calls the edge function. I know little of what the rest of the paypal script does. But it's on their docs, so well....
async function createOrder() {
  const { data, error } = await window.supabaseClient.functions.invoke('return-paypal-order',
    {
        body: {
        checkoutType: 'basket'
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
  const { orderId } = data;
  const response = await fetch(`/api/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const orderData = await response.json();
  return orderData;
}

function onCancel(data) {
  document.getElementById("resultMessage").innerHTML =
    `<p style="color: orange;">Payment cancelled</p>`;
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

      // After the browser is done downloading the SDK, it will invoke onLoad()
      // and begin the SDK setup
window.onLoad = async function() {
  try {
    const sdkInstance = await window.paypal.createInstance({
      clientId: "AWhoSnhKU0PdQ2Rnx09eAYTlbC-wdT4h_fayalqWLaLdvsZyVvLh3W0UFbH9KbYNLK-mds2osy8ybV6G", // clientId is safe to put in plaintext on the client
      components: ["paypal-payments"],
    });
    console.log('stage1')
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




        