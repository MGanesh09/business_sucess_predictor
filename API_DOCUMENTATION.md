# API Documentation - Business Success Predictor AI

Base URL: `http://localhost:5000/api`

---

## 🔐 1. Authentication Endpoints

### Register User
- **URL**: `/auth/register`
- **Method**: `POST`
- **Payload**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "Password123!"
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "message": "Registration successful. OTP sent to email.",
    "email": "jane@example.com",
    "otp": "384729"
  }
  ```

### Verify OTP
- **URL**: `/auth/otp-verify`
- **Method**: `POST`
- **Payload**:
  ```json
  {
    "email": "jane@example.com",
    "otp": "384729"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "message": "Account verified successfully",
    "token": "eyJhbGciOi...",
    "user": {
      "id": "60c72b2f...",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "user",
      "profilePicture": "https://..."
    }
  }
  ```

### Login User
- **URL**: `/auth/login`
- **Method**: `POST`
- **Payload**:
  ```json
  {
    "email": "jane@example.com",
    "password": "Password123!"
  }
  ```
- **Response** (200 OK): Contains JWT `token` and `user` profile data.

### Google Fast Login (Mocked)
- **URL**: `/auth/google-login`
- **Method**: `POST`
- **Payload**:
  ```json
  {
    "email": "user.demo@gmail.com",
    "name": "Demo User",
    "profilePicture": "https://..."
  }
  ```
- **Response** (200 OK): Automatically registers/retrieves user and returns JWT token.

---

## 📈 2. Predictions Endpoints

*All endpoints require header `Authorization: Bearer <token>`*

### Create Success Prediction
- **URL**: `/predictions/create`
- **Method**: `POST`
- **Payload**:
  ```json
  {
    "businessName": "Bloom Cafe",
    "category": "Cafe",
    "budget": 120000,
    "shopArea": 1500,
    "rent": 3000,
    "employeesCount": 3,
    "expectedProductPrice": 8,
    "expectedDailyCustomers": 70,
    "description": "Premium drip and pastries storefront",
    "goals": "Break even in 6 months",
    "location": {
      "lat": 37.7749,
      "lng": -122.4194,
      "address": "123 Market St, San Francisco, CA"
    }
  }
  ```
- **Response** (201 Created): Returns a complete MongoDB Prediction Document including neural scores, demographic arrays, recommendations, and suppliers.

### List User Predictions
- **URL**: `/predictions/list`
- **Method**: `GET`
- **Response** (200 OK): Array of all past prediction reports created by the logged-in user.

### Get Report Detail
- **URL**: `/predictions/detail/:id`
- **Method**: `GET`
- **Response** (200 OK): Detailed JSON document of the specified simulation.

### Delete Report
- **URL**: `/predictions/delete/:id`
- **Method**: `DELETE`
- **Response** (200 OK): `{ "message": "Prediction report removed" }`

---

## 💬 3. AI Chatbot Endpoints

### Get Chat History
- **URL**: `/chat/history/:predictionId`
- **Method**: `GET`
- **Response** (200 OK): Message thread history associated with the specific prediction report.

### Send Message to Advisor
- **URL**: `/chat/message`
- **Method**: `POST`
- **Payload**:
  ```json
  {
    "predictionId": "60c72b2f...",
    "text": "Should I start here?"
  }
  ```
- **Response** (200 OK): Updated message log list containing the user message and the AI's contextual response.

---

## 🛡️ 4. Administration Endpoints

*All endpoints require header `Authorization: Bearer <token>` where user has `role: "admin"`*

### Get System Metrics
- **URL**: `/admin/metrics`
- **Method**: `GET`

### List Users
- **URL**: `/admin/users`
- **Method**: `GET`

### Delete User
- **URL**: `/admin/users/:id`
- **Method**: `DELETE`

### Get Audit Logs
- **URL**: `/admin/logs`
- **Method**: `GET`
