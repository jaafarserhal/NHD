-- =============================================
-- INSERT INTO gen_lookup_type
-- =============================================
INSERT INTO dbo.gen_lookup_type (lookup_type_id, name_en, name_sv, created_at, is_active)
VALUES 
    (100, 'Product Category', 'Produktkategori', SYSUTCDATETIME(), 1),
    (200, 'Product Type', 'Produkttyp', SYSUTCDATETIME(), 1),
    (300, 'Product Size', 'Produktstorlek', SYSUTCDATETIME(), 1),
    (400, 'Order Status', 'Orderstatus', SYSUTCDATETIME(), 1);

-- =============================================
-- INSERT INTO gen_lookup
-- =============================================
INSERT INTO dbo.gen_lookup (lookup_id, lookup_type_id, name_en, name_sv, created_at, is_active)
VALUES 
    -- Product Categories (100 series)
    (100, 100, 'Signature Date Gift', 'Signatur Dadel Present', SYSUTCDATETIME(), 1),
    (101, 100, 'Classic Date Pack', 'Klassisk Dadel Förpackning', SYSUTCDATETIME(), 1),
    (102, 100, 'Date Snack', 'Dadel Snacks', SYSUTCDATETIME(), 1),
    (103, 100, 'Date Sweeteners', 'Dadel Sötningsmedel', SYSUTCDATETIME(), 1),
    
    -- Product Types (200 series)
    (200, 200, 'Date Filling', 'Date Filling', SYSUTCDATETIME(), 1),
    
    -- Product Sizes (300 series)
    (300, 300, '8 Pieces', '8 Stycken', SYSUTCDATETIME(), 1),
    (301, 300, '20 Pieces', '20 Stycken', SYSUTCDATETIME(), 1),
    (302, 300, '35 Pieces', '35 Stycken', SYSUTCDATETIME(), 1),
    
    -- Order Status (400 series)
    (400, 400, 'Pending', 'Väntande', SYSUTCDATETIME(), 1),
    (401, 400, 'Confirmed', 'Bekräftad', SYSUTCDATETIME(), 1),
    (402, 400, 'Processing', 'Bearbetas', SYSUTCDATETIME(), 1),
    (403, 400, 'Shipped', 'Skickad', SYSUTCDATETIME(), 1),
    (404, 400, 'Delivered', 'Levererad', SYSUTCDATETIME(), 1),
    (405, 400, 'Cancelled', 'Avbruten', SYSUTCDATETIME(), 1);
	
	
	INSERT INTO nhd_db.dbo.[user]
	(full_name, email_address, password, is_active, created_at)
	VALUES('Alice', 'admin@nhds.com', 'hashed_pw_1', 1, sysutcdatetime());