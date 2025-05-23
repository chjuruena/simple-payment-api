# Stripe Payment Integration

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Express](https://img.shields.io/badge/Express-5-blue)
![Stripe](https://img.shields.io/badge/Stripe-API-purple)

## Description

A simple payment solution with Node.js/Express 5 backend and Stripe Elements frontend.

## Technologies Used

- Node.js (>=18.0.0)
- npm (>=9.0.0)
- Express 5
- Stripe Node.js Library (`stripe`)
- Stripe JavaScript Library (`@stripe/stripe-js`)
- `dotenv` for environment variable management
- `cors` for enabling Cross-Origin Resource Sharing
- `body-parser` for parsing request bodies
- `axios` for making HTTP requests (potentially for future expansions or interactions with other services)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js:** Download and install the latest LTS version from [https://nodejs.org/](https://nodejs.org/).
- **npm (Node Package Manager):** npm comes bundled with Node.js. You can verify your installation by running `npm -v` in your terminal.
- **Stripe Account:** You will need a Stripe account to obtain your API keys. Sign up at [https://stripe.com/](https://stripe.com/).

## Installation

1.  **Clone the repository** (if you have the code in a Git repository):
    ```bash
    git clone <repository_url>
    cd paymentapi
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```
    This command will install all the necessary packages listed in the `package.json` file.

## Configuration

1.  **Create a `.env` file** in the root directory of your project.

2.  **Add your Stripe API keys and any other necessary environment variables** to the `.env` file. Replace the placeholders with your actual values:

    ```env
    STRIPE_SECRET_KEY=sk_test_your_secret_key_here
    STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
    # Add other environment variables as needed, e.g.,
    # API_BASE_URL=http://localhost:3000
    ```

    **Important:** Never commit your secret API keys to your version control system. The `.env` file should be added to your `.gitignore` file.

## Running the API

You can start the API using the following npm scripts:

- **`npm start`**: Runs the API in production mode using the `node server/server.js` command.
- **`npm run dev`**: Runs the API in development mode with automatic server restarts on code changes using `nodemon server/server.js --trace-warnings`. This is helpful during development.

To run the API, open your terminal in the project directory and execute the desired script:

```bash
npm start
# or
npm run dev
```

# Testing the Payment Form

## Accessing the Payment Form

The payment form can be accessed at:

[http://localhost:3000](http://localhost:3000)

## Test Card Details

Use the following test card details for successful and declined payment simulations:

* **Card Number:** See table below
* **Expiry Date:** Any future date
* **CVC:** Any 3 digits

## Test Card Numbers

| Card Number           | Type       | Description                 |
| --------------------- | ---------- | --------------------------- |
| 4242 4242 4242 4242 | Visa       | Successful payment          |
| 4000 0000 0000 0002 | Generic    | Declined payment            |
| 5555 5555 5555 4444 | Mastercard | Successful payment          |


## API Endpoints

| Endpoint                  | Method | Description                     |
| ------------------------- | ------ | ------------------------------- |
| /api/create-payment-intent | POST   | Creates a PaymentIntent         |
| /api/confirm-payment      | POST   | Confirms a payment               |
| /api/config               | GET    | Returns the publishable key     |


