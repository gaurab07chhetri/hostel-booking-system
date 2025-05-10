// Khalti configuration
console.log('Khalti Public Key:', import.meta.env.VITE_KHALTI_PUBLIC_KEY);

export const KHALTI_CONFIG = {
    // Test Public Key - Using the official test key
    publicKey: "ee8518d2759543e5bfb32f90bea30905",
    productIdentity: "1234567890",
    productName: "Hostel Booking",
    productUrl: "http://localhost:5173",
    eventHandler: {
        onSuccess(payload) {
            console.log('Payment Success:', payload);
        },
        onError(error) {
            console.log('Payment Error:', error);
        },
        onClose() {
            console.log('Payment widget closed');
        }
    },
    paymentPreference: [
        "KHALTI",
        "EBANKING",
        "MOBILE_BANKING",
        "CONNECT_IPS",
        "SCT"
    ],
};

// Helper function to format amount for Khalti (converts to paisa)
export const formatKhaltiAmount = (amount) => {
    try {
        // Remove any commas and convert to number
        const cleanAmount = String(amount).replace(/,/g, '');
        const numericAmount = parseFloat(cleanAmount);
        
        if (isNaN(numericAmount)) {
            throw new Error('Invalid amount');
        }
        
        // Convert to paisa (multiply by 100) and ensure it's an integer
        const paisaAmount = Math.round(numericAmount * 100);
        
        // Validate minimum amount (Rs. 10 = 1000 paisa)
        if (paisaAmount < 1000) {
            throw new Error('Amount must be at least Rs. 10');
        }
        
        return paisaAmount;
    } catch (error) {
        console.error('Amount formatting error:', error);
        throw error;
    }
};

// Helper function to generate a unique transaction ID
export const generateTransactionId = () => {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}; 