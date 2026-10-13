/**
 * Centralised, resilient selector map for Korla.nl.
 *
 * The Korla booking/payment UI is client-side rendered, so selectors prefer
 * accessible roles, labels, placeholders and aria attributes over brittle CSS
 * classes. If the UI changes, update THIS file only — never the tests.
 */

export default {
  brand: {
    logo: 'header a:has-text("KORLA TAXI"):visible',
  },

  nav: {
    // Mobile-first: the hamburger button is the primary navigation toggle.
    menuToggle: 'button[aria-label="Main menu toggle"]',
    links: {
      taxi: 'a:has-text("Taxi")',
      orderTracking: 'a:has-text("Order Tracking")',
      invoiceRequest: 'a:has-text("Invoice Request")',
      aboutUs: 'a:has-text("About Us")',
      contactUs: 'a:has-text("Contact Us")',
      myAccount: 'a:has-text("My Account")',
    },
  },

  booking: {
    section: 'text=Book Your Trips',
    dynamicPricing: 'a:has-text("Dynamic Pricing")',
    fixedPricing: 'a:has-text("Fixed Pricing")',
    packages: 'a:has-text("Packages")',
    tickets: 'a:has-text("Tickets")',
    airportTransfers: 'text=Airport Transfers',
    viewDetails: 'a:has-text("View Details")',
    // Client-rendered booking widget — resilient fallback chains.
    pickup: 'input[placeholder*="ickup"], input[placeholder*="From"], input[name*="pickup"]',
    dropoff: 'input[placeholder*="ropoff"], input[placeholder*="To"], input[name*="dropoff"]',
    departureDate: 'input[type="date"], input[placeholder*="Date"], input[name*="date"]',
    departureTime: 'input[type="time"], input[placeholder*="Time"], input[name*="time"]',
    passengers: 'input[aria-label*="passenger" i], input[name*="passenger" i], input[placeholder*="passenger" i]',
    passengerCounter: '[aria-label*="passenger" i], [data-testid*="passenger" i]',
    passengerPlus: 'button[aria-label*="add passenger" i], button[aria-label*="increas" i]',
    passengerMinus: 'button[aria-label*="remove passenger" i], button[aria-label*="decreas" i]',
    luggage: 'input[aria-label*="luggage" i], input[name*="luggage" i], input[placeholder*="luggage" i]',
    luggageCounter: '[aria-label*="luggage" i], [data-testid*="luggage" i]',
    luggagePlus: 'button[aria-label*="add luggage" i], button[aria-label*="increas" i]',
    luggageMinus: 'button[aria-label*="remove luggage" i], button[aria-label*="decreas" i]',
    search: 'button:has-text("Search"), button:has-text("Book"), button:has-text("Continue")',
    passengerValidation: 'text=passengers, text=Too many, text=maximum, text=larger vehicle',
  },

  vehicle: {
    card: '[class*="vehicle"], [data-testid*="vehicle"]',
    sedan: 'text=Standard Sedan',
    vitoVan: 'text=Vito Van',
    select: 'button:has-text("Select"), input[type="radio"]',
    continueBtn: 'button:has-text("Continue"), button:has-text("Next")',
  },

  product: {
    form: 'form.cart',
    quantity: 'input.qty[name="quantity"]',
    addToCart: 'button.single_add_to_cart_button[name="add-to-cart"]',
    price: '.price, .woocommerce-Price-amount',
    notice: '.woocommerce-message, .woocommerce-notice',
    reviewTab: 'a[href="#tab-reviews"]',
  },

  cart: {
    icon: '#ast-cart-svg, a[class*="cart"]',
    count: 'span[class*="count"], .count',
    widget: '.widget_shopping_cart, [class*="cart-drawer"]',
    proceedToCheckout: 'a:has-text("Proceed to checkout"), button:has-text("Proceed to checkout")',
  },

  checkout: {
    form: '#checkout, form.checkout',
    billingFirstName: '#billing_first_name, input[name="billing_first_name"]',
    billingLastName: '#billing_last_name, input[name="billing_last_name"]',
    billingEmail: '#billing_email, input[name="billing_email"]',
    billingPhone: '#billing_phone, input[name="billing_phone"]',
    billingAddress: '#billing_address_1, input[name="billing_address_1"]',
    billingPostcode: '#billing_postcode, input[name="billing_postcode"]',
    billingCity: '#billing_city, input[name="billing_city"]',
    placeOrder: '#place_order, button[name="woocommerce_checkout_place_order"]',
    orderReview: '#order_review',
  },

  payment: {
    methods: '.wc_payment_method, input[name="payment_method"], .payment_methods',
    methodRow: 'li.wc_payment_method',
    methodRadio: 'input[name="payment_method"]',
    methodLabel: 'label',
    cardNumber: '#cardnumber, input[name="cardnumber"], input[autocomplete="cc-number"]',
    cardExpiry: '#expiry, input[name="expiry"], input[autocomplete="cc-exp"]',
    cardCvc: '#cvc, input[name="cvc"], input[autocomplete="cc-csc"]',
    cardName: 'input[autocomplete="cc-name"], #cardholder',
    paypal: 'label:has-text("PayPal")',
    bankTransfer: 'label:has-text("bank transfer"), label:has-text("Direct bank")',
    orderReceived: 'text=Order received, h1:has-text("Order received")',
    orderNumber: '.order-number, .woocommerce-order-overview__order',
  },

  login: {
    form: 'form.login',
    username: '#username, input[name="username"]',
    password: '#password, input[name="password"]',
    rememberMe: '#rememberme, input[name="rememberme"]',
    submit: 'button[name="login"], button:has-text("Log in")',
    registerEmail: '#reg_email, input[name="email"]',
    registerSubmit: 'button[name="register"], button:has-text("Register")',
    error: 'ul.woocommerce-error, .woocommerce-error, .woocommerce-notice',
    success: '.woocommerce-MyAccount-content, .woocommerce-notice--success',
    logout: 'a:has-text("Log out")',
  },

  tracking: {
    form: 'form.woocommerce-form-track-order',
    orderId: '#orderid, input[name="orderid"]',
    email: '#order_email, input[name="order_email"]',
    submit: 'button[name="track"], button:has-text("Track")',
    result: '.woocommerce-order-status, .track_order, h2:has-text("Order")',
  },

  faq: {
    paymentQuestion: 'text=What payment methods do you accept?',
    paymentAnswer: 'p:has-text("credit cards")',
  },
};
