import KhaltiCheckout from "khalti-checkout-web";
const handleKhaltiPayment = (booking) => {
    if (!booking.amount) {
        toast.error("Invalid amount for payment");
        return;
    }

    const config = {
        publicKey: "test_public_key_dc74d5f15e85430b85e2674f60ff6a9d", // Replace with your live public key for production
        productIdentity: booking._id,
        productName: booking.hostelName,
        productUrl: "http://localhost:3000/my-bookings",
        eventHandler: {
            onSuccess(payload) {
                console.log("Khalti payment success:", payload);
                toast.success("Payment successful via Khalti!");
                // Here you should call your backend to verify the payment and update booking status
            },
            onError(error) {
                console.error("Khalti error:", error);
                toast.error("Payment failed via Khalti.");
            },
            onClose() {
                console.log("Khalti widget closed");
            },
        },
        paymentPreference: ["KHALTI", "EBANKING", "MOBILE_BANKING", "CONNECT_IPS", "SCT"],
    };

    const checkout = new KhaltiCheckout(config);
    checkout.show({ amount: booking.amount * 100 }); // amount in paisa
};
