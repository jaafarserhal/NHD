-- =============================================
-- INSERT INTO gen_lookup_type
-- =============================================
INSERT INTO dbo.gen_lookup_type (lookup_type_id, name_en, name_sv, created_at, is_active)
VALUES 
    (100, 'Product Category', 'Produktkategori', SYSUTCDATETIME(), 1),
    (200, 'Product Type', 'Produkttyp', SYSUTCDATETIME(), 1),
    (300, 'Product Size', 'Produktstorlek', SYSUTCDATETIME(), 1),
    (400, 'Order Status', 'Orderstatus', SYSUTCDATETIME(), 1),
	(500, N'Sections Type', N'Sections Type',SYSUTCDATETIME(), 1),
	(600, N'Customer Status', N'Customer Status',SYSUTCDATETIME(), 1),
	(700, N'Address Type', N'Address Type',SYSUTCDATETIME(), 1),
	(800, N'Contact Subject', N'AContact Subject',SYSUTCDATETIME(), 1),
	(900, N'FAQ Type', N'FAQ Type',SYSUTCDATETIME(), 1);

-- =============================================
-- INSERT INTO gen_lookup
-- =============================================
INSERT INTO dbo.gen_lookup
(lookup_id, lookup_type_id, name_en, name_sv, created_at, is_active)
VALUES
(100, 100, N'Signature Date Gifts', N'DelikatessDadelgåvor',SYSUTCDATETIME(), 1),
(101, 100, N'Signature Dates', N'DelikatessDadlar',SYSUTCDATETIME(), 1),
(102, 100, N'Chocolate Dates', N'ChokladDadlar',SYSUTCDATETIME(), 1),
(103, 100, N'Classic Date Pouches', N'Klassisk dadelpåse',SYSUTCDATETIME(), 1),
(104, 100, N'Date Snacks', N'Dadelmellanmål',SYSUTCDATETIME(), 1),
(105, 100, N'Date Sweetners', N'Dadelsötning',SYSUTCDATETIME(), 1),
 -- Product Types (200 series)
(200, 200,'Plain Date', 'Naturell Dadel',SYSUTCDATETIME(), 1),
(201, 200,'Assorted Date', 'Blandade Dadlar',SYSUTCDATETIME(), 1),
(202, 200,'Filled Date', 'Fyllda Dadlar',SYSUTCDATETIME(), 1),
(203, 200,'None', 'Ingen',SYSUTCDATETIME(), 1),
 -- Product Sizes (300 series)
(300, 300, '1 piece', '1 stycken', SYSUTCDATETIME(), 1),
(301, 300, '3 pieces', '3 stycken', SYSUTCDATETIME(), 1),
(302, 300, '8 pieces', '8 stycken', SYSUTCDATETIME(), 1),
(303, 300, '9 pieces', '9 stycken', SYSUTCDATETIME(), 1),
(304, 300, '12 pieces', '12 stycken', SYSUTCDATETIME(), 1),
(305, 300, '20 pieces', '20 stycken', SYSUTCDATETIME(), 1),
(306, 300, '35 pieces', '35 stycken', SYSUTCDATETIME(), 1),
(307, 300, '250g', '250g', SYSUTCDATETIME(), 1),
(308, 300, '400g', '400g', SYSUTCDATETIME(), 1),
(309, 300, '450g', '450g', SYSUTCDATETIME(), 1),
(310, 300, '500g', '500g', SYSUTCDATETIME(), 1),
(311, 300, '400ml', '400ml', SYSUTCDATETIME(), 1),
 -- Status (400 series)
