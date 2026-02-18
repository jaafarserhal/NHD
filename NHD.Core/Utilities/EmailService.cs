
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;
using System.Net;

namespace NHD.Core.Utilities
{
    // Email Service Interface
    public interface IEmailService
    {
        Task<bool> SendPasswordResetCodeAsync(string email, string resetCode);
        Task<bool> SendEmailAsync(string to, string subject, string body, bool isHtml = true);
        Task<bool> SendVerificationEmailAsync(string FirstName, string email, string token);
        Task<bool> SendSuccefullPasswordChangeEmailAsync(string email, string FirstName);
        Task<bool> SendResetLinkEmailAsync(string email, string FirstName, string token);
        Task<bool> SendContactUsEmailAsync(string fromEmail, string fromName, string phone, string subject, string message);

        Task<bool> SendSuccessfullContactUsReplyEmailAsync(string toEmail, string toName);

        Task<bool> SendEmailWithAttachmentAsync(string to, string subject, string body, byte[] attachmentData, string attachmentFileName, bool isHtml = true);

        string GenerateReceiptEmailBody(string customerEmail, string orderNumber);
    }

    // Email Configuration Model
    public class EmailConfiguration
    {
        public string SmtpServer { get; set; }
        public int SmtpPort { get; set; }
        public string SmtpUsername { get; set; }
        public string SmtpPassword { get; set; }
        public string FromEmail { get; set; }
        public string FromName { get; set; }
        public string BaseUrl { get; set; }
        public bool EnableSsl { get; set; } = true;
    }
    public class EmailService : IEmailService
    {
        private readonly EmailConfiguration _emailConfig;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _emailConfig = configuration.GetSection("EmailConfiguration").Get<EmailConfiguration>();
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<bool> SendPasswordResetCodeAsync(string email, string resetCode)
        {
            try
            {
                var subject = "Password Reset Code";
                var body = GeneratePasswordResetEmailBody(resetCode);

                return await SendEmailAsync(email, subject, body, true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send password reset email to {email}");
                return false;
            }
        }

        public async Task<bool> SendEmailAsync(string to, string subject, string body, bool isHtml = true)
        {
            try
            {
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(_emailConfig.FromName, _emailConfig.FromEmail));
                message.To.Add(new MailboxAddress("", to));
                message.Subject = subject;

                var bodyBuilder = new BodyBuilder();
                if (isHtml)
                {
                    bodyBuilder.HtmlBody = body;
                }
                else
                {
                    bodyBuilder.TextBody = body;
                }

                message.Body = bodyBuilder.ToMessageBody();

                using var client = new SmtpClient();

                // Connect to SMTP server
                await client.ConnectAsync(_emailConfig.SmtpServer, _emailConfig.SmtpPort,
                    _emailConfig.EnableSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.None);

                // Authenticate if credentials are provided
                if (!string.IsNullOrEmpty(_emailConfig.SmtpUsername))
                {
                    await client.AuthenticateAsync(_emailConfig.SmtpUsername, _emailConfig.SmtpPassword);
                }

                // Send email
                await client.SendAsync(message);
                await client.DisconnectAsync(true);

                _logger.LogInformation($"Email sent successfully to {to}");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send email to {to}");
                return false;
            }
        }

