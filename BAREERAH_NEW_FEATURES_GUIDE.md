# Bareerah New Features Guide - November 2025

## Quick Overview

Three major features added to the Bareerah booking system:

1. **✅ Round-Trip Bookings** - Pickup → Destination → Return after X hours
2. **✅ Multi-Stop Bookings** - Visit multiple stops in one trip
3. **✅ Professional Email Notifications** - Beautiful HTML emails with journey visualization

---

## 1. ROUND-TRIP BOOKINGS

### What It Does
Customer books a ride to a destination, stays for X hours, then returns to the original pickup point.

### Endpoint
```
POST /api/bookings/create-round-trip
```

### Example Request
```json
{
  "customer_name": "Ahmed Al Mansouri",
  "customer_phone": "+971501234567",
  "customer_email": "ahmed@example.ae",
  "booking_type": "round_trip",
  "vehicle_type": "luxury",
  "vehicle_model": "Mercedes S-Class",
  "vehicle_color": "Black",
  "passengers_count": 2,
  "luggage_count": 1,
  "pickup_location": "Dubai International Airport",
  "meeting_location": "Burj Khalifa Downtown",
  "return_after_hours": 3,
  "distance_km": 25,
  "payment_method": "card",
  "notes": "VIP client - complimentary water",
  "booking_source": "bareerah_ai"
}
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "550e8400-...",
    "booking_type": "round_trip",
    "fare_aed": 410,
    "return_after_hours": 3,
    "vehicle_model": "Mercedes S-Class",
    "vehicle_color": "Black",
    "stops": [
      {
        "stop_number": 1,
        "location": "Dubai International Airport",
        "stop_type": "pickup",
        "duration_minutes": 0
      },
      {
        "stop_number": 2,
        "location": "Burj Khalifa Downtown",
        "stop_type": "intermediate",
        "duration_minutes": 180
      },
      {
        "stop_number": 3,
        "location": "Dubai International Airport",
        "stop_type": "dropoff",
        "duration_minutes": 0
      }
    ]
  }
}
```

### Journey Timeline Shown in Email
```
📍 Dubai International Airport
    ↓ 12 km
🎯 Burj Khalifa Downtown (3 hours)
    ↓ 12 km
🏁 Dubai International Airport
```

---

## 2. MULTI-STOP BOOKINGS

### What It Does
Customer visits multiple locations in one booking. Perfect for shopping tours, business visits, or sightseeing.

### Endpoint
```
POST /api/bookings/create-multi-stop
```

### Example Request
```json
{
  "customer_name": "Fatima Hassan",
  "customer_phone": "+971505555555",
  "customer_email": "fatima@example.ae",
  "booking_type": "multi_stop",
  "vehicle_type": "executive",
  "vehicle_model": "Mercedes E-Class",
  "vehicle_color": "White",
  "passengers_count": 2,
  "luggage_count": 3,
  "pickup_location": "Dubai Marina",
  "dropoff_location": "Downtown Dubai",
  "distance_km": 40,
  "payment_method": "card",
  "notes": "Shopping tour - driver should wait at each location",
  "booking_source": "bareerah_ai",
  "stops": [
    {
      "location": "The Dubai Mall",
      "stop_type": "intermediate",
      "duration_minutes": 60
    },
    {
      "location": "Gold Souk",
      "stop_type": "intermediate",
      "duration_minutes": 45
    },
    {
      "location": "Spice Market",
      "stop_type": "intermediate",
      "duration_minutes": 30
    }
  ]
}
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "660e8400-...",
    "booking_type": "multi_stop",
    "fare_aed": 320,
    "vehicle_model": "Mercedes E-Class",
    "vehicle_color": "White",
    "stops": [
      {
        "stop_number": 1,
        "location": "Dubai Marina",
        "stop_type": "pickup",
        "duration_minutes": 0
      },
      {
        "stop_number": 2,
        "location": "The Dubai Mall",
        "stop_type": "intermediate",
        "duration_minutes": 60
      },
      {
        "stop_number": 3,
        "location": "Gold Souk",
        "stop_type": "intermediate",
        "duration_minutes": 45
      },
      {
        "stop_number": 4,
        "location": "Spice Market",
        "stop_type": "intermediate",
        "duration_minutes": 30
      },
      {
        "stop_number": 5,
        "location": "Downtown Dubai",
        "stop_type": "dropoff",
        "duration_minutes": 0
      }
    ]
  }
}
```

