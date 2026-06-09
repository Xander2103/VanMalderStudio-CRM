using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using VanMalderStudio.CRM.Api.Data;
using VanMalderStudio.CRM.Api.DTOs;
using VanMalderStudio.CRM.Api.Models;

namespace VanMalderStudio.CRM.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly PasswordHasher<AdminUser> _passwordHasher = new();

    public AuthController(ApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        var user = await _context.AdminUsers
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user is null)
            return Unauthorized(new { message = "Ongeldige inloggegevens." });

        var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (result == PasswordVerificationResult.Failed)
            return Unauthorized(new { message = "Ongeldige inloggegevens." });

        var expiresAt = DateTime.UtcNow.AddHours(
            int.Parse(_configuration["Jwt:ExpirationHours"] ?? "8"));

        var token = GenerateToken(user, expiresAt);

        return Ok(new LoginResponseDto
        {
            Token = token,
            Email = user.Email,
            ExpiresAt = expiresAt
        });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(email)) return Unauthorized();

        var user = await _context.AdminUsers.FirstOrDefaultAsync(u => u.Email == email);
        if (user is null) return Unauthorized();

        return Ok(new AdminAccountResponseDto { Email = user.Email });
    }

    [HttpPut("credentials")]
    [Authorize]
    public async Task<IActionResult> UpdateCredentials([FromBody] UpdateAdminCredentialsDto request)
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(email)) return Unauthorized();

        var user = await _context.AdminUsers.FirstOrDefaultAsync(u => u.Email == email);
        if (user is null) return Unauthorized();

        var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.CurrentPassword);
        if (result == PasswordVerificationResult.Failed)
            return BadRequest(new { message = "Huidig wachtwoord is onjuist." });

        if (!string.IsNullOrWhiteSpace(request.NewPassword))
        {
            if (request.NewPassword != request.ConfirmNewPassword)
                return BadRequest(new { message = "Nieuwe wachtwoorden komen niet overeen." });

            user.PasswordHash = _passwordHasher.HashPassword(user, request.NewPassword);
        }

        if (!string.IsNullOrWhiteSpace(request.NewEmail))
            user.Email = request.NewEmail;

        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new AdminAccountResponseDto { Email = user.Email });
    }

    private string GenerateToken(AdminUser user, DateTime expiresAt)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email)
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: expiresAt,
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
