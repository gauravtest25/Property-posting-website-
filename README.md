# Property Posting Website

A modern property posting website built with HTML, CSS, JavaScript, and **Clerk.com authentication**. Property data is stored in localStorage for demo purposes.

## Features
- 🏠 **Home Page**: Browse/search property listings with voice search
- 📄 **Property Details**: View full property details with admin price editing
- ➕ **Post Property**: Add new properties (admin users only)
- 🔐 **Authentication**: Secure login/signup powered by Clerk.com
- 📊 **Dashboard**: User dashboard with liked properties and buy requests
- 👑 **Role-based Access**: Admin and regular user roles
- 📱 **Responsive Design**: Modern, mobile-friendly UI
- 🎤 **Voice Search**: Speak to search properties

## Authentication

This project now uses **Clerk.com** for authentication, providing:
- Secure user management
- Social login options
- Password reset functionality
- Role-based access control
- Production-ready security

## How to Run

### Quick Start (Demo Mode)
1. Download or clone this repository
2. Open `config.js` and add your Clerk publishable key
3. Open `index.html` in your browser
4. Sign up for an account to start using the platform

### Full Setup
1. **Get Clerk Account**: Create account at [clerk.com](https://clerk.com)
2. **Configure Keys**: Follow instructions in `CLERK_SETUP.md`
3. **Set Admin Role**: Add `{"role": "admin"}` to user's public metadata in Clerk dashboard
4. **Test**: Open `index.html` and test authentication flow

## Pages
- `index.html` - Home page
- `property.html` - Property details
- `login.html` - Login
- `signup.html` - Signup
- `post.html` - Post property
- `dashboard.html` - User dashboard

## Notes
- To post or manage properties, sign up and log in.
- All data is local to your browser and will be lost if you clear localStorage.
- Image uploads are stored as base64 in localStorage (for demo purposes). 