### Journey Timeline Shown in Email
```
📍 Dubai Marina
    ↓ 8 km (1 hour)
🎯 The Dubai Mall
    ↓ 3 km (45 min)
🎯 Gold Souk
    ↓ 2 km (30 min)
🎯 Spice Market
    ↓ 12 km
🏁 Downtown Dubai
```

---

## 3. PROFESSIONAL EMAIL NOTIFICATIONS ✨ NEW

### What It Does
Automatic beautiful HTML email sent to admin (aizaz.dmp@gmail.com) for every booking.

### Email Design Features
- ✅ Gradient luxury header
- ✅ Booking reference with status badge
- ✅ Passenger & luggage info
- ✅ **Complete journey visualization** with all stops
- ✅ Vehicle model + color prominently displayed
- ✅ **Special instructions/notes** from customer
- ✅ Fare breakdown with payment method
- ✅ 24/7 support contact
- ✅ "What's Next" guide

### Email Contents

**Subject:**
```
✅ Your Bareerrah Ride Confirmed - 🔄 Round Trip - Ref #550E8400
```

**Email Includes:**

1. **Booking Reference**
   - ID (550E8400)
   - Status (PENDING CONFIRMATION)
   - Booking time

2. **Passenger Details**
   - Passengers: 2 people
   - Luggage: 1 bag
   - Contact: +971501234567

3. **Complete Journey Visualization**
   ```
   📍 Pickup: Dubai International Airport
      ↓ 3 hours ↓
   🎯 Destination: Burj Khalifa Downtown
      ↓ Return ↓
   🏁 Return To: Dubai International Airport
   
   Distance: 25 km
   Return After: 3 hours
   ```

4. **Vehicle Details**
   - Model: Mercedes S-Class
   - Color: Black
   - Capacity: Up to 4 seats, Large trunk

5. **Fare & Payment**
   ```
   Total Fare: AED 410.00
   Payment: Card - Prepaid
   ```

6. **Special Instructions**
   - Shows any notes from booking
   - Example: "VIP client - complimentary water"

7. **Support Info**
   - Phone: +971 4 XXXX XXXX
   - Email: support@bareerah.com
   - Available: 24/7

---

## REQUIRED FIELDS - ALL BOOKING TYPES

```json
{
  "customer_name": "string (required)",
  "customer_phone": "+971XXXXXXXXX (required)",
  "customer_email": "email@example.ae (required - for notifications)",
  "booking_type": "point_to_point | round_trip | multi_stop (required)",
  "vehicle_type": "luxury | executive | sedan | suv | etc (required)",
  "vehicle_model": "Mercedes S-Class (required)",
  "vehicle_color": "Black | White | Silver | Gray | Red | Blue | Gold (required)",
  "passengers_count": "1-14 (required)",
  "luggage_count": "0-8 (required)",
  "pickup_location": "Dubai Airport Terminal 3 (required)",
  "dropoff_location": "Burj Khalifa (required)",
  "distance_km": "25 (required)",
  "payment_method": "card | cash (required)",
  "booking_source": "bareerah_ai (required)",
  "notes": "Optional - up to 2000 characters"
}
```

---

## ROUND-TRIP SPECIFIC FIELDS

```json
{
  "meeting_location": "Burj Khalifa (required - intermediate destination)",
  "return_after_hours": "3 (required - hours to stay)"
}
```

