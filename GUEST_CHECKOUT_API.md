# Guest Checkout API

## Overview
The Guest Checkout API allows users to create orders without requiring account registration or login. This is particularly useful for customers who prefer a quick checkout process.

## Endpoint
```
POST /api/Customer/CreateGuestCheckout
```

## Request Body
The API expects a JSON object with the following structure:

```json
{
  "email": "string",
  "shipping": {
    "email": "string",
    "firstName": "string",
    "lastName": "string", 
    "phone": "string",
    "streetName": "string",
    "streetNumber": "string",
    "postalCode": "string",
    "city": "string",
    "typeId": 700
  },
  "billing": {
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "phone": "string", 
    "streetName": "string",
    "streetNumber": "string",
    "postalCode": "string",
    "city": "string",
    "typeId": 701
  },
  "items": [
    {
      "productId": "integer",
      "price": "number",
      "quantity": "integer"
    }
  ]
}
```

### Field Descriptions

#### Root Level
- `email` (required): Guest customer's email address
- `shipping` (required): Shipping address information
- `billing` (optional): Billing address information. If not provided, shipping address is used as billing address
- `items` (required): Array of items to order

#### Address Fields
- `email`: Contact email for the address
- `firstName`: First name of the recipient
- `lastName`: Last name of the recipient  
- `phone`: Phone number for delivery contact
- `streetName`: Street name
- `streetNumber`: Street number/building number
- `postalCode`: ZIP/Postal code
- `city`: City name
- `typeId`: Address type ID (700 for shipping, 701 for billing)

#### Item Fields
- `productId`: ID of the product to order
- `price`: Unit price of the product
- `quantity`: Quantity to order

## Response

### Success Response (200 OK)
```json
{
  "orderId": 123,
  "message": "Guest checkout created successfully"
}
```

### Error Responses

#### Bad Request (400)
```json
{
  "message": "Error message describing what went wrong"
}
```

Common validation errors:
- "Guest checkout data is required"
- "Email is required"
- "At least one item is required"
- "Shipping address is required"

#### Internal Server Error (500)
```json
{
  "message": "An error occurred while processing the guest checkout."
}
```

## Implementation Details

### What happens during guest checkout:
1. **Guest Customer Creation**: A guest customer record is created or retrieved using the provided email
2. **Address Management**: Shipping and billing addresses are created and linked to the guest customer
3. **Order Creation**: An order is created with status "Pending" (ID: 1000)
4. **Order Items**: Individual line items are added to the order
5. **Transaction Handling**: All operations are wrapped in a database transaction for data consistency

### Database Changes:
- New customer record with status "Guest" (603)
- Address records for shipping and (optionally) billing
- Order record with "Pending" status  
- OrderItem records for each product

## Example Usage

```bash
curl -X POST "https://your-api-domain.com/api/Customer/CreateGuestCheckout" \
  -H "Content-Type: application/json" \
  -d @sample-guest-checkout.json
```

## Security Considerations
- Guest customers are created with random passwords
- No authentication tokens are returned for guest checkouts  
- Guest customer records have limited privileges
- Email addresses are validated for basic format compliance

## Related Endpoints
- `GET /api/Product/{id}` - Get product details for price validation
- `GET /api/Order/{id}` - Retrieve order status (if order tracking is needed)

## Error Handling
The API includes comprehensive error handling with:
- Input validation for required fields
- Transaction rollback on database errors
- Detailed logging for troubleshooting
- User-friendly error messages