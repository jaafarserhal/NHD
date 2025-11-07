-- =============================================
-- NHD DATABASE CREATION AND SETUP SCRIPT
-- Compatible with DBeaver and standard SQL tools
-- =============================================

-- Create the database if it doesn't exist
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'nhd_db')
BEGIN
    CREATE DATABASE nhd_db;
    PRINT 'Database nhd_db created successfully.';
END
ELSE
BEGIN
    PRINT 'Database nhd_db already exists.';
END;

-- Switch to the nhd_db database
USE nhd_db;

-- =============================================
-- DROP TABLES IF EXIST (safe re-run)
-- =============================================
IF OBJECT_ID('dbo.payment_transaction', 'U') IS NOT NULL DROP TABLE dbo.payment_transaction;
IF OBJECT_ID('dbo.payment_gateway', 'U') IS NOT NULL DROP TABLE dbo.payment_gateway;
IF OBJECT_ID('dbo.order_item', 'U') IS NOT NULL DROP TABLE dbo.order_item;
IF OBJECT_ID('dbo.[order]', 'U') IS NOT NULL DROP TABLE dbo.[order];
IF OBJECT_ID('dbo.address', 'U') IS NOT NULL DROP TABLE dbo.address;
IF OBJECT_ID('dbo.product', 'U') IS NOT NULL DROP TABLE dbo.product;
IF OBJECT_ID('dbo.customer', 'U') IS NOT NULL DROP TABLE dbo.customer;
IF OBJECT_ID('dbo.gen_lookup', 'U') IS NOT NULL DROP TABLE dbo.gen_lookup;
IF OBJECT_ID('dbo.gen_lookup_type', 'U') IS NOT NULL DROP TABLE dbo.gen_lookup_type;
IF OBJECT_ID('dbo.[user]', 'U') IS NOT NULL DROP TABLE dbo.[user];

-- =============================================
-- USER TABLE
-- =============================================
CREATE TABLE dbo.[user] (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    full_name NVARCHAR(150) NOT NULL,
    email_address NVARCHAR(150) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    is_active BIT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL 
        CONSTRAINT DF_user_created DEFAULT SYSUTCDATETIME()
);

CREATE TABLE dbo.sections (
    section_id INT IDENTITY(1,1) PRIMARY KEY,
    title_en NVARCHAR(255) NOT NULL,
    title_sv NVARCHAR(255) NOT NULL,
    description_en NVARCHAR(MAX) NULL,
    description_sv NVARCHAR(MAX) NULL,
    image_url NVARCHAR(500) NULL,
    is_active BIT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL 
        CONSTRAINT DF_section_created DEFAULT SYSUTCDATETIME()
);

-- =============================================
-- LOOKUP TYPE
-- =============================================
CREATE TABLE dbo.gen_lookup_type (
    lookup_type_id INT PRIMARY KEY,
    name_en NVARCHAR(100) NOT NULL,
    name_sv NVARCHAR(100) NULL,
    created_at DATETIME2 NOT NULL 
        CONSTRAINT DF_lookup_type_created DEFAULT SYSUTCDATETIME(),
    is_active BIT NULL DEFAULT 1
);

-- =============================================
-- LOOKUP
-- =============================================
CREATE TABLE dbo.gen_lookup (
    lookup_id INT PRIMARY KEY,
    lookup_type_id INT NOT NULL,
    name_en NVARCHAR(100) NOT NULL,
    name_sv NVARCHAR(100) NULL,
    created_at DATETIME2 NOT NULL 
        CONSTRAINT DF_lookup_created DEFAULT SYSUTCDATETIME(),
    is_active BIT NULL DEFAULT 1,
    CONSTRAINT FK_gen_lookup_type FOREIGN KEY (lookup_type_id)
        REFERENCES dbo.gen_lookup_type(lookup_type_id)
);

-- =============================================
-- PRODUCT
-- =============================================
CREATE TABLE dbo.product (
    prd_id INT IDENTITY(1,1) PRIMARY KEY,
    prd_lookup_category_id INT NOT NULL,
    prd_lookup_type_id INT NOT NULL,
    prd_lookup_size_id INT NOT NULL,
    name_en NVARCHAR(200) NOT NULL,
    name_sv NVARCHAR(200) NULL,
    description_en NVARCHAR(MAX) NULL,
    description_sv NVARCHAR(MAX) NULL,
    image_url NVARCHAR(500) NULL,
	is_carousel BIT NULL,
    from_price DECIMAL(18,2) NULL,
    created_at DATETIME2 NOT NULL 
        CONSTRAINT DF_date_product_created DEFAULT SYSUTCDATETIME(),
    is_active BIT NULL DEFAULT 1,
    CONSTRAINT FK_product_category FOREIGN KEY (prd_lookup_category_id)
        REFERENCES dbo.gen_lookup(lookup_id),
    CONSTRAINT FK_product_type FOREIGN KEY (prd_lookup_type_id)
        REFERENCES dbo.gen_lookup(lookup_id),
    CONSTRAINT FK_product_size FOREIGN KEY (prd_lookup_size_id)
        REFERENCES dbo.gen_lookup(lookup_id)
);

