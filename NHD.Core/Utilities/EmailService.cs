
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;

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
    }



}