(400, 400, 'Pending', 'Väntande', SYSUTCDATETIME(), 1),
(401, 400, 'Confirmed', 'Bekräftad', SYSUTCDATETIME(), 1),
(402, 400, 'Processing', 'Bearbetas', SYSUTCDATETIME(), 1),
(403, 400, 'Shipped', 'Skickad', SYSUTCDATETIME(), 1),
(404, 400, 'Delivered', 'Levererad', SYSUTCDATETIME(), 1),
(405, 400, 'Cancelled', 'Avbruten', SYSUTCDATETIME(), 1),
(500, 500, 'Home - Carousel', 'Home - Carousel', SYSUTCDATETIME(), 1),
(501, 500, 'Home - Call To Action', 'Home - Call To Action', SYSUTCDATETIME(), 1),
(502, 500, 'Home - Gifts', 'Home - Gifts', SYSUTCDATETIME(), 1),
(503, 500, 'Home - Our Products', 'Home - Our Products', SYSUTCDATETIME(), 1),
(504, 500, 'Home - Custom Gifts', 'Home - Our Products', SYSUTCDATETIME(), 1),
(505, 500, 'Home - Subscribe', 'Home - Our Products', SYSUTCDATETIME(), 1),
(506, 500, 'Home - Fill Dates', 'Home - Fill Dates', SYSUTCDATETIME(), 1),
(507, 500, 'About - Main Section', 'About - Main Section', SYSUTCDATETIME(), 1),
(508, 500, 'About - We Love Dates', 'About - We Love Dates', SYSUTCDATETIME(), 1),
(509, 500, 'About - Nawa Experience', 'About - Nawa Experience', SYSUTCDATETIME(), 1)
(600, 600, N'Pending', N'Pending',SYSUTCDATETIME(), 1),
(601, 600, N'Active', N'Aktiv', SYSUTCDATETIME(), 1),
(602, 600, N'Inactive', N'Inaktiv', SYSUTCDATETIME(), 1),
(603, 600, N'Guest', N'Gäst', SYSUTCDATETIME(), 1),
(700, 700, N'Billing', N'Billing',SYSUTCDATETIME(), 1),
(701, 700, N'Shipping', N'Shipping',SYSUTCDATETIME(), 1),
(800, 800, 'Online Shopping', 'Online Shopping', SYSUTCDATETIME(), 1),
(801, 800, 'Corporate Gifts', 'Corporate Gifts', SYSUTCDATETIME(), 1),
(802, 800, 'Sales Inquiry', 'Sales Inquiry', SYSUTCDATETIME(), 1),
(900, 900, 'Delivery & Shipping', 'Delivery & Shipping', SYSUTCDATETIME(), 1),
(901, 900, 'Payment & Refund', 'Payment & Refund', SYSUTCDATETIME(), 1),
(902, 900, 'Security', 'Security', SYSUTCDATETIME(), 1);




	
	
	INSERT INTO nhd_db.dbo.[user]
	(full_name, email_address, password, is_active, created_at)
	VALUES('Alice', 'admin@nhds.com', 'hashed_pw_1', 1, sysutcdatetime());
	
	
	--Products
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(100, 200, 300, N'Product 1', N'Produkt 1', N'Description for product 1', N'Beskrivning för produkt 1', N'https://example.com/img1.jpg', 10.00, '2025-09-15 19:22:01.579', 1);
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(101, 200, 301, N'Product 2', N'Produkt 2', N'Description for product 2', N'Beskrivning för produkt 2', N'https://example.com/img2.jpg', 20.00, '2025-09-15 19:22:01.579', 1);
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(102, 200, 302, N'Product 3', N'Produkt 3', N'Description for product 3', N'Beskrivning för produkt 3', N'https://example.com/img3.jpg', 30.00, '2025-09-15 19:22:01.579', 1);
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(103, 200, 300, N'Product 4', N'Produkt 4', N'Description for product 4', N'Beskrivning för produkt 4', N'https://example.com/img4.jpg', 40.00, '2025-09-15 19:22:01.579', 1);
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(100, 200, 301, N'Product 5', N'Produkt 5', N'Description for product 5', N'Beskrivning för produkt 5', N'https://example.com/img5.jpg', 50.00, '2025-09-15 19:22:01.579', 1);
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(101, 200, 302, N'Product 6', N'Produkt 6', N'Description for product 6', N'Beskrivning för produkt 6', N'https://example.com/img6.jpg', 60.00, '2025-09-15 19:22:01.579', 1);
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(102, 200, 300, N'Product 7', N'Produkt 7', N'Description for product 7', N'Beskrivning för produkt 7', N'https://example.com/img7.jpg', 70.00, '2025-09-15 19:22:01.579', 1);
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(103, 200, 301, N'Product 8', N'Produkt 8', N'Description for product 8', N'Beskrivning för produkt 8', N'https://example.com/img8.jpg', 80.00, '2025-09-15 19:22:01.579', 1);
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(100, 200, 302, N'Product 9', N'Produkt 9', N'Description for product 9', N'Beskrivning för produkt 9', N'https://example.com/img9.jpg', 90.00, '2025-09-15 19:22:01.579', 1);
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(101, 200, 300, N'Product 10', N'Produkt 10', N'Description for product 10', N'Beskrivning för produkt 10', N'https://example.com/img10.jpg', 100.00, '2025-09-15 19:22:01.579', 1);
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(102, 200, 301, N'Product 11', N'Produkt 11', N'Description for product 11', N'Beskrivning för produkt 11', N'https://example.com/img11.jpg', 110.00, '2025-09-15 19:22:01.579', 1);
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(103, 200, 302, N'Product 12', N'Produkt 12', N'Description for product 12', N'Beskrivning för produkt 12', N'https://example.com/img12.jpg', 120.00, '2025-09-15 19:22:01.579', 1);
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(100, 200, 300, N'Product 13', N'Produkt 13', N'Description for product 13', N'Beskrivning för produkt 13', N'https://example.com/img13.jpg', 130.00, '2025-09-15 19:22:01.579', 1);
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(101, 200, 301, N'Product 14', N'Produkt 14', N'Description for product 14', N'Beskrivning för produkt 14', N'https://example.com/img14.jpg', 140.00, '2025-09-15 19:22:01.579', 1);
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(102, 200, 302, N'Product 15', N'Produkt 15', N'Description for product 15', N'Beskrivning för produkt 15', N'https://example.com/img15.jpg', 150.00, '2025-09-15 19:22:01.579', 1);
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(103, 200, 300, N'Product 16', N'Produkt 16', N'Description for product 16', N'Beskrivning för produkt 16', N'https://example.com/img16.jpg', 160.00, '2025-09-15 19:22:01.579', 1);
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(100, 200, 301, N'Product 17', N'Produkt 17', N'Description for product 17', N'Beskrivning för produkt 17', N'https://example.com/img17.jpg', 170.00, '2025-09-15 19:22:01.579', 1);
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(101, 200, 302, N'Product 18', N'Produkt 18', N'Description for product 18', N'Beskrivning för produkt 18', N'https://example.com/img18.jpg', 180.00, '2025-09-15 19:22:01.579', 1);
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(102, 200, 300, N'Product 19', N'Produkt 19', N'Description for product 19', N'Beskrivning för produkt 19', N'https://example.com/img19.jpg', 190.00, '2025-09-15 19:22:01.579', 1);
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(103, 200, 301, N'Product 20', N'Produkt 20', N'Description for product 20', N'Beskrivning för produkt 20', N'https://example.com/img20.jpg', 200.00, '2025-09-15 19:22:01.579', 1);
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(100, 200, 302, N'Product 21', N'Produkt 21', N'Description for product 21', N'Beskrivning för produkt 21', N'https://example.com/img21.jpg', 210.00, '2025-09-15 19:22:01.579', 1);
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(101, 200, 300, N'Product 22', N'Produkt 22', N'Description for product 22', N'Beskrivning för produkt 22', N'https://example.com/img22.jpg', 220.00, '2025-09-15 19:22:01.579', 1);
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(102, 200, 301, N'Product 23', N'Produkt 23', N'Description for product 23', N'Beskrivning för produkt 23', N'https://example.com/img23.jpg', 230.00, '2025-09-15 19:22:01.579', 1);
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(103, 200, 302, N'Product 24', N'Produkt 24', N'Description for product 24', N'Beskrivning för produkt 24', N'https://example.com/img24.jpg', 240.00, '2025-09-15 19:22:01.579', 1);
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(100, 200, 300, N'Product 25', N'Produkt 25', N'Description for product 25', N'Beskrivning för produkt 25', N'https://example.com/img25.jpg', 250.00, '2025-09-15 19:22:01.579', 1);
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(101, 200, 301, N'Product 26', N'Produkt 26', N'Description for product 26', N'Beskrivning för produkt 26', N'https://example.com/img26.jpg', 260.00, '2025-09-15 19:22:01.579', 1);
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(102, 200, 302, N'Product 27', N'Produkt 27', N'Description for product 27', N'Beskrivning för produkt 27', N'https://example.com/img27.jpg', 270.00, '2025-09-15 19:22:01.579', 1);
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(103, 200, 300, N'Product 28', N'Produkt 28', N'Description for product 28', N'Beskrivning för produkt 28', N'https://example.com/img28.jpg', 280.00, '2025-09-15 19:22:01.579', 1);
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(100, 200, 301, N'Product 29', N'Produkt 29', N'Description for product 29', N'Beskrivning för produkt 29', N'https://example.com/img29.jpg', 290.00, '2025-09-15 19:22:01.579', 1);
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(101, 200, 302, N'Product 30', N'Produkt 30', N'Description for product 30', N'Beskrivning för produkt 30', N'https://example.com/img30.jpg', 300.00, '2025-09-15 19:22:01.579', 1);
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(102, 200, 300, N'Product 31', N'Produkt 31', N'Description for product 31', N'Beskrivning för produkt 31', N'https://example.com/img31.jpg', 310.00, '2025-09-15 19:22:01.579', 1);
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(103, 200, 301, N'Product 32', N'Produkt 32', N'Description for product 32', N'Beskrivning för produkt 32', N'https://example.com/img32.jpg', 320.00, '2025-09-15 19:22:01.579', 1);
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(100, 200, 302, N'Product 33', N'Produkt 33', N'Description for product 33', N'Beskrivning för produkt 33', N'https://example.com/img33.jpg', 330.00, '2025-09-15 19:22:01.579', 1);
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(101, 200, 300, N'Product 34', N'Produkt 34', N'Description for product 34', N'Beskrivning för produkt 34', N'https://example.com/img34.jpg', 340.00, '2025-09-15 19:22:01.579', 1);
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(102, 200, 301, N'Product 35', N'Produkt 35', N'Description for product 35', N'Beskrivning för produkt 35', N'https://example.com/img35.jpg', 350.00, '2025-09-15 19:22:01.579', 1);
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(103, 200, 302, N'Product 36', N'Produkt 36', N'Description for product 36', N'Beskrivning för produkt 36', N'https://example.com/img36.jpg', 360.00, '2025-09-15 19:22:01.579', 1);
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(100, 200, 300, N'Product 37', N'Produkt 37', N'Description for product 37', N'Beskrivning för produkt 37', N'https://example.com/img37.jpg', 370.00, '2025-09-15 19:22:01.579', 1);
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(101, 200, 301, N'Product 38', N'Produkt 38', N'Description for product 38', N'Beskrivning för produkt 38', N'https://example.com/img38.jpg', 380.00, '2025-09-15 19:22:01.579', 1);
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(102, 200, 302, N'Product 39', N'Produkt 39', N'Description for product 39', N'Beskrivning för produkt 39', N'https://example.com/img39.jpg', 390.00, '2025-09-15 19:22:01.579', 1);
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(103, 200, 300, N'Product 40', N'Produkt 40', N'Description for product 40', N'Beskrivning för produkt 40', N'https://example.com/img40.jpg', 400.00, '2025-09-15 19:22:01.579', 1);
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(100, 200, 301, N'Product 41', N'Produkt 41', N'Description for product 41', N'Beskrivning för produkt 41', N'https://example.com/img41.jpg', 410.00, '2025-09-15 19:22:01.579', 1);
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(101, 200, 302, N'Product 42', N'Produkt 42', N'Description for product 42', N'Beskrivning för produkt 42', N'https://example.com/img42.jpg', 420.00, '2025-09-15 19:22:01.579', 1);
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(102, 200, 300, N'Product 43', N'Produkt 43', N'Description for product 43', N'Beskrivning för produkt 43', N'https://example.com/img43.jpg', 430.00, '2025-09-15 19:22:01.579', 1);
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(103, 200, 301, N'Product 44', N'Produkt 44', N'Description for product 44', N'Beskrivning för produkt 44', N'https://example.com/img44.jpg', 440.00, '2025-09-15 19:22:01.579', 1);
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(100, 200, 302, N'Product 45', N'Produkt 45', N'Description for product 45', N'Beskrivning för produkt 45', N'https://example.com/img45.jpg', 450.00, '2025-09-15 19:22:01.579', 1);
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(101, 200, 300, N'Product 46', N'Produkt 46', N'Description for product 46', N'Beskrivning för produkt 46', N'https://example.com/img46.jpg', 460.00, '2025-09-15 19:22:01.579', 1);
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(102, 200, 301, N'Product 47', N'Produkt 47', N'Description for product 47', N'Beskrivning för produkt 47', N'https://example.com/img47.jpg', 470.00, '2025-09-15 19:22:01.579', 1);
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(103, 200, 302, N'Product 48', N'Produkt 48', N'Description for product 48', N'Beskrivning för produkt 48', N'https://example.com/img48.jpg', 480.00, '2025-09-15 19:22:01.579', 1);
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(100, 200, 300, N'Product 49', N'Produkt 49', N'Description for product 49', N'Beskrivning för produkt 49', N'https://example.com/img49.jpg', 490.00, '2025-09-15 19:22:01.579', 1);
	INSERT INTO dbo.product
	(prd_lookup_category_id, prd_lookup_type_id, prd_lookup_size_id, name_en, name_sv, description_en, description_sv, image_url, price, created_at, is_active)
	VALUES(101, 200, 301, N'Product 50', N'Produkt 50', N'Description for product 50', N'Beskrivning för produkt 50', N'https://example.com/img50.jpg', 500.00, '2025-09-15 19:22:01.579', 1);