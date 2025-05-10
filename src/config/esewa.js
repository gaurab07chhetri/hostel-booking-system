// eSewa Configuration
export const ESEWA_CONFIG = {
    MERCHANT_ID: process.env.REACT_APP_ESEWA_MERCHANT_ID || 'EPAYTEST',
    SUCCESS_URL: process.env.REACT_APP_ESEWA_SUCCESS_URL || 'http://localhost:5000/api/esewa/complete-payment',
    FAILURE_URL: process.env.REACT_APP_ESEWA_FAILURE_URL || 'http://localhost:3000/payment-failure',
    TEST_URL: 'https://rc-epay.esewa.com.np/api/epay/main/v2/form'
};

// Format amount for eSewa (converts to paisa)
export const formatEsewaAmount = (amount) => {
    if (typeof amount === 'string') {
        amount = parseFloat(amount);
    }
    
    if (isNaN(amount) || amount <= 0) {
        throw new Error('Invalid amount');
    }
    
    // eSewa expects amount in rupees
    return amount.toFixed(2);
}; 