        public async Task<bool> SendVerificationEmailAsync(string FirstName, string email, string token)
        {
            try
            {
                var subject = "Confirm Your Email with Nawa";

                var verifyUrl = $"{_emailConfig.BaseUrl}/email/verified?token={token}";
                var body = GenerateEmailVerificationBody(FirstName, verifyUrl);
                return await SendEmailAsync(email, subject, body, true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send email verification to {email}");
                return false;
            }
        }

        public async Task<bool> SendResetLinkEmailAsync(string email, string FirstName, string token)
        {
            try
            {
                var subject = "Password Reset Link";
                var changePasswordUrl = $"{_emailConfig.BaseUrl}/auth/change-password?token={token}";
                var body = GenerateChangePasswordBody(FirstName, changePasswordUrl);
                return await SendEmailAsync(email, subject, body, true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send password reset link email to {email}");
                return false;
            }
        }

        public async Task<bool> SendSuccefullPasswordChangeEmailAsync(string email, string FirstName)
        {
            try
            {
                var subject = "Password Changed Successfully";
                var body = GeneratePasswordChangedBody(FirstName);
                return await SendEmailAsync(email, subject, body, true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send password change confirmation email to {email}");
                return false;
            }
        }

        public async Task<bool> SendContactUsEmailAsync(string fromEmail, string fromName, string phone, string subject, string message)
        {
            try
            {
                var encodedFromName = WebUtility.HtmlEncode(fromName ?? string.Empty);
                var encodedFromEmail = WebUtility.HtmlEncode(fromEmail ?? string.Empty);
                var encodedPhone = WebUtility.HtmlEncode(phone ?? string.Empty);
                var encodedSubject = WebUtility.HtmlEncode(subject ?? string.Empty);
                var encodedMessage = WebUtility.HtmlEncode(message ?? string.Empty)
                    .Replace("\n", "<br/>");

                var fullSubject = $"📩 Contact Form: {encodedSubject}";

                var body = $@"
<!DOCTYPE html>
<html>
  <body style=""font-family:Segoe UI,Arial,sans-serif;background-color:#f4f6f8;margin:0;padding:24px;"">
    <table role=""presentation"" width=""100%"" cellspacing=""0"" cellpadding=""0"">
      <tr>
        <td align=""center"">
          <table role=""presentation"" width=""600"" cellspacing=""0"" cellpadding=""0"" 
                 style=""background:#ffffff;border-radius:12px;box-shadow:0 4px 14px rgba(0,0,0,.08);padding:24px;"">

            <tr>
              <td style=""text-align:center;padding-bottom:8px;"">
                <h2 style=""margin:0;color:#111827;"">New Contact Form Message</h2>
                <p style=""margin:4px 0 0 0;color:#6b7280;font-size:13px;"">
                  You received this message from your website contact form.
                </p>
              </td>
            </tr>

            <tr>
              <td style=""padding:16px 0;border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;"">
                <p style=""margin:0 0 6px 0;"">
                  <strong>Name:</strong> {encodedFromName}
                </p>
                <p style=""margin:0 0 6px 0;"">
                  <strong>Email:</strong> {encodedFromEmail}
                </p>
                <p style=""margin:0 0 6px 0;"">
                  <strong>Subject:</strong> {encodedSubject}
                </p>
                <p style=""margin:0 0 6px 0;"">
                  <strong>Phone:</strong> {encodedPhone}
                </p>
                <p style=""margin:0;"">
                  <strong>Received:</strong> {DateTime.UtcNow:dddd, MMM dd yyyy • HH:mm} UTC
                </p>
              </td>
            </tr>

            <tr>
              <td style=""padding-top:16px;"">
                <p style=""margin:0 0 6px 0;font-weight:600;"">Message:</p>
                <div style=""background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px;white-space:normal;"">
                  {encodedMessage}
                </div>
              </td>
            </tr>

            <tr>
              <td style=""text-align:center;color:#9ca3af;font-size:12px;padding-top:18px;"">
                <p style=""margin:0;"">
                  You can reply directly to this email to contact the sender.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>";
                return await SendEmailAsync("kontakt@nawahomeofdates.com", fullSubject, body, isHtml: true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send contact us email from {fromEmail}");
                return false;
            }
        }

        public async Task<bool> SendSuccessfullContactUsReplyEmailAsync(string toEmail, string toName)
        {
            try
            {
                var subject = "Thank You for Contacting Nawa";

                var body = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Thank You for Contacting Nawa</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }}
        .container {{
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}
        .footer {{
            margin-top: 30px;
            font-size: 12px;
            text-align: center;
            color: #777;
        }}
    </style>
</head>
<body>
    <div class='container'>
        <h2>Thank You for Contacting Nawa</h2>
        <p>Hello, {toName}</p>
        <p>
            We appreciate you reaching out to us. Your message has been received,
            and our team will get back to you as soon as possible.
        </p>
        <p>
            In the meantime, feel free to explore our website for more information
            about our premium dates and offerings.
        </p>
        <p>Best regards,<br/>The Nawa Team</p>  
    </div>
</body>
</html>";
                return await SendEmailAsync(toEmail, subject, body, true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send contact us reply email to {toEmail}");
                return false;
            }
        }
        private string GenerateEmailVerificationBody(string FirstName, string verifyUrl)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Confirm Your Email with Nawa</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }}
        .container {{
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}
        .btn {{
            display: inline-block;
            background-color: #28a745;
            color: #ffffff !important;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-size: 16px;
            font-weight: bold;
        }}
        .footer {{
            margin-top: 30px;
            font-size: 12px;
            text-align: center;
            color: #777;
        }}
    </style>
</head>
<body>
    <div class='container'>
        <h2>Confirm Your Email with Nawa</h2>

        <p>Hello, {FirstName}</p>

        <p>
            Thank you for registering with <strong>Nawa</strong>!  
            To complete your registration and enjoy a seamless shopping experience,
            please verify your email by clicking the button below:
        </p>

        <p style='text-align:center; margin: 30px 0;'>
            <a href='{verifyUrl}' class='btn'>Verify Email</a>
        </p>

        <p>
            We’re excited to have you with us and hope you enjoy shopping our premium dates.
            If you have any questions, feel free to contact us at
            <a href='mailto:support@nawahomeofdates.com'>support@nawahomeofdates.com</a>.
        </p>

        <p><strong>Welcome to the Nawa family!</strong></p>

        <p>Best regards,<br/>The Nawa Team</p>

        <div class='footer'>
            <p>This is an automated message. Please do not reply.</p>
        </div>
    </div>
</body>
</html>";
        }


        private string GenerateChangePasswordBody(string FirstName, string changePasswordUrl)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Reset Your Password with Nawa</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }}
        .container {{
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}
        .btn {{
            display: inline-block;
            background-color: #28a745;
            color: #ffffff !important;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-size: 16px;
            font-weight: bold;
        }}
        .footer {{
            margin-top: 30px;
            font-size: 12px;
            text-align: center;
            color: #777;
        }}
    </style>
</head>
<body>
    <div class='container'>
        <h2>Reset Your Password with Nawa</h2>

        <p>Hello, {FirstName}</p>
        <p>
            We received a request to reset the password for your <strong>Nawa</strong> account.
        </p>
        
        <p>
        If you requested this change, set a new password here:
        </p>

        <p style='text-align:center; margin: 30px 0;'>
            <a href='{changePasswordUrl}' class='btn'>Set New Password</a>
        </p>

        <p>
          If you did not make this request, you can ignore this email and your password will remain the same.
        </p>

        <p>Best regards,<br/>The Nawa Team</p>

        <div class='footer'>
            <p>This is an automated message. Please do not reply.</p>
        </div>
    </div>
</body>
</html>";
        }
        private string GeneratePasswordChangedBody(string FirstName)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Password Changed Successfully</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }}
        .container {{
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}
        .status {{
            display: inline-block;
            background-color: #28a745;
            color: #ffffff;
            padding: 10px 18px;
            border-radius: 6px;
            font-size: 15px;
            font-weight: bold;
        }}
        .footer {{
            margin-top: 30px;
            font-size: 12px;
            text-align: center;
            color: #777;
        }}
    </style>
</head>
<body>
    <div class='container'>
        <h2>Password Changed Successfully</h2>

        <p>Hello, {FirstName}</p>

        <p>
            This email is to confirm that your <strong>Nawa</strong> account password
            has been changed successfully.
        </p>

        <p style='text-align:center; margin: 30px 0;'>
            <span class='status'>Password Updated</span>
        </p>

        <p>
            If you made this change, no further action is required.
            However, if you did <strong>not</strong> change your password,
            please contact our support team immediately at
            <a href='mailto:support@nawahomeofdates.com'>support@nawahomeofdates.com</a>.
        </p>

        <p>
            Your account security is important to us, and we’re always here to help.
        </p>

        <p>Best regards,<br/>The Nawa Team</p>

        <div class='footer'>
            <p>This is an automated message. Please do not reply.</p>
        </div>
    </div>
</body>
</html>";
        }


        private string GeneratePasswordResetEmailBody(string resetCode)
        {
            return $@"
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='utf-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Password Reset Code</title>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f4;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #ffffff;
                    border-radius: 10px;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                }}
                .header {{
                    text-align: center;
                    color: #333;
                    margin-bottom: 30px;
                }}
                .reset-code {{
                    background-color: #007bff;
                    color: white;
                    font-size: 32px;
                    font-weight: bold;
                    text-align: center;
                    padding: 20px;
                    border-radius: 8px;
                    letter-spacing: 8px;
                    margin: 20px 0;
                }}
                .message {{
                    color: #555;
                    margin: 20px 0;
                }}
                .warning {{
                    background-color: #fff3cd;
                    border: 1px solid #ffeaa7;
                    color: #856404;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 20px 0;
                }}
                .footer {{
                    text-align: center;
                    color: #888;
                    font-size: 12px;
                    margin-top: 30px;
                    border-top: 1px solid #eee;
                    padding-top: 20px;
                }}
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>Password Reset Request</h1>
                </div>
                
                <div class='message'>
                    <p>Hello,</p>
                    <p>You have requested to reset your password. Please use the following verification code:</p>
                </div>
                
                <div class='reset-code'>
                    {resetCode}
                </div>
                
                <div class='message'>
                    <p>Enter this code in your app to proceed with resetting your password.</p>
                </div>
                
                <div class='warning'>
                    <strong>Important:</strong>
                    <ul>
                        <li>This code will expire in 15 minutes</li>
                        <li>If you didn't request this reset, please ignore this email</li>
                        <li>Never share this code with anyone</li>
                    </ul>
                </div>
                
                <div class='footer'>
                    <p>This is an automated message, please do not reply to this email.</p>
                    <p>If you're having trouble, please contact our support team.</p>
                </div>
            </div>
        </body>
        </html>";
        }

        public async Task<bool> SendEmailWithAttachmentAsync(string to, string subject, string body, byte[] attachmentData, string attachmentFileName, bool isHtml = true)
        {
            try
            {
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(_emailConfig.FromName, _emailConfig.FromEmail));
                message.To.Add(new MailboxAddress("", to));
                message.Subject = subject;

                var bodyBuilder = new BodyBuilder();
                if (isHtml)
                {
                    bodyBuilder.HtmlBody = body;
                }
                else
                {
                    bodyBuilder.TextBody = body;
                }

                // Add attachment
                if (attachmentData != null && attachmentData.Length > 0 && !string.IsNullOrEmpty(attachmentFileName))
                {
                    bodyBuilder.Attachments.Add(attachmentFileName, attachmentData, new ContentType("application", "pdf"));
                }

                message.Body = bodyBuilder.ToMessageBody();

                using var client = new SmtpClient();

                // Connect to SMTP server
                await client.ConnectAsync(_emailConfig.SmtpServer, _emailConfig.SmtpPort,
                    _emailConfig.EnableSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.None);

                // Authenticate if credentials are provided
                if (!string.IsNullOrEmpty(_emailConfig.SmtpUsername))
                {
                    await client.AuthenticateAsync(_emailConfig.SmtpUsername, _emailConfig.SmtpPassword);
                }

                // Send email
                await client.SendAsync(message);
                await client.DisconnectAsync(true);

                _logger.LogInformation($"Email with attachment sent successfully to {to}");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send email with attachment to {to}");
                return false;
            }
        }
        public string GenerateReceiptEmailBody(string customerEmail, string orderNumber)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Order Confirmation - Nawa</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }}
        .container {{
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}
        .header {{
            text-align: center;
            margin-bottom: 20px;
        }}
        .order-number {{
            background-color: #28a745;
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-weight: bold;
            font-size: 16px;
            margin: 15px 0;
        }}
        .footer {{
            margin-top: 30px;
            font-size: 12px;
            text-align: center;
            color: #777;
        }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>NAWA - HOME OF DATES</h1>
            <p>Thank you for your order!</p>
        </div>
        
        <h2>Order Confirmation</h2>
        
        <p>Dear Customer,</p>
        
        <p>We're excited to confirm that your order has been successfully placed!</p>
        
        <div class='order-number'>
            Order Number: {orderNumber}
        </div>
        
        <p>
            Please find your order receipt attached to this email. This receipt contains 
            all the details about your order, including itemized list, pricing, and 
            delivery information.
        </p>
        
        <p>
            <strong>What happens next?</strong><br/>
            • You will receive a shipping confirmation email with tracking information<br/>
            • Your premium dates will be carefully packed and shipped<br/>
            • Expected delivery: 2-5 business days
        </p>
        
        <p>
            If you have any questions about your order, please don't hesitate to contact us at 
            <a href='mailto:kontakt@nawahomeofdates.com'>kontakt@nawahomeofdates.com</a>.
        </p>
        
        <p>Thank you for choosing Nawa - Home of Dates!</p>
        
        <p>Best regards,<br/>The Nawa Team</p>
        
        <div class='footer'>
            <p>Visit us at: <a href='https://www.nawahomeofdates.com'>www.nawahomeofdates.com</a></p>
        </div>
    </div>
</body>
</html>";
        }
    }



}