---

## MULTI-STOP SPECIFIC FIELDS

```json
{
  "stops": [
    {
      "location": "The Dubai Mall (required)",
      "stop_type": "intermediate (required)",
      "duration_minutes": "60 (required - wait time)"
    },
    {
      "location": "Gold Souk (required)",
      "stop_type": "intermediate (required)",
      "duration_minutes": "45 (required)"
    }
  ]
}
```

---

## VEHICLE COLOR OPTIONS (MANDATORY)

**Must use exactly one of these:**

1. Black ⚫
2. White ⚪
3. Silver 🩶
4. Gray ⛓️
5. Red 🔴
6. Blue 🔵
7. Gold 🟡

---

## CURL EXAMPLES

### Create Round-Trip Booking
```bash
curl -X POST http://localhost:5000/api/bookings/create-round-trip \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "customer_name": "Ahmed Al Mansouri",
    "customer_phone": "+971501234567",
    "customer_email": "ahmed@example.ae",
    "booking_type": "round_trip",
    "vehicle_type": "luxury",
    "vehicle_model": "Mercedes S-Class",
    "vehicle_color": "Black",
    "passengers_count": 2,
    "luggage_count": 1,
    "pickup_location": "Dubai International Airport",
    "meeting_location": "Burj Khalifa Downtown",
    "return_after_hours": 3,
    "distance_km": 25,
    "payment_method": "card",
    "notes": "VIP client",
    "booking_source": "bareerah_ai"
  }'
```

### Create Multi-Stop Booking
```bash
curl -X POST http://localhost:5000/api/bookings/create-multi-stop \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "customer_name": "Fatima Hassan",
    "customer_phone": "+971505555555",
    "customer_email": "fatima@example.ae",
    "booking_type": "multi_stop",
    "vehicle_type": "executive",
    "vehicle_model": "Mercedes E-Class",
    "vehicle_color": "White",
    "passengers_count": 2,
    "luggage_count": 3,
    "pickup_location": "Dubai Marina",
    "dropoff_location": "Downtown Dubai",
    "distance_km": 40,
    "payment_method": "card",
    "booking_source": "bareerah_ai",
    "stops": [
      {"location": "The Dubai Mall", "stop_type": "intermediate", "duration_minutes": 60},
      {"location": "Gold Souk", "stop_type": "intermediate", "duration_minutes": 45},
      {"location": "Spice Market", "stop_type": "intermediate", "duration_minutes": 30}
    ]
  }'
```

---

## ERROR RESPONSES

### Invalid Color
```json
{
  "success": false,
  "error": "Invalid vehicle color. Must be: Black, White, Silver, Gray, Red, Blue, Gold"
}
```

### Missing Field
```json
{
  "success": false,
  "error": "Missing required field: vehicle_model"
}
```

### Passengers Exceed Capacity
```json
{
  "success": false,
  "error": "Vehicle capacity exceeded. Selected vehicle supports maximum 4 passengers."
}
```

---

## INTEGRATION CHECKLIST

- ✅ All endpoints live and tested
- ✅ Email notifications sending to aizaz.dmp@gmail.com
- ✅ Journey visualization working for all booking types
- ✅ Vehicle details (model + color) captured & displayed
- ✅ Special notes/instructions included in emails
- ✅ Database properly storing all stop information
- ✅ Production ready

---

## WHAT'S NEXT (Production)

To send emails to customer addresses instead of just admin:

1. **Verify Domain** at resend.com/domains
2. **Update Email** RESEND_FROM_EMAIL in environment
3. **System will automatically** send to customer_email

Current: ✅ Testing mode (emails to admin)  
Production: 🚀 Ready (just needs domain verification)

---

## CONTACT SUPPORT

- **Email**: support@bareerah.com
- **Hours**: 24/7
- **Response**: < 2 hours

---

**Last Updated:** November 30, 2025  
**Status:** ✅ Production Ready
