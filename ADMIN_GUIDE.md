# Nonvoyxona OS - Admin Guide

## Getting Started

### Initial Setup

1. **Access the System**
   - Open the Manus-hosted URL in your web browser
   - You will be directed to the login page

2. **First-Time Login**
   - Enter your phone number
   - Enter your PIN code (4-6 digits)
   - Select "Owner" as your role
   - Enter your owner secret code
   - Click "Sign In"

3. **Dashboard Overview**
   - You will see the main dashboard with key metrics
   - Sales, expenses, profit, and debt information
   - Quick access to all modules

## User Management

### Adding New Users

1. Go to **Dashboard** → **Settings** (if available)
2. Click **Add User**
3. Enter the following information:
   - **Name**: User's full name
   - **Surname**: User's last name
   - **Phone Number**: Contact number
   - **PIN Code**: 4-6 digit code for login
   - **Role**: Select from Owner, Manager, Cashier, or Driver
4. Click **Save**

### User Roles

#### Owner
- Full system access
- User management
- Owner secret code required
- Access to all modules and settings
- Can view all reports and analytics

#### Manager
- Access to all modules except user management
- Can create and edit all business transactions
- Can view reports and analytics
- Cannot manage users or system settings

#### Cashier
- Access to Sales and Customers modules
- Can record sales transactions
- Can track customer debt
- Can view delivery status
- Limited to transaction entry only

#### Driver
- Access to Delivery module
- Can view assigned deliveries
- Can update delivery status
- Can view settlement history
- Cannot access other modules

### Editing Users

1. Go to **Dashboard** → **User Management**
2. Find the user in the list
3. Click **Edit**
4. Update information as needed
5. Click **Save**

### Deactivating Users

1. Go to **Dashboard** → **User Management**
2. Find the user in the list
3. Click **Deactivate**
4. Confirm the action

## Sales Module

### Recording a Sale

1. Go to **Sales** from the sidebar
2. Click **New Sale**
3. Fill in the following:
   - **Product**: Select from the product list
   - **Quantity**: Number of units sold
   - **Price per Unit**: Price in UZS
   - **Payment Method**: Cash, Card, or Debt
   - **Customer**: Select if paying via debt
4. Click **Save**

### Payment Methods

- **Cash**: Immediate payment received
- **Card**: Card payment received
- **Debt**: Customer owes money (recorded in Customers module)

### Viewing Sales History

1. Go to **Sales**
2. Use filters to find specific sales:
   - Date range
   - Product
   - Payment method
   - Customer
3. Click on a sale to view details
4. Click **Edit** to modify or **Delete** to remove

## Production Module

### Recording Production

1. Go to **Production** from the sidebar
2. Click **New Production**
3. Enter:
   - **Product**: Select the product being produced
   - **Quantity**: Number of units produced
   - **Cost per Unit**: Production cost in UZS
4. Click **Save**

**Important**: The system automatically deducts ingredients from inventory based on production quantities.

### Viewing Production Records

1. Go to **Production**
2. View all production records with dates and quantities
3. Use filters to find specific records
4. Edit or delete as needed

## Ingredients Module

### Managing Inventory

1. Go to **Ingredients** from the sidebar
2. View all ingredients with current stock levels
3. **Red indicators** show items below minimum stock

### Recording Ingredient Purchases

1. Go to **Ingredients**
2. Click **Record Purchase**
3. Enter:
   - **Ingredient**: Select from list
   - **Quantity**: Amount purchased
   - **Cost per Unit**: Price per unit
   - **Supplier**: Supplier name (optional)
4. Click **Save**

### Stock Alerts

- Items with stock below minimum are highlighted in red
- Low stock items appear on the Dashboard
- Plan purchases based on alerts

## Delivery Module

### Creating Deliveries

1. Go to **Delivery** from the sidebar
2. Click **New Delivery**
3. Enter:
   - **Driver**: Select assigned driver
   - **Customer**: Select delivery customer
   - **Items**: Add products and quantities
4. Click **Save**

### Tracking Deliveries

1. Go to **Delivery**
2. View all deliveries with status:
   - **Pending**: Waiting to be picked up
   - **In Transit**: Currently being delivered
   - **Completed**: Successfully delivered
   - **Returned**: Goods returned unsold

### Updating Delivery Status

1. Click on a delivery
2. Click **Update Status**
3. Select new status
4. If returning goods, enter returned quantity
5. Click **Save**

### Recording Driver Settlement

1. Go to **Delivery**
2. Click **Record Settlement**
3. Enter:
   - **Driver**: Select driver
   - **Completed Deliveries**: Number completed
   - **Return Deductions**: Amount for returned goods
   - **Advances**: Any advances given
