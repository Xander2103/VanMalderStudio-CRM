using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VanMalderStudio.CRM.Api.Data;
using VanMalderStudio.CRM.Api.Models;
using VanMalderStudio.CRM.Api.DTOs;

namespace VanMalderStudio.CRM.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ClientsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ClientsController(ApplicationDbContext context)
    {
        _context = context;
    }

    private static ClientResponseDto MapToDto(Client c) => new()
    {
        Id = c.Id,
        CompanyName = c.CompanyName,
        ContactName = c.ContactName,
        Email = c.Email,
        Phone = c.Phone,
        Website = c.Website,
        Notes = c.Notes,
        WebsitePrice = c.WebsitePrice,
        MonthlyMaintenanceFee = c.MonthlyMaintenanceFee,
        AmountPaid = c.AmountPaid,
        ServerIpAddress = c.ServerIpAddress,
        SshUsername = c.SshUsername,
        HostingProvider = c.HostingProvider,
        HostingPlan = c.HostingPlan,
        HostingManagementUrl = c.HostingManagementUrl,
        HostingRenewalDate = c.HostingRenewalDate,
        DomainName = c.DomainName,
        DomainRegistrar = c.DomainRegistrar,
        DomainManagementUrl = c.DomainManagementUrl,
        DomainRenewalDate = c.DomainRenewalDate,
        IsArchived = c.IsArchived,
        ArchivedAt = c.ArchivedAt,
        ArchiveReason = c.ArchiveReason,
        CreatedAt = c.CreatedAt,
        UpdatedAt = c.UpdatedAt
    };

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ClientResponseDto>>> GetClients([FromQuery] string? archiveFilter = "active")
    {
        IQueryable<Client> query = _context.Clients;

        query = archiveFilter switch
        {
            "archived" => query.Where(c => c.IsArchived),
            "all"      => query,
            _          => query.Where(c => !c.IsArchived)
        };

        var clients = await query
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        return Ok(clients.Select(MapToDto));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ClientResponseDto>> GetClient(int id)
    {
        var client = await _context.Clients.FindAsync(id);

        if (client is null)
            return NotFound();

        return Ok(MapToDto(client));
    }

    [HttpPost]
    public async Task<ActionResult<ClientResponseDto>> CreateClient(CreateClientDto dto)
    {
        var companyName = dto.CompanyName.Trim();
        var email = dto.Email?.Trim();

        if (!string.IsNullOrEmpty(email) &&
            await _context.Clients.AnyAsync(c => !c.IsArchived && c.Email != null && c.Email.ToLower() == email.ToLower()))
            return BadRequest(new { message = $"Er bestaat al een klant met e-mailadres '{email}'." });

        if (await _context.Clients.AnyAsync(c => !c.IsArchived && c.CompanyName.ToLower() == companyName.ToLower()))
            return BadRequest(new { message = $"Er bestaat al een klant met bedrijfsnaam '{companyName}'." });

        var client = new Client
        {
            CompanyName = companyName,
            ContactName = dto.ContactName,
            Email = email,
            Phone = dto.Phone,
            Website = dto.Website,
            Notes = dto.Notes,
            WebsitePrice = dto.WebsitePrice,
            MonthlyMaintenanceFee = dto.MonthlyMaintenanceFee,
            AmountPaid = dto.AmountPaid,
            ServerIpAddress = dto.ServerIpAddress,
            SshUsername = dto.SshUsername,
            HostingProvider = dto.HostingProvider,
            HostingPlan = dto.HostingPlan,
            HostingManagementUrl = dto.HostingManagementUrl,
            HostingRenewalDate = dto.HostingRenewalDate,
            DomainName = dto.DomainName,
            DomainRegistrar = dto.DomainRegistrar,
            DomainManagementUrl = dto.DomainManagementUrl,
            DomainRenewalDate = dto.DomainRenewalDate,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Clients.Add(client);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetClient), new { id = client.Id }, MapToDto(client));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateClient(int id, UpdateClientDto dto)
    {
        var client = await _context.Clients.FindAsync(id);

        if (client is null)
            return NotFound();

        client.CompanyName = dto.CompanyName;
        client.ContactName = dto.ContactName;
        client.Email = dto.Email;
        client.Phone = dto.Phone;
        client.Website = dto.Website;
        client.Notes = dto.Notes;
        client.WebsitePrice = dto.WebsitePrice;
        client.MonthlyMaintenanceFee = dto.MonthlyMaintenanceFee;
        client.AmountPaid = dto.AmountPaid;
        client.ServerIpAddress = dto.ServerIpAddress;
        client.SshUsername = dto.SshUsername;
        client.HostingProvider = dto.HostingProvider;
        client.HostingPlan = dto.HostingPlan;
        client.HostingManagementUrl = dto.HostingManagementUrl;
        client.HostingRenewalDate = dto.HostingRenewalDate;
        client.DomainName = dto.DomainName;
        client.DomainRegistrar = dto.DomainRegistrar;
        client.DomainManagementUrl = dto.DomainManagementUrl;
        client.DomainRenewalDate = dto.DomainRenewalDate;
        client.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("{id:int}/archive")]
    public async Task<IActionResult> ArchiveClient(int id, [FromBody] ArchiveDto dto)
    {
        var client = await _context.Clients.FindAsync(id);

        if (client is null)
            return NotFound();

        client.IsArchived = true;
        client.ArchivedAt = DateTime.UtcNow;
        client.ArchiveReason = dto.Reason;
        client.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("{id:int}/unarchive")]
    public async Task<IActionResult> UnarchiveClient(int id)
    {
        var client = await _context.Clients.FindAsync(id);

        if (client is null)
            return NotFound();

        client.IsArchived = false;
        client.ArchivedAt = null;
        client.ArchiveReason = null;
        client.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteClient(int id)
    {
        var client = await _context.Clients.FindAsync(id);

        if (client is null)
            return NotFound();

        _context.Clients.Remove(client);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
