# Nonvoyxona OS - API Documentation

## Overview

This document describes all tRPC procedures available in the Nonvoyxona OS bakery management system. All procedures are type-safe and return typed responses.

## Authentication Procedures

### `auth.login`
**Type**: Public Procedure  
**Description**: Authenticate user with PIN code and role

**Input**:
```typescript
{
  phoneNumber: string;      // User phone number
  pinCode: string;          // 4-6 digit PIN
  role: "owner" | "manager" | "cashier" | "driver";
  ownerSecretCode?: string; // Required if role is "owner"
}
```

**Output**:
```typescript
{
  success: boolean;
  user?: {
    id: number;
    name: string;
    role: string;
    email?: string;
  };
  error?: string;
}
```

### `auth.me`
**Type**: Public Procedure  
**Description**: Get current authenticated user

**Output**: User object or null if not authenticated

### `auth.logout`
**Type**: Public Procedure  
**Description**: Logout current user and clear session

**Output**:
```typescript
{ success: true }
```

## Dashboard Procedures

### `dashboard.getMetrics`
**Type**: Protected Procedure  
**Description**: Get dashboard overview metrics

**Input**:
```typescript
{
  startDate?: Date;
  endDate?: Date;
}
```

**Output**:
```typescript
{
  totalSales: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  totalDebt: number;
  lowStockItems: Array<{ id: number; name: string; current: number; minimum: number }>;
  recentTransactions: Array<{ id: number; type: string; amount: number; date: Date }>;
}
```

### `dashboard.getSalesChart`
**Type**: Protected Procedure  
**Description**: Get sales data for chart visualization

**Input**:
```typescript
{
  startDate?: Date;
  endDate?: Date;
  groupBy?: "day" | "week" | "month";
}
```

**Output**:
```typescript
Array<{
  date: string;
  sales: number;
  count: number;
}>
```

## Sales Procedures

### `sales.create`
**Type**: Protected Procedure  
**Description**: Create a new sales transaction

**Input**:
```typescript
{
  productId: number;
  quantity: number;
  pricePerUnit: string;
  paymentMethod: "cash" | "card" | "debt";
  customerId?: number;
  notes?: string;
}
```

**Output**:
```typescript
{
  id: number;
  saleDate: Date;
  totalAmount: string;
  paymentMethod: string;
}
```

### `sales.list`
**Type**: Protected Procedure  
**Description**: Get list of sales transactions

**Input**:
```typescript
{
  startDate?: Date;
  endDate?: Date;
  paymentMethod?: "cash" | "card" | "debt";
  customerId?: number;
  limit?: number;
  offset?: number;
}
```

**Output**: Array of sales records

### `sales.update`
**Type**: Protected Procedure  
**Description**: Update a sales transaction

**Input**:
```typescript
{
  id: number;
  quantity?: number;
  pricePerUnit?: string;
  paymentMethod?: string;
  notes?: string;
}
```

### `sales.delete`
**Type**: Protected Procedure  
**Description**: Delete a sales transaction

**Input**: `{ id: number }`

## Production Procedures

### `production.create`
**Type**: Protected Procedure  
**Description**: Record production with automatic ingredient deduction

**Input**:
```typescript
{
  productId: number;
  quantity: number;
  costPerUnit: string;
  notes?: string;
}
```

**Output**:
```typescript
{
  id: number;
  productionDate: Date;
  quantity: number;
  ingredientsDeducted: Array<{ ingredientId: number; quantity: number }>;
}
```

### `production.list`
**Type**: Protected Procedure  
**Description**: Get production records

**Input**:
```typescript
{
  startDate?: Date;
  endDate?: Date;
  productId?: number;
  limit?: number;
  offset?: number;
}
```

### `production.update`
**Type**: Protected Procedure  
**Description**: Update production record

**Input**:
```typescript
{
  id: number;
  quantity?: number;
  costPerUnit?: string;
  notes?: string;
}
```

### `production.delete`
**Type**: Protected Procedure  
**Description**: Delete production record

**Input**: `{ id: number }`

## Ingredients Procedures

### `ingredients.create`
**Type**: Protected Procedure  
**Description**: Create new ingredient

**Input**:
```typescript
{
  name: string;
  unit: string;
  costPerUnit: string;
  minimumStock: number;
}
```

**Output**:
```typescript
{
  id: number;
  name: string;
  currentStock: number;
}
```

### `ingredients.list`
**Type**: Protected Procedure  
**Description**: Get all ingredients

**Output**: Array of ingredient records with stock levels

### `ingredients.recordPurchase`
**Type**: Protected Procedure  
**Description**: Record ingredient purchase

**Input**:
```typescript
{
  ingredientId: number;
  quantity: number;
  costPerUnit: string;
  supplier?: string;
}
```

**Output**:
```typescript
{
  id: number;
  ingredientId: number;
  quantity: number;
  newStock: number;
}
```

### `ingredients.getLowStock`
**Type**: Protected Procedure  
**Description**: Get ingredients below minimum stock

**Output**: Array of low stock items

## Delivery Procedures

### `delivery.create`
**Type**: Protected Procedure  
**Description**: Create delivery order

**Input**:
```typescript
{
  driverId: number;
  customerId: number;
  items: Array<{ productId: number; quantity: number; price: string }>;
  notes?: string;
}
```

**Output**:
```typescript
{
  id: number;
  status: "pending";
  createdAt: Date;
}
```

### `delivery.list`
**Type**: Protected Procedure  
**Description**: Get delivery orders

**Input**:
```typescript
{
  status?: "pending" | "in_transit" | "completed" | "returned";
  driverId?: number;
  startDate?: Date;
  endDate?: Date;
}
```

