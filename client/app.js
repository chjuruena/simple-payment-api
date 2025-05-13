// client/app.js
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Stripe with your publishable key
    const response = await fetch('/api/config');
    if (!response.ok) throw new Error('Failed to load config');
    
    const { stripePublishableKey } = await response.json();
    console.log(stripePublishableKey)
    
    // Initialize Stripe
    const stripe = Stripe(stripePublishableKey);
    
    
    // DOM Elements
    const form = document.getElementById('payment-form');
    const amountInput = document.getElementById('amount');
    const cardholderNameInput = document.getElementById('cardholder-name');
    const submitButton = document.getElementById('submit-button');
    const paymentResult = document.getElementById('payment-result');

    // Set form attributes for secure autofill
    form.setAttribute('autocomplete', 'on');
    form.setAttribute('method', 'POST');
    cardholderNameInput.setAttribute('autocomplete', 'cc-name');
    amountInput.setAttribute('autocomplete', 'transaction-amount');

    // Set up Stripe Elements
    const elements = stripe.elements();
    const cardElement = elements.create('card', {
        style: {
            base: {
                fontSize: '16px',
                color: '#32325d',
                '::placeholder': {
                    color: '#aab7c4'
                },
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                fontSmoothing: 'antialiased'
            },
            invalid: {
                color: '#fa755a',
                iconColor: '#fa755a'
            }
        },
        hidePostalCode: true
    });

    // Mount the card element
    try {
        cardElement.mount('#card-element');
    } catch (err) {
        console.error('Failed to mount Stripe element:', err);
        showMessage('Failed to load payment form. Please refresh the page.', 'error');
        return;
    }

    // Handle real-time validation errors
    cardElement.on('change', (event) => {
        const displayError = document.getElementById('card-errors');
        displayError.textContent = event.error ? event.error.message : '';
    });

    // Handle form submission
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        setLoading(true, true);
        
        const amount = parseFloat(amountInput.value);
        const cardholderName = cardholderNameInput.value.trim() || 'Anonymous';

        try {
            // 1. Create payment intent
            const intentResponse = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ 
                    amount, 
                    currency: 'usd',
                    description: `Payment for ${cardholderName}`
                }),
            });

            if (!intentResponse.ok) {
                throw new Error(await intentResponse.text() || 'Failed to create payment intent');
            }

            const { clientSecret } = await intentResponse.json();
            
            // 2. Confirm the payment
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        name: cardholderName
                    }
                },
                receipt_email: 'customer@example.com' // Set dynamically in production
            });

            if (error) {
                showMessage(error.message, 'error');
                console.error('Payment error:', error);
            } else if (paymentIntent.status === 'succeeded') {
                showMessage('Payment succeeded!', 'success');
                console.log('Payment completed:', paymentIntent);
                // Redirect or show success UI here
            }
        } catch (error) {
            console.error('Payment processing error:', error);
            showMessage(error.message || 'An unexpected error occurred. Please try again.', 'error');
        } finally {
            setLoading(false, false);
        }
    });

    // Helper functions
    function setLoading(isLoading, isSubmitting = false) {
        submitButton.disabled = isLoading;
        document.getElementById('button-text').textContent = 
            isLoading ? (isSubmitting ? 'Processing...' : 'Loading...') : 'Pay Now';
        document.getElementById('button-spinner').classList.toggle('d-none', !isLoading);
    }

    function showMessage(message, type = 'success') {
        paymentResult.textContent = message;
        paymentResult.className = 'mt-3 text-center';
        paymentResult.classList.add(type === 'success' ? 'text-success' : 'text-danger');
    }
});