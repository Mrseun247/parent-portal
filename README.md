# School Accounting System

A comprehensive web-based school accounting system built with HTML, CSS, JavaScript, and Google Apps Script backend.

## 🏫 Features

### Student Management
- Student registration with unique ID generation (VMCS0001, VMCS0002, etc.)
- Student search and profile management
- Class-based organization

### Fee Management
- Individual fee management (add, edit, delete)
- Fee structure management by term and class
- Multiple fee categories (tuition, development, library, sports, etc.)

### Payment Processing
- Payment recording with multiple methods
- Receipt generation
- Payment history tracking

### Reporting System
- Student fee statements
- Payment reports by term/class
- Outstanding payment tracking
- Export functionality

### Role-Based Access Control
- **Super Admin**: Full system access, admin management, system settings
- **Finance Admin**: Student registration, fee management, payment recording, reports
- **Registrar**: Student registration, search, reports, fee receipts
- **Accountant**: Payment recording, search, reports, fee receipts

## 🚀 Getting Started

### Prerequisites
- Web browser (Chrome, Firefox, Safari, Edge)
- Google Account (for backend functionality)
- Google Apps Script project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/school-accounting-system.git
   cd school-accounting-system
   ```

2. **Set up Google Apps Script Backend**
   - Go to [Google Apps Script](https://script.google.com)
   - Create a new project
   - Copy the code from `new.gs` into the script editor
   - Update the `SPREADSHEET_ID` with your Google Sheet ID
   - Deploy as a web app

3. **Configure the Frontend**
   - Update the `scriptURL` in both `index-working.html` and `super-admin.html`
   - Replace with your deployed Google Apps Script URL

4. **Create Google Spreadsheet**
   - Create a new Google Spreadsheet
   - The system will automatically create required sheets on first use

## 📁 File Structure

```
school-accounting-system/
├── index-working.html          # Main admin portal
├── super-admin.html           # Super admin portal
├── new.gs                     # Google Apps Script backend
├── ecommerce.html            # E-commerce demo
├── README.md                 # This file
├── .gitignore               # Git ignore rules
└── docs/                    # Documentation files
    ├── backend-setup-guide.md
    ├── backend-troubleshooting.md
    ├── connection-debug-report.md
    └── debug-system-stats.md
```

## 🔐 Default Login Credentials

### Super Admin Portal (`super-admin.html`)
- **Email**: admin@school.com
- **Password**: admin123
- **Role**: Super Admin

### Regular Admin Portal (`index-working.html`)
- **Email**: admin@school.com
- **Password**: admin123
- **Role**: Super Admin (or any other role)

## 🛠️ Usage

### For Super Admins
1. Access `super-admin.html`
2. Login with super admin credentials
3. Manage administrators, terms, fees, and system settings
4. View system statistics and audit logs

### For Regular Admins
1. Access `index-working.html`
2. Login with appropriate role credentials
3. Access features based on role permissions
4. Register students, manage fees, record payments, generate reports

## 🔧 Configuration

### Backend Configuration
1. Update `SPREADSHEET_ID` in `new.gs`
2. Deploy Google Apps Script as web app
3. Update `scriptURL` in HTML files

### Frontend Configuration
- Modify role permissions in `rolePermissions` object
- Customize fee categories and classes as needed
- Update school information in system settings

## 📊 Database Structure

The system uses Google Sheets with the following structure:

- **Students**: Student information and profiles
- **Admins**: Administrator accounts and roles
- **Terms**: Academic terms and periods
- **Fees**: Legacy fee structures
- **IndividualFees**: Individual fee items
- **Payments**: Payment records and transactions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and troubleshooting:
1. Check the documentation files in the `docs/` folder
2. Review the debug guides for common issues
3. Open an issue on GitHub

## 🏗️ Built With

- **Frontend**: HTML5, CSS3, JavaScript (ES5 compatible)
- **Backend**: Google Apps Script
- **Database**: Google Sheets
- **Authentication**: Custom role-based system

## 📈 Version History

- **v1.0.0** - Initial release with basic functionality
- **v1.1.0** - Added role-based access control
- **v1.2.0** - Enhanced fee management system
- **v1.3.0** - Added super admin portal
- **v1.4.0** - Implemented real-time system statistics

---

**Developed by BerachahGlobalConcept** 🚀