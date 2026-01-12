#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Initializing Git repository and pushing to GitHub...${NC}\n"

# Check if git is initialized
if [ ! -d .git ]; then
    echo -e "${GREEN}Initializing Git repository...${NC}"
    git init
else
    echo -e "${GREEN}Git repository already initialized${NC}"
fi

# Add all files
echo -e "${GREEN}Adding files to Git...${NC}"
git add .

# Check if there are changes to commit
if git diff-index --quiet HEAD --; then
    echo -e "${BLUE}No changes to commit${NC}"
else
    echo -e "${GREEN}Committing changes...${NC}"
    git commit -m "Initial commit: Dental Clinic Management System

    Features:
    - Complete authentication system with JWT
    - Patient, Dentist, and Admin dashboards
    - Appointment management with full CRUD
    - Treatment records management
    - Dentist profiles and availability
    - Error handling and validation
    - Database migrations and seeding
    "
fi

# Add remote if not already added
if ! git remote | grep -q origin; then
    echo -e "${GREEN}Adding GitHub remote...${NC}"
    git remote add origin git@github.com:Sujal3022255/dental-clinic.git
else
    echo -e "${GREEN}Remote 'origin' already exists${NC}"
fi

# Get current branch name
BRANCH=$(git branch --show-current)

# Push to GitHub
echo -e "${GREEN}Pushing to GitHub...${NC}"
git push -u origin $BRANCH

echo -e "\n${GREEN}✅ Successfully pushed to GitHub!${NC}"
echo -e "${BLUE}Repository: https://github.com/Sujal3022255/dental-clinic${NC}"