-- =============================================
-- Product Gallery
-- =============================================

CREATE TABLE dbo.product_gallery (
    gallery_id INT IDENTITY(1,1) PRIMARY KEY,
    prd_id INT NULL,
    date_id INT NULL,
    image_url NVARCHAR(500) NOT NULL,
    alt_text NVARCHAR(255) NULL,            -- SEO: alternative text for accessibility/search
    mime_type NVARCHAR(100) NULL,           -- e.g., image/jpeg, image/png
    file_size_kb INT NULL,                  -- Approx file size in KB
    is_primary BIT NOT NULL DEFAULT 0,      -- Marks main image
    sort_order INT NULL,                    -- Controls display order

    created_at DATETIME2 NOT NULL 
        CONSTRAINT DF_product_gallery_created DEFAULT SYSUTCDATETIME(),

    -- 🔗 Foreign key: links to dbo.product
    CONSTRAINT FK_product_gallery_product 
        FOREIGN KEY (prd_id)
        REFERENCES dbo.product(prd_id)
        ON DELETE CASCADE,

    -- 🔗 Foreign key: links to dbo.dates
    CONSTRAINT FK_product_gallery_dates 
        FOREIGN KEY (date_id)
        REFERENCES dbo.[dates](date_id)
        ON DELETE CASCADE
);

CREATE TABLE dbo.dates_collection (
    collection_id INT IDENTITY(1,1) PRIMARY KEY,
    name_en NVARCHAR(255) NOT NULL,
    name_sv NVARCHAR(255),
    description_en NVARCHAR(MAX),
    description_sv NVARCHAR(MAX),
    image_url NVARCHAR(500),
    created_at DATETIME2 NOT NULL
	CONSTRAINT CD__DATES_created DEFAULT SYSUTCDATETIME(),
    is_active BIT NOT NULL DEFAULT 1
);

-- =============================================
-- Products Collections
-- =============================================
CREATE TABLE dbo.product_collection (
    product_id INT NOT NULL,
    collection_id INT NOT NULL,
    created_at DATETIME2 NOT NULL 
        CONSTRAINT DF_product_collection_added DEFAULT SYSUTCDATETIME(),
    PRIMARY KEY (product_id, collection_id),
    CONSTRAINT FK_product_collection_product FOREIGN KEY (product_id)
        REFERENCES dbo.product (prd_id)
        ON DELETE CASCADE,
    CONSTRAINT FK_product_collection_collection FOREIGN KEY (collection_id)
        REFERENCES dbo.dates_collection (collection_id)
        ON DELETE CASCADE
);




-- =============================================
-- Dates
-- =============================================
CREATE TABLE dbo.[dates] (
    date_id INT IDENTITY(1,1) PRIMARY KEY,
    name_en NVARCHAR(100) NOT NULL,
    name_sv NVARCHAR(100),
    quality BIT NOT NULL DEFAULT 0,
    unit_price DECIMAL(10, 2) NOT NULL,
	weight_price DECIMAL(10, 2) NOT NULL,
    description_en NVARCHAR(MAX) NULL,
    description_sv NVARCHAR(MAX) NULL,
    created_at DATETIME2 NOT NULL 
        CONSTRAINT DF_product_created DEFAULT SYSUTCDATETIME(),
    is_active BIT NOT NULL DEFAULT 1
);


-- =============================================
-- Dates Products
-- =============================================
CREATE TABLE dbo.dates_product (
    dp_id INT IDENTITY(1,1) PRIMARY KEY,
    prd_id INT NOT NULL,
    date_id INT NOT NULL,
    is_filled BIT NOT NULL DEFAULT 0,
	quantity INT NOT NULL,
	is_per_weight BIT NOT NULL,
    created_at DATETIME2 NOT NULL 
        CONSTRAINT DF_dates_product_created DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_dates_product_product FOREIGN KEY (prd_id)
        REFERENCES dbo.product(prd_id) ON DELETE CASCADE,
    CONSTRAINT FK_dates_product_dates FOREIGN KEY (date_id)
        REFERENCES dbo.dates(date_id) ON DELETE CASCADE,
    CONSTRAINT UQ_dates_product UNIQUE (prd_id, date_id, is_filled, is_per_weight)
);

-- =============================================
-- CUSTOMER (with is_guest)
-- =============================================
CREATE TABLE dbo.customer (
    customer_id INT IDENTITY(1,1) PRIMARY KEY,
    first_name NVARCHAR(100) NOT NULL,
    last_name NVARCHAR(100) NOT NULL,
    email_address NVARCHAR(150) NOT NULL UNIQUE,
    password NVARCHAR(255) NULL, -- Guests may have NULL password
    mobile NVARCHAR(50) NULL,
    created_at DATETIME2 NOT NULL 
        CONSTRAINT DF_customer_created DEFAULT SYSUTCDATETIME(),
    is_active BIT NULL DEFAULT 1,
    is_guest BIT NOT NULL DEFAULT 0
);

