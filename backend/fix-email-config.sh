#!/bin/bash

# Email Configuration Fix Script
# Automated diagnosis and repair

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📧 EMAIL DELIVERY - AUTOMATED FIX SCRIPT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ ERROR: .env file not found!${NC}"
    exit 1
fi

echo -e "${CYAN}[1/4] Reading current configuration...${NC}"
source .env 2>/dev/null || true

echo "Current EMAIL_USER: ${EMAIL_USER:-'NOT SET'}"
echo "Current EMAIL_PASS: ${EMAIL_PASS:0:4}**** (${#EMAIL_PASS} chars)"
echo ""

# Check if credentials are placeholders
IS_PLACEHOLDER=0
if [[ "$EMAIL_USER" == *"your-email"* ]] || [[ "$EMAIL_PASS" == *"your-gmail-app-password"* ]]; then
    IS_PLACEHOLDER=1
fi

if [ $IS_PLACEHOLDER -eq 1 ]; then
    echo -e "${RED}❌ PROBLEM DETECTED: Placeholder credentials${NC}"
    echo ""
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}📝 INTERACTIVE FIX WIZARD${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    echo -e "${CYAN}Step 1: Get Gmail App Password${NC}"
    echo ""
    echo "To generate an App Password:"
    echo "  1. Open: https://myaccount.google.com/apppasswords"
    echo "  2. Sign in to your Google Account"
    echo "  3. Select app: 'Mail'"
    echo "  4. Select device: 'Other (Custom name)'"
    echo "  5. Type: 'Dental Clinic'"
    echo "  6. Click 'Generate'"
    echo "  7. Copy the 16-character password"
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANT: You need 2-Factor Authentication enabled first!${NC}"
    echo "   Enable 2FA at: https://myaccount.google.com/security"
    echo ""
    
    read -p "Press ENTER when you have your App Password ready..."
    echo ""
    
    echo -e "${CYAN}Step 2: Enter Your Credentials${NC}"
    echo ""
    
    read -p "Enter your Gmail address: " NEW_EMAIL_USER
    echo ""
    
    read -sp "Enter your App Password (16 chars): " NEW_EMAIL_PASS
    echo ""
    echo ""
    
    # Validate inputs
    if [[ -z "$NEW_EMAIL_USER" ]] || [[ ! "$NEW_EMAIL_USER" =~ @.*\. ]]; then
        echo -e "${RED}❌ Invalid email format!${NC}"
        exit 1
    fi
    
    if [ ${#NEW_EMAIL_PASS} -lt 10 ]; then
        echo -e "${RED}❌ App Password too short! Expected 16 characters.${NC}"
        exit 1
    fi
    
    echo -e "${CYAN}[2/4] Backing up current .env...${NC}"
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    echo -e "${GREEN}✅ Backup created${NC}"
    echo ""
    
    echo -e "${CYAN}[3/4] Updating .env file...${NC}"
    
    # Update EMAIL_USER
    if grep -q "^EMAIL_USER=" .env; then
        # macOS compatible sed
        sed -i '' "s|^EMAIL_USER=.*|EMAIL_USER=$NEW_EMAIL_USER|g" .env
    else
        echo "EMAIL_USER=$NEW_EMAIL_USER" >> .env
    fi
    
    # Update EMAIL_PASS
    if grep -q "^EMAIL_PASS=" .env; then
        # macOS compatible sed
        sed -i '' "s|^EMAIL_PASS=.*|EMAIL_PASS=$NEW_EMAIL_PASS|g" .env
    else
        echo "EMAIL_PASS=$NEW_EMAIL_PASS" >> .env
    fi
    
    echo -e "${GREEN}✅ Configuration updated${NC}"
    echo ""
    
else
    echo -e "${GREEN}✅ Real credentials detected${NC}"
    echo ""
fi

echo -e "${CYAN}[4/4] Validating configuration...${NC}"
echo ""

# Run the TypeScript validator
npx ts-node validate-email-config.ts

VALIDATION_EXIT_CODE=$?

echo ""

if [ $VALIDATION_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ EMAIL CONFIGURATION FIXED!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${CYAN}Next Steps:${NC}"
    echo "  1. Restart the backend server"
    echo "     ${YELLOW}npm run dev${NC}"
    echo ""
    echo "  2. Test email delivery"
    echo "     Register a new user at: http://localhost:5174/register"
    echo ""
    echo "  3. Check your inbox for OTP email"
    echo "     (Also check Spam folder!)"
    echo ""
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}❌ CONFIGURATION STILL HAS ISSUES${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${CYAN}Common Issues:${NC}"
    echo ""
    echo "1. Using regular Gmail password instead of App Password"
    echo "   ${YELLOW}→ Must use 16-character App Password${NC}"
    echo ""
    echo "2. 2FA not enabled on Google Account"
    echo "   ${YELLOW}→ Enable at: https://myaccount.google.com/security${NC}"
    echo ""
    echo "3. Network/DNS issues"
    echo "   ${YELLOW}→ Check internet connection${NC}"
    echo "   ${YELLOW}→ Try: ping smtp.gmail.com${NC}"
    echo ""
    echo "4. Firewall blocking port 587"
    echo "   ${YELLOW}→ Try port 465 instead (update EMAIL_PORT in .env)${NC}"
    echo ""
fi

echo ""
echo -e "${BLUE}For detailed troubleshooting, see:${NC}"
echo "  📄 EMAIL_DELIVERY_FIX.md"
echo ""
