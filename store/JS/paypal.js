async function onPayPalWebSdkLoaded() {
  let userId;
  try {
    userId = await window.supabaseClient.getUser().id;
  } catch (error) {
    console.error(error);
  }


  try {
    // Get client token for authentication
    const clientToken = await getBrowserSafeClientToken();
    
    // Create PayPal SDK instance
    const sdkInstance = await window.paypal.createInstance({
      clientId: "AWhoSnhKU0PdQ2Rnx09eAYTlbC-wdT4h_fayalqWLaLdvsZyVvLh3W0UFbH9KbYNLK-mds2osy8ybV6G",
      components: ["paypal-payments"],
      pageType: "cart",
      locale: "en-UK",
      clientMetadataId: userId
    });

    // Check eligibility for all payment methods
    const paymentMethods = await sdkInstance.findEligibleMethods({
      currencyCode: "USD",
    });

    // Set up PayPal button if eligible
    if (paymentMethods.isEligible("paypal")) {
      configurePayPalButton(sdkInstance);
    }

    // Set up Pay Later button if eligible
    if (paymentMethods.isEligible("paylater")) {
      const payLaterPaymentMethodDetails = paymentMethods.getDetails("paylater");
      setUpPayLaterButton(sdkInstance, payLaterPaymentMethodDetails);
    }

    // Set up PayPal Credit button if eligible
    if (paymentMethods.isEligible("credit")) {
      const paypalCreditPaymentMethodDetails = paymentMethods.getDetails("credit");
      setUpPayPalCreditButton(sdkInstance, paypalCreditPaymentMethodDetails);
    }
  } catch (error) {
    console.error("SDK initialization error:", error);
  }
}

// Shared payment session options for all payment methods
const paymentSessionOptions = {
  // Called when user approves a payment 
  async onApprove(data) {
    console.log("Payment approved:", data);
    try {
      const orderData = await captureOrder({
        orderId: data.orderId,
      });
      console.log("Payment captured successfully:", orderData);
    } catch (error) {
      console.error("Payment capture failed:", error);
    }
  },
  
  // Called when user cancels a payment
  onCancel(data) {
    console.log("Payment cancelled:", data);
  },
  
  // Called when an error occurs during payment
  onError(error) {
    console.error("Payment error:", error);
  },
};

// Set up standard PayPal button
async function configurePayPalButton(sdkInstance) {
  const paypalPaymentSession = sdkInstance.createPayPalOneTimePaymentSession(
    paymentSessionOptions,
  );

  const paypalButton = document.querySelector("paypal-button");
  paypalButton.removeAttribute("hidden");

  paypalButton.addEventListener("click", async () => {
    try {
      await paypalPaymentSession.start(
        { presentationMode: "auto" }, // Auto-detects best presentation mode
        createOrder(),
      );
    } catch (error) {
      console.error("PayPal payment start error:", error);
    }
  });
}

// Set up Pay Later button
async function setUpPayLaterButton(sdkInstance, payLaterPaymentMethodDetails) {
  const payLaterPaymentSession = sdkInstance.createPayLaterOneTimePaymentSession(
    paymentSessionOptions
  );

  const { productCode, countryCode } = payLaterPaymentMethodDetails;
  const payLaterButton = document.querySelector("paypal-pay-later-button");

  // Configure button with Pay Later specific details
  payLaterButton.productCode = productCode;
  payLaterButton.countryCode = countryCode;
  payLaterButton.removeAttribute("hidden");

  payLaterButton.addEventListener("click", async () => {
    try {
      await payLaterPaymentSession.start(
        { presentationMode: "auto" },
        createOrder(),
      );
    } catch (error) {
      console.error("Pay Later payment start error:", error);
    }
  });
}

// Set up PayPal Credit button
async function setUpPayPalCreditButton(sdkInstance, paypalCreditPaymentMethodDetails) {
  const paypalCreditPaymentSession = sdkInstance.createPayPalCreditOneTimePaymentSession(
    paymentSessionOptions
  );

  const { countryCode } = paypalCreditPaymentMethodDetails;
  const paypalCreditButton = document.querySelector("paypal-credit-button");

  // Configure button with PayPal Credit specific details
  paypalCreditButton.countryCode = countryCode;
  paypalCreditButton.removeAttribute("hidden");

  paypalCreditButton.addEventListener("click", async () => {
    try {
      await paypalCreditPaymentSession.start(
        { presentationMode: "auto" },
        createOrder(),
      );
    } catch (error) {
      console.error("PayPal Credit payment start error:", error);
    }
  });
}