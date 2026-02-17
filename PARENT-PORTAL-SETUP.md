# 👨‍👩‍👧‍👦 Parent Portal Setup Guide

## Overview
The Parent Portal allows parents to view their child's account information, fee structure, payment history, and outstanding balance using their registered phone number.

## 🎯 Features

### For Parents:
- ✅ Login with phone number (no password needed)
- ✅ View student information
- ✅ Check fee structure by term
- ✅ View payment history
- ✅ See outstanding balance
- ✅ Mobile-friendly interface

## 📋 Setup Instructions

### Step 1: Update Google Apps Script URL

1. Open `parent-portal.html` in a text editor
2. Find this line (around line 180):
```javascript
var scriptURL = 'https://script.google.com/macros/s/...';
```
3. Replace with YOUR Google Apps Script URL (same one used in `index-working.html`)
4. Save the file

### Step 2: Ensure Parent Phone Numbers are Registered

Parents can only login if their phone number is registered in the Students sheet:

1. Open your Google Sheet
2. Go to "Students" sheet
3. Make sure the "Parent Phone" column has phone numbers
4. Format: `08012345678` (no spaces or dashes)

### Step 3: Test the Portal

1. Open `parent-portal.html` in a web browser
2. Enter a parent phone number that exists in your database
3. Click "Login"
4. You should see the student dashboard

## 🔐 How Login Works

### Parent Login Process:
1. Parent enters their phone number
2. System searches Students sheet for matching phone number
3. If found, displays student information
4. Parent can view fees and payments

### Security Notes:
- Phone number must match exactly what's in the database
- No password required (phone number acts as identifier)
- Session saved in browser (stays logged in)
- Logout clears session

## 📱 Parent Instructions

### How to Use the Portal:

1. **Login:**
   - Go to the Parent Portal URL
   - Enter your phone number (as registered with the school)
   - Click "Login"

2. **View Student Info:**
   - See student ID, name, class, gender
   - View parent/guardian information

3. **Check Fees:**
   - Select a term from the dropdown
   - Click "View Term Details"
   - See complete fee breakdown

4. **View Payments:**
   - Payment history shows all payments for selected term
   - See payment dates, amounts, and methods

5. **Check Balance:**
   - Outstanding balance displayed prominently
   - Shows total fee, amount paid, and balance

6. **Logout:**
   - Click "Logout" button at bottom
   - Clears your session

## 🌐 Deployment Options

### Option 1: Local File
- Parents open the HTML file directly
- Works offline after initial data load
- Good for testing

### Option 2: Web Hosting
- Upload `parent-portal.html` to web hosting
- Parents access via URL
- Best for production use

### Option 3: School Website
- Embed in school website
- Add link from main site
- Professional appearance

## 📊 Data Flow

```
Parent Portal → Google Apps Script → Google Sheets
     ↓                    ↓                  ↓
  Login with         Search for         Students Sheet
  Phone Number       Student Data       (Parent Phone)
     ↓                    ↓                  ↓
  View Student       Get Fee Info       Fees Sheet
  Dashboard          & Payments         Payments Sheet
```

## 🔧 Customization

### Change Colors:
Edit the CSS in `parent-portal.html`:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Add School Logo:
Add this after the `<h1>` tag:
```html
<img src="school-logo.png" alt="School Logo" style="max-width: 150px; display: block; margin: 0 auto 20px;">
```

### Change Currency:
Replace `₦` with your currency symbol throughout the file.

## 📞 Support for Parents

### Common Issues:

**"No student found with this phone number"**
- Solution: Contact school office to verify phone number is registered
- Check: Phone number format (no spaces or dashes)

**"Backend connection failed"**
- Solution: Check internet connection
- Check: Google Apps Script URL is correct

**"Request timeout"**
- Solution: Refresh page and try again
- Check: Internet connection is stable

## 🎓 Admin Tasks

### Adding Parent Phone Numbers:

1. Open Google Sheets
2. Go to "Students" sheet
3. Find student row
4. Add phone number in "Parent Phone" column
5. Format: `08012345678`
6. Save

### Updating Parent Information:

1. Use admin portal (`index-working.html`)
2. Go to "Search Student"
3. Find student
4. Update parent phone number
5. Save changes

### Viewing Parent Access Logs:

Currently not implemented, but you can add logging to the Google Apps Script:
```javascript
function logParentAccess(phone, studentID) {
  var logSheet = ss().getSheetByName("ParentAccessLog");
  logSheet.appendRow([new Date(), phone, studentID]);
}
```

## 🚀 Advanced Features (Optional)

### Add SMS Notifications:
- Integrate with SMS API
- Send payment reminders
- Notify when fees are due

### Add Receipt Download:
- Generate PDF receipts
- Allow parents to download
- Email receipts automatically

### Add Payment Gateway:
- Integrate online payment
- Parents pay directly from portal
- Automatic payment recording

## ✅ Testing Checklist

Before giving access to parents:

- [ ] Google Apps Script URL updated
- [ ] Test with real parent phone number
- [ ] Verify student information displays correctly
- [ ] Check fee structure loads properly
- [ ] Confirm payment history shows
- [ ] Test on mobile device
- [ ] Test logout functionality
- [ ] Verify balance calculations are correct

## 📱 Mobile Access

The portal is mobile-friendly and works on:
- ✅ Smartphones (iOS/Android)
- ✅ Tablets
- ✅ Desktop computers
- ✅ All modern browsers

### Mobile Tips:
- Use Chrome or Safari for best experience
- Add to home screen for quick access
- Works with mobile data or Wi-Fi

## 🆘 Troubleshooting

### Portal not loading:
1. Check internet connection
2. Verify Google Apps Script is deployed
3. Check browser console for errors

### Wrong student information:
1. Verify phone number in database
2. Check for duplicate phone numbers
3. Update student information in admin portal

### Fees not showing:
1. Ensure fee structure is created for student's class
2. Check term is active
3. Verify fee data in Google Sheets

## 📞 Contact Information

For technical support:
- Check admin portal documentation
- Review Google Apps Script logs
- Contact school IT administrator

---

## 🎉 You're Ready!

The Parent Portal is now set up and ready for use. Share the URL with parents and provide them with the login instructions above.

**Parent Portal URL:** `[Your hosting URL]/parent-portal.html`

**Test Credentials:**
- Phone: Any parent phone number in your Students sheet
- Example: `08012345678`