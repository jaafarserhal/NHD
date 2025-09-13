using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using NHD.Core.Services;
using NHD.Core.Services.Model;
using NHD.Core.Common.Models;

namespace NHD.Web.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly ILogger<UsersController> _logger;
        private readonly IUserService _userService;
        private readonly string _jwtSecret;

        public UsersController(IConfiguration config, ILogger<UsersController> logger, IUserService userService)
        {
            _userService = userService ?? throw new ArgumentNullException(nameof(userService));
            _logger = logger;
            _jwtSecret = config["JwtSettings:SecretKey"] ?? throw new ArgumentNullException("JwtSettings:SecretKey");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto login)
        {
            var user = await _userService.AuthenticateAsync(login.Email, login.Password);
            if (user == null)
                return Unauthorized();

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtSecret);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[] {
                new Claim(ClaimTypes.Name, login.Email)
            }),
                Expires = DateTime.UtcNow.AddHours(1),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature
                )
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var jwt = tokenHandler.WriteToken(token);

            var userResponse = new UserLoginResponse
            {
                Email = user.Email,
                FullName = user.FullName,
                PhoneNumber = user.PhoneNumber
            };
            _logger.LogInformation("User {Email} logged in successfully", login.Email);

            return Ok(new { token = jwt, user = userResponse });
        }

        [Authorize]
        [HttpGet]
        public async Task<ActionResult<ServiceResult<IEnumerable<UserDto>>>> GetUsers([FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            var data = await _userService.GetUsersAsync(page, limit);
            if (data.IsSuccess)
                return Ok(data);
            return BadRequest(data);
        }
    }
}