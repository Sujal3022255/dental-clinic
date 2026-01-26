#!/bin/bash

echo "Testing Registration Endpoint..."
echo "================================"
echo ""

# Test 1: Register a new patient
echo "Test 1: Registering a new PATIENT user..."
TIMESTAMP=$(date +%s)
EMAIL="testpatient${TIMESTAMP}@example.com"

RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"password123\",
    \"role\": \"PATIENT\",
    \"firstName\": \"John\",
    \"lastName\": \"Doe\",
    \"phone\": \"1234567890\"
  }")

echo "Response: $RESPONSE"
echo ""

# Check if the user was created
if echo "$RESPONSE" | grep -q "token"; then
  echo "✓ Test 1 PASSED: Patient user registered successfully"
else
  echo "✗ Test 1 FAILED: Patient registration failed"
  echo "Error: $RESPONSE"
fi

echo ""
echo "Test 2: Registering a new DENTIST user..."
TIMESTAMP2=$(date +%s)
EMAIL2="testdentist${TIMESTAMP2}@example.com"

RESPONSE2=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL2\",
    \"password\": \"password123\",
    \"role\": \"DENTIST\",
    \"firstName\": \"Dr. Jane\",
    \"lastName\": \"Smith\",
    \"phone\": \"0987654321\",
    \"specialization\": \"Orthodontics\",
    \"licenseNumber\": \"LIC${TIMESTAMP2}\"
  }")

echo "Response: $RESPONSE2"
echo ""

if echo "$RESPONSE2" | grep -q "token"; then
  echo "✓ Test 2 PASSED: Dentist user registered successfully"
else
  echo "✗ Test 2 FAILED: Dentist registration failed"
  echo "Error: $RESPONSE2"
fi

echo ""
echo "================================"
echo "Tests Complete"
