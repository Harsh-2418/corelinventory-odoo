📦 CoreInventory – Smart Inventory Management System

A modular Inventory Management System (IMS) designed to digitize and streamline stock management operations inside a business.

The system replaces manual registers, Excel sheets, and scattered tracking methods with a centralized real-time inventory platform that helps businesses track products, warehouses, and stock movements efficiently.

🚀 Problem Statement

Businesses often manage stock using manual methods such as spreadsheets or physical registers, which leads to:

Inaccurate stock data

Poor traceability

Delayed operations

Lack of real-time visibility

CoreInventory solves this problem by providing a centralized platform to manage all inventory operations in one place.

👥 Target Users
Inventory Managers

Monitor stock levels

Manage incoming and outgoing goods

Track warehouse performance

Warehouse Staff

Handle stock transfers

Pick, pack, and ship products

Perform stock adjustments

🔐 Authentication

User Signup / Login

OTP-based password reset

Secure authentication

Redirects users to the Inventory Dashboard

📊 Dashboard

The dashboard provides a real-time overview of inventory operations.

Key Metrics (KPIs)

Total products in stock

Low stock / Out-of-stock items

Pending receipts

Pending deliveries

Scheduled internal transfers

Dynamic Filters

Users can filter data by:

Document Type

Receipts

Delivery Orders

Internal Transfers

Adjustments

Status

Draft

Waiting

Ready

Done

Cancelled

Warehouse or location

Product category

🧭 System Navigation
Sidebar Modules

1️⃣ Dashboard
2️⃣ Products
3️⃣ Operations
4️⃣ Move History
5️⃣ Settings (Warehouse)
6️⃣ Profile Menu

Profile Menu

My Profile

Logout

📦 Core Features
1️⃣ Product Management

Create and manage products with detailed information:

Product Name

SKU / Product Code

Category

Unit of Measure

Initial Stock (optional)

Additional capabilities:

Track stock availability per location

Create product categories

Set reordering rules

📥 Receipts (Incoming Stock)

Receipts are used when goods arrive from suppliers or vendors.

Process

Create a new receipt

Add supplier details

Add products and quantities

Validate receipt

Result

Stock automatically increases in the system.

Example:

Receive 50 units of Steel Rods

Stock: +50
📤 Delivery Orders (Outgoing Stock)

Delivery orders manage customer shipments.

Process

Pick items

Pack items

Validate delivery

Result

Stock automatically decreases.

Example:

Deliver 10 chairs

Stock: -10
🔁 Internal Transfers

Used to move stock inside the organization.

Examples:

Main Warehouse → Production Floor

Rack A → Rack B

Warehouse 1 → Warehouse 2

Every transfer is recorded in the stock movement ledger.

⚖️ Stock Adjustments

Used to fix differences between:

System-recorded stock

Physical stock count

Steps

Select product

Select location

Enter actual counted quantity

The system automatically:

Updates stock

Logs the adjustment in the ledger

🧠 Additional Features

Low stock alerts

Multi-warehouse support

SKU search

Smart filters

Complete stock movement logging

🔄 Inventory Flow Example
Step 1 — Receive Goods

Vendor delivers 100 kg steel

Stock: +100
Step 2 — Internal Transfer

Move steel from:

Main Store → Production Rack

Total stock remains the same, but location changes.

Step 3 — Deliver Product

Deliver 20 kg steel

Stock: -20
Step 4 — Damage Adjustment

3 kg steel damaged

Stock: -3

All operations are recorded in the inventory ledger for traceability.

🏗️ System Architecture (Conceptual)
Users
   ↓
Authentication System
   ↓
Inventory Dashboard
   ↓
Modules
 ├── Products
 ├── Receipts
 ├── Deliveries
 ├── Internal Transfers
 ├── Stock Adjustments
 └── Move History
🎯 Key Benefits

✔ Centralized inventory tracking
✔ Real-time stock visibility
✔ Accurate stock movement logs
✔ Multi-location warehouse management
✔ Reduced manual errors

🛠️ Future Improvements

Barcode scanning support

AI demand prediction

Automated reordering

Supplier integration

Mobile warehouse app

🧑‍💻 Hackathon Project

This project was built as part of a hackathon challenge to design a modular Inventory Management System that simplifies warehouse operations and stock management.
