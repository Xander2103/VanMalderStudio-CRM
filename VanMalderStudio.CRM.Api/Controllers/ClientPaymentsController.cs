using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VanMalderStudio.CRM.Api.Data;
using VanMalderStudio.CRM.Api.Models;
using VanMalderStudio.CRM.Api.DTOs;
using VanMalderStudio.CRM.Api.Enums;

namespace VanMalderStudio.CRM.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ClientPaymentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ClientPaymentsController(ApplicationDbContext context)
    {
        _context = context;
    }

    private static ClientPaymentResponseDto MapToDto(ClientPayment p) => new()
    {
        Id = p.Id,
        ClientId = p.ClientId,
        ClientCompanyName = p.Client?.CompanyName ?? string.Empty,
        Month = p.Month,
        Year = p.Year,
        Amount = p.Amount,
        Status = p.Status,
        DueDate = p.DueDate,
        PaidAt = p.PaidAt,
        ReminderSentAt = p.ReminderSentAt,
        Notes = p.Notes,
        CreatedAt = p.CreatedAt,
        UpdatedAt = p.UpdatedAt
    };

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ClientPaymentResponseDto>>> GetPayments()
    {
        var payments = await _context.ClientPayments
            .Include(p => p.Client)
            .OrderByDescending(p => p.Year)
            .ThenByDescending(p => p.Month)
            .ToListAsync();

        return Ok(payments.Select(MapToDto));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ClientPaymentResponseDto>> GetPayment(int id)
    {
        var payment = await _context.ClientPayments
            .Include(p => p.Client)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (payment is null)
        {
            return NotFound();
        }

        return Ok(MapToDto(payment));
    }

    [HttpGet("client/{clientId:int}")]
    public async Task<ActionResult<IEnumerable<ClientPaymentResponseDto>>> GetPaymentsByClient(int clientId)
    {
        var payments = await _context.ClientPayments
            .Include(p => p.Client)
            .Where(p => p.ClientId == clientId)
            .OrderByDescending(p => p.Year)
            .ThenByDescending(p => p.Month)
            .ToListAsync();

        return Ok(payments.Select(MapToDto));
    }

    [HttpGet("month/{year:int}/{month:int}")]
    public async Task<ActionResult<IEnumerable<ClientPaymentResponseDto>>> GetPaymentsByMonth(int year, int month)
    {
        var payments = await _context.ClientPayments
            .Include(p => p.Client)
            .Where(p => p.Year == year && p.Month == month)
            .OrderBy(p => p.Client.CompanyName)
            .ToListAsync();

        return Ok(payments.Select(MapToDto));
    }

    [HttpPost]
    public async Task<ActionResult<ClientPaymentResponseDto>> CreatePayment(CreateClientPaymentDto dto)
    {
        var clientExists = await _context.Clients.AnyAsync(c => c.Id == dto.ClientId);
        if (!clientExists)
        {
            return BadRequest("Client not found.");
        }

        var payment = new ClientPayment
        {
            ClientId = dto.ClientId,
            Month = dto.Month,
            Year = dto.Year,
            Amount = dto.Amount,
            Status = dto.Status,
            DueDate = dto.DueDate,
            Notes = dto.Notes,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.ClientPayments.Add(payment);
        await _context.SaveChangesAsync();

        await _context.Entry(payment).Reference(p => p.Client).LoadAsync();

        return CreatedAtAction(nameof(GetPayment), new { id = payment.Id }, MapToDto(payment));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdatePayment(int id, UpdateClientPaymentDto dto)
    {
        var payment = await _context.ClientPayments.FindAsync(id);

        if (payment is null)
        {
            return NotFound();
        }

        payment.Amount = dto.Amount;
        payment.Status = dto.Status;
        payment.DueDate = dto.DueDate;
        payment.PaidAt = dto.PaidAt;
        payment.Notes = dto.Notes;
        payment.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("{id:int}/mark-paid")]
    public async Task<IActionResult> MarkPaid(int id)
    {
        var payment = await _context.ClientPayments.FindAsync(id);

        if (payment is null)
        {
            return NotFound();
        }

        payment.Status = ClientPaymentStatus.Paid;
        payment.PaidAt = DateTime.UtcNow;
        payment.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeletePayment(int id)
    {
        var payment = await _context.ClientPayments.FindAsync(id);

        if (payment is null)
        {
            return NotFound();
        }

        _context.ClientPayments.Remove(payment);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("generate-month/{year:int}/{month:int}")]
    public async Task<ActionResult<GenerateMonthResponseDto>> GenerateMonth(int year, int month)
    {
        var clients = await _context.Clients
            .Where(c => c.MonthlyMaintenanceFee != null && c.MonthlyMaintenanceFee > 0)
            .ToListAsync();

        var existingClientIds = await _context.ClientPayments
            .Where(p => p.Year == year && p.Month == month)
            .Select(p => p.ClientId)
            .ToListAsync();

        var dueDate = new DateTime(year, month, DateTime.DaysInMonth(year, month));

        int createdCount = 0;
        int skippedCount = 0;

        foreach (var client in clients)
        {
            if (existingClientIds.Contains(client.Id))
            {
                skippedCount++;
                continue;
            }

            var payment = new ClientPayment
            {
                ClientId = client.Id,
                Month = month,
                Year = year,
                Amount = client.MonthlyMaintenanceFee!.Value,
                Status = ClientPaymentStatus.Pending,
                DueDate = dueDate,
                Notes = "Automatisch aangemaakt voor maandelijkse onderhoudskost.",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.ClientPayments.Add(payment);
            createdCount++;
        }

        await _context.SaveChangesAsync();

        return Ok(new GenerateMonthResponseDto
        {
            CreatedCount = createdCount,
            SkippedCount = skippedCount,
            Year = year,
            Month = month
        });
    }
}
