#!/bin/bash

echo "Testing registration endpoint..."
curl -v -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "surajsah12@gmail.com",
    "password": "password123",
    "role": "PATIENT",
    "firstName": "suraj",
    "lastName": "sah",
    "phone": "9804851453"
  }' 2>&1