4. Click **Save**

The system automatically calculates net payout.

## Expenses Module

### Recording Expenses

1. Go to **Expenses** from the sidebar
2. Click **New Expense**
3. Enter:
   - **Category**: Select expense type (utilities, rent, maintenance, etc.)
   - **Amount**: Expense amount in UZS
   - **Description**: Details about the expense (optional)
4. Click **Save**

### Viewing Expense History

1. Go to **Expenses**
2. View all recorded expenses
3. Filter by:
   - Date range
   - Category
4. Edit or delete as needed

## Salaries Module

### Recording Salary Payments

1. Go to **Salaries** from the sidebar
2. Click **Record Payment**
3. Enter:
   - **Employee**: Select employee
   - **Month**: Select payment month
   - **Amount**: Salary amount in UZS
   - **Advances**: Any advances given (optional)
   - **Deductions**: Any deductions (optional)
4. Click **Save**

### Marking Salaries as Paid

1. Go to **Salaries**
2. Find the salary record
3. Click **Mark as Paid**
4. Confirm payment date
5. Click **Save**

### Viewing Payment History

1. Go to **Salaries**
2. View all salary records by employee
3. Filter by:
   - Employee
   - Month
   - Status (Pending/Paid)

## Customers Module

### Adding Customers

1. Go to **Customers** from the sidebar
2. Click **New Customer**
3. Enter:
   - **Name**: Customer name
   - **Phone**: Contact number (optional)
   - **Address**: Delivery address (optional)
4. Click **Save**

### Tracking Customer Debt

1. Go to **Customers**
2. View all customers with debt balances
3. **Red indicators** show customers with outstanding debt
4. Click on a customer to view:
   - Total debt
   - Payment history
   - Recent transactions

### Recording Debt Payments

1. Click on a customer
2. Click **Record Payment**
3. Enter:
   - **Amount**: Payment amount in UZS
   - **Notes**: Payment details (optional)
4. Click **Save**

The system automatically updates the customer's remaining debt.

## Dashboard & Reports

### Dashboard Overview

The dashboard shows:
- **Today's Sales**: Total sales for the current day
- **This Week's Expenses**: Total expenses for the week
- **Net Profit**: Revenue minus expenses
- **Outstanding Debt**: Total customer debt
- **Low Stock Items**: Ingredients below minimum
- **Recent Transactions**: Latest business activities

### Generating Reports

1. Go to **Reports** from the sidebar
2. Select report type:
   - **Sales Report**: Revenue by date
   - **Expense Report**: Expenses by category
   - **Production Report**: Production by product
   - **Profit Report**: Revenue, expenses, and profit
   - **Debt Report**: Customer debt aging
3. Select date range:
   - Today
   - This Week
   - This Month
   - This Year
   - Custom range
4. View charts and summary data

### Exporting Reports

1. Generate the desired report
2. Click **Export as PDF** or **Export as Excel**
3. File will download to your computer

## Best Practices

### Daily Operations

1. **Morning**: Check low stock items and plan purchases
2. **During Day**: Record sales as they occur
3. **Production**: Record production and verify ingredient deduction
4. **Deliveries**: Update delivery status throughout the day
5. **Evening**: Record expenses and review daily summary

### Weekly Tasks

1. Review sales trends
2. Check inventory levels
3. Record driver settlements
4. Review customer debt aging
5. Plan salary payments

### Monthly Tasks

1. Generate comprehensive reports
2. Analyze profit margins
3. Review expense categories
4. Reconcile all transactions
5. Plan next month's budget

## Security

### PIN Code Management

- Keep PIN codes confidential
- Change PIN codes regularly
- Never share PIN codes
- Owner secret code must be protected

### Session Management

- Log out when leaving the computer
- Sessions expire after inactivity
- Clear browser cache regularly
- Use secure internet connection

### Data Backup

- System automatically backs up data
- Backups occur daily
- Contact support for data recovery

## Troubleshooting

### Login Issues

- Verify phone number is correct
- Check PIN code (4-6 digits)
- Ensure role is selected
- If owner, verify secret code

### Missing Data

- Check date filters
- Verify user has access to module
- Refresh browser page
- Clear browser cache

### Calculation Errors

- Verify ingredient quantities
- Check production records
- Review delivery settlements
- Contact support if issue persists

## Support

For technical issues or questions:
1. Check this guide
2. Review system error messages
3. Contact system administrator
4. Submit support ticket

---

**Version**: 1.0.0  
**Last Updated**: May 8, 2026  
**Status**: Complete
