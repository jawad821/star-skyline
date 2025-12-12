# Bareerah AI - Airport Transfer Flight Times Integration

## Database Schema Changes

### Bookings Table - New Columns Added
```sql
ALTER TABLE bookings 
ADD COLUMN flight_arrival_time TIMESTAMP WITHOUT TIME ZONE;
ADD COLUMN flight_departure_time TIMESTAMP WITHOUT TIME ZONE;
```

### Column Specifications
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `flight_arrival_time` | TIMESTAMP | YES | NULL | Flight arrival time when customer arrives at airport (for pickups) |
| `flight_departure_time` | TIMESTAMP | YES | NULL | Flight departure time when customer leaves from airport (for dropoffs) |

### How It Works
1. **Booking Type Filter**: Only applies when `booking_type = 'airport_transfer'`
2. **Optional Fields**: Both fields are OPTIONAL - at least one or both can be populated
3. **Timezone**: All times stored as UTC timestamps. Display in Dubai timezone (Asia/Dubai, UTC+4)
4. **Automatic Validation**: Admin Dashboard validates & sends in email notifications if either field is set

## API Request Format (for Bareerah)

### Create Airport Transfer Booking with Flight Times
```json
POST /api/bookings/create

{
  "customer_name": "Ahmed Al-Maktoum",
  "customer_phone": "+971501234567",
  "customer_email": "ahmed@example.com",
  "booking_type": "airport_transfer",
  "pickup_location": "Dubai International Airport",
  "dropoff_location": "Burj Khalifa, Downtown Dubai",
  "distance_km": 25,
  "vehicle_type": "executive",
  "passengers_count": 2,
  "luggage_count": 3,
  "payment_method": "card",
  "flight_arrival_time": "2025-12-15T14:30:00Z",
  "flight_departure_time": null,
  "booking_source": "bareerah_ai"
}
```

### Field Details
- **flight_arrival_time**: ISO 8601 format (UTC). Example: `2025-12-15T14:30:00Z`
- **flight_departure_time**: ISO 8601 format (UTC). Example: `2025-12-15T22:45:00Z`
- Send as `null` if not applicable for that booking leg

## Email Notification Handling

### When Flight Times Are Sent
✅ **Sent in Admin Notification Email** if:
- `flight_arrival_time` is set
- `flight_departure_time` is set
- Either or both values are populated

### Email Display Format
The admin receives professional HTML email with:
```
✈️ FLIGHT INFORMATION
Arrival: 15 Dec 2025, 18:30 (Dubai Time) [if provided]
Departure: 15 Dec 2025, 22:45 (Dubai Time) [if provided]
```

### Example Scenarios

#### Scenario 1: Airport Pickup (Arriving Customer)
```json
{
  "flight_arrival_time": "2025-12-15T14:30:00Z",
  "flight_departure_time": null
}
```
→ Email shows: **Arrival: 15 Dec 2025, 18:30 Dubai Time**

#### Scenario 2: Airport Dropoff (Departing Customer)
```json
{
  "flight_arrival_time": null,
  "flight_departure_time": "2025-12-15T22:45:00Z"
}
```
→ Email shows: **Departure: 15 Dec 2025, 23:45 Dubai Time**

#### Scenario 3: Round Trip (Pickup + Dropoff)
```json
{
  "flight_arrival_time": "2025-12-15T14:30:00Z",
  "flight_departure_time": "2025-12-16T23:45:00Z"
}
```
→ Email shows **both times**

## Frontend UI (Admin Dashboard)

### Create Booking Modal - Airport Transfer Section
When admin selects `✈️ Airport Transfer` from booking type dropdown:

```
✈️ FLIGHT INFORMATION (Optional)
┌─────────────────────────────────┬─────────────────────────────────┐
│ Flight Arrival Time             │ Flight Departure Time           │
│ [DateTime input field]           │ [DateTime input field]          │
│ If customer arriving at airport  │ If customer leaving from airport│
└─────────────────────────────────┴─────────────────────────────────┘
```

- **Fields are conditional**: Only visible when `booking_type = 'airport_transfer'`
- **Date/Time Format**: DD/MM/YYYY --:-- (matches dashboard timezone settings)
- **Validation**: No validation required - both fields optional
- **Submit**: Flight times included automatically if populated

## Response Format

### Successful Booking Creation
```json
{
  "success": true,
  "data": {
    "id": "abc12345-def6-7890-ghij-klmnopqrstuv",
    "booking_type": "airport_transfer",
    "flight_arrival_time": "2025-12-15T14:30:00Z",
    "flight_departure_time": null,
    "status": "in-process",
    "fare_aed": 125.50,
    "created_at": "2025-12-12T10:30:00Z"
  }
}
```

## Testing the Integration

### Test Case 1: Arrival Pickup
```bash
curl -X POST http://localhost:5000/api/bookings/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "customer_name": "Test Customer",
    "customer_phone": "+971501234567",
    "booking_type": "airport_transfer",
    "pickup_location": "DXB Airport",
    "dropoff_location": "Downtown Dubai",
    "distance_km": 25,
    "vehicle_type": "executive",
    "passengers_count": 1,
    "luggage_count": 2,
    "payment_method": "card",
    "flight_arrival_time": "2025-12-15T14:30:00Z",
    "booking_source": "bareerah_ai"
  }'
```

### Test Case 2: Departure Dropoff
```bash
curl -X POST http://localhost:5000/api/bookings/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "customer_name": "Test Customer",
    "customer_phone": "+971501234567",
    "booking_type": "airport_transfer",
    "pickup_location": "Downtown Dubai",
    "dropoff_location": "DXB Airport Terminal 3",
    "distance_km": 25,
    "vehicle_type": "executive",
    "passengers_count": 1,
    "luggage_count": 1,
    "payment_method": "card",
    "flight_departure_time": "2025-12-16T23:45:00Z",
    "booking_source": "bareerah_ai"
  }'
```

## Migration from Old Integration

**If you were sending custom fields before**, simply map to these fields:
- `customer_flight_arrival` → `flight_arrival_time`
- `flight_time` → `flight_departure_time`
- Any timestamp format will be accepted and normalized to UTC

## Support & Troubleshooting

- **Timestamps Not Showing in Email?** Ensure flight times are ISO 8601 format
- **Wrong Timezone?** All times stored in UTC, converted to Dubai timezone (UTC+4) for display
- **Null Handling**: Send `null` explicitly for unused fields
- **No Validation on Empty**: Both fields can be null/empty - no errors thrown

---

**Last Updated**: 12 December 2025  
**System**: Starsky Line Limousine Backend v2.0  
**Integration Status**: ✅ Live