### `delivery.updateStatus`
**Type**: Protected Procedure  
**Description**: Update delivery status

**Input**:
```typescript
{
  id: number;
  status: "in_transit" | "completed" | "returned";
  returnedQuantity?: number;
}
```

### `delivery.recordSettlement`
**Type**: Protected Procedure  
**Description**: Record driver settlement

**Input**:
```typescript
{
  driverId: number;
  completedDeliveries: number;
  returnDeductions: string;
  advances: string;
  notes?: string;
}
```

**Output**:
```typescript
{
  id: number;
  driverId: number;
  netPayout: string;
  status: "pending" | "paid";
}
```

## Expenses Procedures

### `expenses.create`
**Type**: Protected Procedure  
**Description**: Record expense

**Input**:
```typescript
{
  categoryId: number;
  amount: string;
  description?: string;
}
```

**Output**:
```typescript
{
  id: number;
  expenseDate: Date;
  amount: string;
}
```

### `expenses.list`
**Type**: Protected Procedure  
**Description**: Get expenses

**Input**:
```typescript
{
  categoryId?: number;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}
```

### `expenses.delete`
**Type**: Protected Procedure  
**Description**: Delete expense

**Input**: `{ id: number }`

## Salaries Procedures

### `salaries.recordPayment`
**Type**: Protected Procedure  
**Description**: Record salary payment

**Input**:
```typescript
{
  employeeId: number;
  month: Date;
  amount: string;
  advance?: string;
  deductions?: string;
}
```

**Output**:
```typescript
{
  id: number;
  employeeId: number;
  amount: string;
  status: "pending" | "paid";
}
```

### `salaries.list`
**Type**: Protected Procedure  
**Description**: Get salary records

**Input**:
```typescript
{
  employeeId?: number;
  month?: Date;
  status?: "pending" | "paid";
}
```

### `salaries.markAsPaid`
**Type**: Protected Procedure  
**Description**: Mark salary as paid

**Input**:
```typescript
{
  id: number;
  paidDate: Date;
}
```

## Customers Procedures

### `customers.create`
**Type**: Protected Procedure  
**Description**: Create customer

**Input**:
```typescript
{
  name: string;
  phoneNumber?: string;
  address?: string;
}
```

**Output**:
```typescript
{
  id: number;
  name: string;
  totalDebt: string;
}
```

### `customers.list`
**Type**: Protected Procedure  
**Description**: Get customers

**Input**:
```typescript
{
  hasDebt?: boolean;
  limit?: number;
  offset?: number;
}
```

### `customers.recordPayment`
**Type**: Protected Procedure  
**Description**: Record debt payment

**Input**:
```typescript
{
  customerId: number;
  amount: string;
  notes?: string;
}
```

**Output**:
```typescript
{
  id: number;
  customerId: number;
  amount: string;
  remainingDebt: string;
}
```

## Reports Procedures

### `reports.getSalesReport`
**Type**: Protected Procedure  
**Description**: Get sales report with aggregation

**Input**:
```typescript
{
  startDate?: Date;
  endDate?: Date;
  groupBy?: "day" | "week" | "month" | "year";
}
```

**Output**:
```typescript
Array<{
  date: string;
  sales: number;
  count: number;
}>
```

### `reports.getExpenseReport`
**Type**: Protected Procedure  
**Description**: Get expense report by category

**Input**:
```typescript
{
  startDate?: Date;
  endDate?: Date;
}
```

**Output**:
```typescript
Array<{
  category: string;
  amount: number;
  count: number;
}>
```

### `reports.getProductionReport`
**Type**: Protected Procedure  
**Description**: Get production report by product

**Input**:
```typescript
{
  startDate?: Date;
  endDate?: Date;
}
```

**Output**:
```typescript
Array<{
  product: string;
  quantity: number;
  avgCost: number;
}>
```

### `reports.getProfitReport`
**Type**: Protected Procedure  
**Description**: Get profit analysis

**Input**:
```typescript
{
  startDate?: Date;
  endDate?: Date;
}
```

**Output**:
```typescript
{
  totalSales: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
}
```

### `reports.getDebtReport`
**Type**: Protected Procedure  
**Description**: Get customer debt aging report

**Input**:
```typescript
{
  startDate?: Date;
  endDate?: Date;
}
```

**Output**:
```typescript
Array<{
  customerId: number;
  customerName: string;
  debt: number;
  daysOverdue: number;
}>
```

### `reports.getSummary`
**Type**: Protected Procedure  
**Description**: Get comprehensive summary

**Input**:
```typescript
{
  startDate?: Date;
  endDate?: Date;
}
```

**Output**:
```typescript
{
  totalSales: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  totalDebt: number;
  transactionCount: number;
}
```

## Error Handling

All procedures may return the following errors:

### 400 Bad Request
- Invalid input parameters
- Missing required fields
- Invalid data types

### 401 Unauthorized
- User not authenticated
- Session expired

### 403 Forbidden
- User lacks required role
- Insufficient permissions

### 500 Internal Server Error
- Database error
- Server error
- Unexpected exception

## Rate Limiting

- No explicit rate limiting implemented
- Recommended: Implement rate limiting in production
- Suggested: 100 requests per minute per user

## Pagination

For list procedures:
- `limit`: Maximum records to return (default: 50, max: 500)
- `offset`: Number of records to skip (default: 0)

## Date Handling

- All dates are UTC timestamps
- Frontend should convert to local timezone for display
- Date ranges are inclusive on both ends

## Type Safety

All procedures use TypeScript for type safety:
- Input validation with Zod schemas
- Output types automatically inferred
- IDE autocomplete support
- Compile-time type checking

---

**Version**: 1.0.0  
**Last Updated**: May 8, 2026  
**Status**: Complete