-- =============================================
-- ADDRESS
-- =============================================
CREATE TABLE dbo.address (
    address_id INT IDENTITY(1,1) PRIMARY KEY,
    customer_id INT NOT NULL,
    street NVARCHAR(200) NOT NULL,
    city NVARCHAR(100) NOT NULL,
    land NVARCHAR(100) NULL,
    postal_code NVARCHAR(20) NULL,
    note NVARCHAR(MAX) NULL,
    created_at DATETIME2 NOT NULL 
        CONSTRAINT DF_address_created DEFAULT SYSUTCDATETIME(),
    is_active BIT NULL DEFAULT 1,
    CONSTRAINT FK_address_customer FOREIGN KEY (customer_id)
        REFERENCES dbo.customer(customer_id)
);

-- =============================================
-- PAYMENT GATEWAY
-- =============================================
CREATE TABLE dbo.payment_gateway (
    payment_gateway_id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    provider_code NVARCHAR(50) NULL,
    description NVARCHAR(MAX) NULL,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL 
        CONSTRAINT DF_payment_gateway_created DEFAULT SYSUTCDATETIME()
);

-- =============================================
-- ORDER
-- =============================================
CREATE TABLE dbo.[order] (
    order_id INT IDENTITY(1,1) PRIMARY KEY,
    customer_id INT NOT NULL,
    order_date DATETIME2 NOT NULL 
        CONSTRAINT DF_order_date DEFAULT SYSUTCDATETIME(),
    order_status_lookup_id INT NOT NULL,   -- FK to gen_lookup
    payment_gateway_id INT NULL,           -- FK to payment_gateway
    total_amount DECIMAL(18,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    created_at DATETIME2 NOT NULL 
        CONSTRAINT DF_order_created DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_order_customer FOREIGN KEY (customer_id)
        REFERENCES dbo.customer(customer_id),
    CONSTRAINT FK_order_status FOREIGN KEY (order_status_lookup_id)
        REFERENCES dbo.gen_lookup(lookup_id),
    CONSTRAINT FK_order_payment_gateway FOREIGN KEY (payment_gateway_id)
        REFERENCES dbo.payment_gateway(payment_gateway_id)
);

-- =============================================
-- ORDER ITEM
-- =============================================
CREATE TABLE dbo.order_item (
    order_item_id INT IDENTITY(1,1) PRIMARY KEY,
    order_id INT NOT NULL,
    prd_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(18,2) NOT NULL CHECK (unit_price >= 0),
    created_at DATETIME2 NOT NULL 
        CONSTRAINT DF_orderitem_created DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_orderitem_order FOREIGN KEY (order_id)
        REFERENCES dbo.[order](order_id),
    CONSTRAINT FK_orderitem_product FOREIGN KEY (prd_id)
        REFERENCES dbo.product(prd_id)
);

-- =============================================
-- PAYMENT TRANSACTION
-- =============================================
CREATE TABLE dbo.payment_transaction (
    payment_transaction_id INT IDENTITY(1,1) PRIMARY KEY,
    order_id INT NOT NULL,
    payment_gateway_id INT NOT NULL,
    transaction_reference NVARCHAR(200) NOT NULL,
    amount DECIMAL(18,2) NOT NULL CHECK (amount >= 0),
    status NVARCHAR(50) NOT NULL,
    created_at DATETIME2 NOT NULL 
        CONSTRAINT DF_payment_transaction_created DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_payment_transaction_order FOREIGN KEY (order_id)
        REFERENCES dbo.[order](order_id),
    CONSTRAINT FK_payment_transaction_gateway FOREIGN KEY (payment_gateway_id)
        REFERENCES dbo.payment_gateway(payment_gateway_id)
);

-- =============================================
-- CREATE INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX IX_product_category ON dbo.product(prd_lookup_category_id);
CREATE INDEX IX_product_type ON dbo.product(prd_lookup_type_id);
CREATE INDEX IX_product_size ON dbo.product(prd_lookup_size_id);
CREATE INDEX IX_product_active ON dbo.product(is_active);
CREATE INDEX IX_order_customer ON dbo.[order](customer_id);
CREATE INDEX IX_order_status ON dbo.[order](order_status_lookup_id);
CREATE INDEX IX_order_date ON dbo.[order](order_date);
CREATE INDEX IX_orderitem_order ON dbo.order_item(order_id);
CREATE INDEX IX_orderitem_product ON dbo.order_item(prd_id);
CREATE INDEX IX_payment_transaction_order ON dbo.payment_transaction(order_id);
CREATE INDEX IX_customer_email ON dbo.customer(email_address);
CREATE INDEX IX_user_email ON dbo.[user](email_address);
CREATE INDEX IX_dates_product_prd_filled ON dbo.dates_product (prd_id, filled);