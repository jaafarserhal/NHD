using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NHD.Core.Data;
using NHD.Core.Models;
using NHD.Core.Services.Model.Customer;
using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Element;
using iText.Layout.Properties;
using iText.Kernel.Colors;
using iText.Layout.Borders;

namespace NHD.Core.Utilities
{
    public interface IPdfReceiptService
    {
        Task<byte[]> GenerateGuestReceiptPdfAsync(Order order, Customer customer, IEnumerable<OrderItem> orderItems, Address shippingAddress, Address billingAddress);
        Task<byte[]> GenerateCustomerReceiptPdfAsync(Order order, Customer customer, IEnumerable<OrderItem> orderItems, Address shippingAddress, Address billingAddress);
    }

    public class PdfReceiptService : IPdfReceiptService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<PdfReceiptService> _logger;

        public PdfReceiptService(AppDbContext context, ILogger<PdfReceiptService> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<byte[]> GenerateGuestReceiptPdfAsync(Order order, Customer customer, IEnumerable<OrderItem> orderItems, Address shippingAddress, Address billingAddress)
        {
            return await GenerateReceiptPdfAsync(order, customer, orderItems, shippingAddress, billingAddress, true);
        }

        public async Task<byte[]> GenerateCustomerReceiptPdfAsync(Order order, Customer customer, IEnumerable<OrderItem> orderItems, Address shippingAddress, Address billingAddress)
        {
            return await GenerateReceiptPdfAsync(order, customer, orderItems, shippingAddress, billingAddress, false);
        }

        private async Task<byte[]> GenerateReceiptPdfAsync(Order order, Customer customer, IEnumerable<OrderItem> orderItems, Address shippingAddress, Address billingAddress, bool isGuest)
        {
            try
            {
                using var memoryStream = new MemoryStream();
                using var writer = new PdfWriter(memoryStream);
                using var pdf = new PdfDocument(writer);
                var document = new Document(pdf);

                // Add header
                AddHeader(document, order);

                // Add customer information
                AddCustomerInformation(document, customer, isGuest);

                // Add addresses
                AddAddresses(document, shippingAddress, billingAddress);

                // Add order items
                await AddOrderItemsAsync(document, orderItems);

                // Add total
                AddOrderTotal(document, order);

                // Add footer
                AddFooter(document);

                document.Close();

                return memoryStream.ToArray();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating PDF receipt for order: {OrderId}", order.OrderId);
                throw;
            }
        }

        private void AddHeader(Document document, Order order)
        {
            // Company header
            var header = new Paragraph("NAWA - HOME OF DATES")
                .SetFontSize(24)
                .SetBold()
                .SetTextAlignment(TextAlignment.CENTER)
                .SetMarginBottom(10);
            document.Add(header);

            var subHeader = new Paragraph("Premium Dates & Natural Products")
                .SetFontSize(12)
                .SetTextAlignment(TextAlignment.CENTER)
                .SetMarginBottom(20);
            document.Add(subHeader);

            // Receipt title and order info
            var receiptTitle = new Paragraph("ORDER RECEIPT")
                .SetFontSize(18)
                .SetBold()
                .SetTextAlignment(TextAlignment.CENTER)
                .SetMarginBottom(20);
            document.Add(receiptTitle);

            // Order details table
            var orderDetailsTable = new Table(UnitValue.CreatePercentArray(new float[] { 50, 50 }))
                .SetWidth(UnitValue.CreatePercentValue(100))
                .SetMarginBottom(20);

            orderDetailsTable.AddCell(CreateCell("Order Number:", true));
            orderDetailsTable.AddCell(CreateCell(order.GeneratedOrderId ?? order.OrderId.ToString()));

            orderDetailsTable.AddCell(CreateCell("Order Date:", true));
            orderDetailsTable.AddCell(CreateCell(order.OrderDate.ToString("dd/MM/yyyy HH:mm")));

            document.Add(orderDetailsTable);
        }

        private void AddCustomerInformation(Document document, Customer customer, bool isGuest)
        {
            var customerTitle = new Paragraph("CUSTOMER INFORMATION")
                .SetFontSize(14)
                .SetBold()
                .SetMarginBottom(10);
            document.Add(customerTitle);

            var customerTable = new Table(UnitValue.CreatePercentArray(new float[] { 30, 70 }))
                .SetWidth(UnitValue.CreatePercentValue(100))
                .SetMarginBottom(20);

            if (isGuest)
            {
                customerTable.AddCell(CreateCell("Type:", true));
                customerTable.AddCell(CreateCell("Guest Customer"));
            }

            customerTable.AddCell(CreateCell("Name:", true));
            customerTable.AddCell(CreateCell($"{customer.FirstName} {customer.LastName}"));

            customerTable.AddCell(CreateCell("Email:", true));
            customerTable.AddCell(CreateCell(customer.EmailAddress));

            document.Add(customerTable);
        }

        private void AddAddresses(Document document, Address shippingAddress, Address billingAddress)
        {
            var addressTitle = new Paragraph("DELIVERY & BILLING INFORMATION")
                .SetFontSize(14)
                .SetBold()
                .SetMarginBottom(10);
            document.Add(addressTitle);

            var addressTable = new Table(UnitValue.CreatePercentArray(new float[] { 50, 50 }))
                .SetWidth(UnitValue.CreatePercentValue(100))
                .SetMarginBottom(20);

            // Shipping address
            var shippingCell = new Cell()
                .SetBorder(Border.NO_BORDER)
                .SetPaddings(5, 5, 5, 5);

            shippingCell.Add(new Paragraph("SHIPPING ADDRESS").SetBold().SetFontSize(12));
            shippingCell.Add(new Paragraph($"{shippingAddress.ContactFirstName} {shippingAddress.ContactLastName}"));
            shippingCell.Add(new Paragraph($"{shippingAddress.StreetNumber} {shippingAddress.StreetName}"));
            shippingCell.Add(new Paragraph($"{shippingAddress.PostalCode} {shippingAddress.City}"));
            if (!string.IsNullOrEmpty(shippingAddress.ContactPhone))
            {
                shippingCell.Add(new Paragraph($"Phone: {shippingAddress.ContactPhone}"));
            }

            // Billing address
            var billingCell = new Cell()
                .SetBorder(Border.NO_BORDER)
                .SetPaddings(5, 5, 5, 5);

            billingCell.Add(new Paragraph("BILLING ADDRESS").SetBold().SetFontSize(12));
            billingCell.Add(new Paragraph($"{billingAddress.ContactFirstName} {billingAddress.ContactLastName}"));
            billingCell.Add(new Paragraph($"{billingAddress.StreetNumber} {billingAddress.StreetName}"));
            billingCell.Add(new Paragraph($"{billingAddress.PostalCode} {billingAddress.City}"));
            if (!string.IsNullOrEmpty(billingAddress.ContactPhone))
            {
                billingCell.Add(new Paragraph($"Phone: {billingAddress.ContactPhone}"));
            }

            addressTable.AddCell(shippingCell);
            addressTable.AddCell(billingCell);

            document.Add(addressTable);
        }

        private async Task AddOrderItemsAsync(Document document, IEnumerable<OrderItem> orderItems)
        {
            var itemsTitle = new Paragraph("ORDER ITEMS")
                .SetFontSize(14)
                .SetBold()
                .SetMarginBottom(10);
            document.Add(itemsTitle);

            var itemsTable = new Table(UnitValue.CreatePercentArray(new float[] { 50, 15, 15, 20 }))
                .SetWidth(UnitValue.CreatePercentValue(100))
                .SetMarginBottom(20);

            // Header
            itemsTable.AddHeaderCell(CreateHeaderCell("Product"));
            itemsTable.AddHeaderCell(CreateHeaderCell("Qty"));
            itemsTable.AddHeaderCell(CreateHeaderCell("Unit Price"));
            itemsTable.AddHeaderCell(CreateHeaderCell("Total"));

            // Get product details
            var productIds = orderItems.Select(oi => oi.PrdId).ToList();
            var products = await _context.Products
                .Where(p => productIds.Contains(p.PrdId))
                .ToDictionaryAsync(p => p.PrdId, p => p);

            decimal subtotal = 0;
            foreach (var item in orderItems)
            {
                var product = products.GetValueOrDefault(item.PrdId);
                var productName = product?.NameEn ?? $"Product ID: {item.PrdId}";
                var itemTotal = item.UnitPrice * item.Quantity;
                subtotal += itemTotal;

                itemsTable.AddCell(CreateCell(productName));
                itemsTable.AddCell(CreateCell(item.Quantity.ToString()));
                itemsTable.AddCell(CreateCell($"${item.UnitPrice:F2}"));
                itemsTable.AddCell(CreateCell($"${itemTotal:F2}"));
            }

            document.Add(itemsTable);
        }

        private void AddOrderTotal(Document document, Order order)
        {
            var totalTable = new Table(UnitValue.CreatePercentArray(new float[] { 70, 30 }))
                .SetWidth(UnitValue.CreatePercentValue(100))
                .SetMarginBottom(20);

            totalTable.AddCell(CreateCell(""));
            totalTable.AddCell(CreateCell(""));

            totalTable.AddCell(CreateCell("TOTAL AMOUNT:", true));
            totalTable.AddCell(CreateCell($"${order.TotalAmount:F2}", true));

            document.Add(totalTable);
        }

        private void AddFooter(Document document)
        {
            var footer = new Paragraph("Thank you for your order!")
                .SetFontSize(14)
                .SetBold()
                .SetTextAlignment(TextAlignment.CENTER)
                .SetMarginTop(20)
                .SetMarginBottom(10);
            document.Add(footer);

            var contactInfo = new Paragraph("For questions about your order, please contact us at kontakt@nawahomeofdates.com")
                .SetFontSize(10)
                .SetTextAlignment(TextAlignment.CENTER)
                .SetMarginBottom(10);
            document.Add(contactInfo);

            var website = new Paragraph("Visit us at: www.nawahomeofdates.com")
                .SetFontSize(10)
                .SetTextAlignment(TextAlignment.CENTER);
            document.Add(website);
        }

        private Cell CreateCell(string content, bool isBold = false)
        {
            var paragraph = new Paragraph(content);
            if (isBold)
            {
                paragraph.SetBold();
            }
            return new Cell()
                .SetBorder(Border.NO_BORDER)
                .SetPadding(5)
                .Add(paragraph);
        }

        private Cell CreateHeaderCell(string content)
        {
            return new Cell()
                .SetBackgroundColor(ColorConstants.LIGHT_GRAY)
                .SetBold()
                .SetPadding(8)
                .Add(new Paragraph(content));
        }
    }
}