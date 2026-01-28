// using global fetch

async function testBooking() {
    const url = 'http://localhost:5000/api/bookings/wordpress-booking';

    const bookingData = {
        customer_name: "Test User",
        customer_email: "test@example.com",
        customer_phone: "+1234567890",
        pickup_location: "Dubai Mall",
        dropoff_location: "Burj Khalifa",
        pickup_date: "2026-02-01",
        pickup_time: "10:00",
        vehicle_type: "classic",
        passengers_count: 1,
        fare_aed: 100
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });

        const data = await response.json();
        console.log('Response Status:', response.status);
        console.log('Response Data:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

testBooking();
