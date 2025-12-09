# WordPress Booking Integration Guide

## Overview
Yeh guide WordPress website ke liye hai jo bookings isse backend system ko bhejni hain.

---

## 📍 WordPress Booking Endpoint

### Create Booking
**URL:**
```
https://YOUR-APP-URL/api/bookings/wordpress-booking
```

**Method:** `POST`

**Authentication:** ❌ **NO authentication required** (public endpoint)

---

## 📤 Request Format (JSON)

WordPress website ko yeh data bhejni hai:

```json
{
  "customer_name": "Ahmed Mohammed",
  "customer_email": "ahmed@example.com",
  "customer_phone": "+971501234567",
  "pickup_location": "Dubai Airport Terminal 3",
  "dropoff_location": "Burj Khalifa",
  "vehicle_type": "luxury",
  "booking_type": "point_to_point",
  "passengers_count": 2,
  "luggage_count": 1,
  "distance_km": 30,
  "payment_method": "card",
  "notes": "Please call 10 minutes before arrival",
  "wordpress_booking_id": "WP-12345678"
}
```

---

## 🔧 Field Details

### **Required Fields** (zaruri)
| Field | Type | Example | Description |
|-------|------|---------|-------------|
| `customer_name` | String | "Ahmed Mohammed" | Customer ka naam |
| `customer_email` | String | "ahmed@example.com" | Customer ka email |
| `customer_phone` | String | "+971501234567" | Customer ka phone |
| `pickup_location` | String | "Dubai Airport T3" | Pickup location |
| `dropoff_location` | String | "Burj Khalifa" | Dropoff location |
| `vehicle_type` | String | "luxury" | Vehicle type |

### **Optional Fields** (optional)
| Field | Type | Default | Example |
|-------|------|---------|---------|
| `booking_type` | String | "point_to_point" | "point_to_point", "multi_stop", "round_trip", "hourly_rental" |
| `passengers_count` | Number | 1 | 2, 3, 4 |
| `luggage_count` | Number | 0 | 1, 2, 3 |
| `distance_km` | Number | 15 | 20, 30, 50 |
| `payment_method` | String | "cash" | "cash" or "card" |
| `notes` | String | null | "Special instructions" |
| `wordpress_booking_id` | String | null | "WP-123" (unique ID from WordPress) |

### **Valid Vehicle Types**
```
classic
executive
first_class
urban_suv
luxury
luxury_suv
elite_van
mini_bus
```

---

## ✅ Success Response (201)

Jab booking successfully create hojaye:

```json
{
  "success": true,
  "message": "Booking created successfully from WordPress",
  "data": {
    "booking_id": "d5d1c965-6fd2-4f62-8325-07d9fb7b3689",
    "external_id": "WP-12345678",
    "customer_name": "Ahmed Mohammed",
    "customer_email": "ahmed@example.com",
    "customer_phone": "+971501234567",
    "pickup_location": "Dubai Airport Terminal 3",
    "dropoff_location": "Burj Khalifa",
    "vehicle_type": "luxury",
    "booking_type": "point_to_point",
    "passengers_count": 2,
    "luggage_count": 1,
    "distance_km": 30,
    "fare_aed": 285.50,
    "payment_method": "card",
    "status": "assigned",
    "assigned_vehicle": {
      "id": "vehicle-123",
      "model": "Mercedes S-Class",
      "color": "Black",
      "driver_id": "driver-456"
    },
    "created_at": "2025-12-09T10:30:00.000Z",
    "booking_source": "wordpress"
  }
}
```

---

## ❌ Error Response (400/500)

Agar kuch galat ho:

```json
{
  "success": false,
  "error": "Missing required fields: vehicle_type",
  "required_fields": [
    "customer_name",
    "customer_email",
    "customer_phone",
    "pickup_location",
    "dropoff_location",
    "vehicle_type"
  ]
}
```

---

## 💡 WordPress Ke Liye Fare Calculate Karne Ke Liye

**URL:**
```
https://YOUR-APP-URL/api/bookings/wordpress-calculate-fare
```

**Method:** `POST`

**Request:**
```json
{
  "vehicle_type": "luxury",
  "booking_type": "point_to_point",
  "distance_km": 30
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "vehicle_type": "luxury",
    "booking_type": "point_to_point",
    "distance_km": 30,
    "base_fare": 285.50,
    "discount_percentage": 0,
    "final_fare": 285.50,
    "currency": "AED"
  }
}
```

---

## 🔄 Idempotency (Duplicate Prevention)

Agar WordPress same booking do baar bheje (network issue se):

1. WordPress ko unique `wordpress_booking_id` use karna chahiye
2. Hum check karte hain: agar same `wordpress_booking_id` pehle se exist karta hai
3. Hum response mein `"idempotent": true` bhejte hain
4. **Second request** same booking return hota hai (duplicate nahi banta)

---

## 📝 Complete WordPress Form Example

WordPress form mein customer yeh fields fill kare:

```
Name:          [______________________]
Email:         [______________________]
Phone:         [______________________]
Pickup:        [Select Location  ▼]
Dropoff:       [Select Location  ▼]
Vehicle Type:  [Select Vehicle   ▼]
Passengers:    [1 ▼]
Luggage:       [0 ▼]
Distance:      [Auto-calculated or editable]
Special Notes: [_____________________]
[Calculate Fare] → Shows "AED 285.50"
[Book Now Button]
```

---

## 🚀 Integration Steps for WordPress

1. **HTML Form banao** - above fields ke saath
2. **JavaScript** - form submit par:
   ```javascript
   const bookingData = {
     customer_name: document.getElementById('name').value,
     customer_email: document.getElementById('email').value,
     customer_phone: document.getElementById('phone').value,
     pickup_location: document.getElementById('pickup').value,
     dropoff_location: document.getElementById('dropoff').value,
     vehicle_type: document.getElementById('vehicle').value,
     passengers_count: parseInt(document.getElementById('passengers').value),
     luggage_count: parseInt(document.getElementById('luggage').value),
     distance_km: parseFloat(document.getElementById('distance').value),
     payment_method: document.getElementById('payment').value,
     notes: document.getElementById('notes').value,
     wordpress_booking_id: 'WP-' + Date.now() // Unique ID
   };

   fetch('https://YOUR-APP-URL/api/bookings/wordpress-booking', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(bookingData)
   })
   .then(res => res.json())
   .then(data => {
     if (data.success) {
       alert(`Booking Confirmed! ID: ${data.data.booking_id}`);
       console.log('Assigned Vehicle:', data.data.assigned_vehicle);
     } else {
       alert('Error: ' + data.error);
     }
   });
   ```

---

## ✨ Automatic Features

Jab WordPress booking aaye:

- ✅ **Booking auto-creates** in our system
- ✅ **Fare auto-calculates** based on distance & vehicle
- ✅ **Vehicle auto-assigns** (if available)
- ✅ **Booking status** = "assigned" (agar vehicle mil gaye) ya "pending"
- ✅ **Booking source** = "wordpress" (taake hum jaane)

---

## ⚙️ Production Ready

- ✅ No authentication required (safe for public websites)
- ✅ Idempotency built-in (duplicate prevention)
- ✅ Error handling robust
- ✅ Auto-vehicle assignment
- ✅ Email/SMS notifications will be sent
- ✅ Admin dashboard pe real-time show hoga

---

## 📞 Support

Koi issue? Logs dekhen:
- Admin dashboard → Bookings tab → WordPress bookings nazar aayenge
- Status: pending, assigned, in-process, completed
- Filter by "wordpress" booking_source

---

**Ready to integrate? Let us know!** 🚀
