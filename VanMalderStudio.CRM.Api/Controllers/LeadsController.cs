using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VanMalderStudio.CRM.Api.Data;
using VanMalderStudio.CRM.Api.Models;
using VanMalderStudio.CRM.Api.DTOs;
using VanMalderStudio.CRM.Api.Enums;

namespace VanMalderStudio.CRM.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class LeadsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public LeadsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<LeadResponseDto>>> GetLeads([FromQuery] string? archiveFilter = "active")
    {
        IQueryable<Lead> query = _context.Leads.Include(l => l.Activities);

        query = archiveFilter switch
        {
            "won"      => query.Where(l => !l.IsArchived && l.Status == LeadStatus.Won),
            "archived" => query.Where(l => l.IsArchived),
            "all"      => query,
            _          => query.Where(l => !l.IsArchived && l.Status != LeadStatus.Won && l.Status != LeadStatus.Lost)
        };

        var leads = await query
            .OrderByDescending(l => l.CreatedAt)
            .Select(l => new LeadResponseDto
            {
                Id = l.Id,
                CompanyName = l.CompanyName,
                ContactName = l.ContactName,
                Email = l.Email,
                Phone = l.Phone,
                Website = l.Website,
                City = l.City,
                Source = l.Source,
                Status = l.Status,
                LastContactAt = l.LastContactAt,
                NextFollowUpAt = l.NextFollowUpAt,
                Notes = l.Notes,
                EstimatedValue = l.EstimatedValue,
                ProposalValue = l.ProposalValue,
                WinProbability = l.WinProbability,
                IsArchived = l.IsArchived,
                ArchivedAt = l.ArchivedAt,
                ArchiveReason = l.ArchiveReason,
                CreatedAt = l.CreatedAt,
                UpdatedAt = l.UpdatedAt,
                Activities = l.Activities
                    .OrderByDescending(a => a.ActivityDate)
                    .Select(a => new LeadActivityResponseDto
                    {
                        Id = a.Id,
                        LeadId = a.LeadId,
                        Type = a.Type,
                        Description = a.Description,
                        ActivityDate = a.ActivityDate,
                        CreatedAt = a.CreatedAt
                    })
                    .ToList()
            })
            .ToListAsync();

        return Ok(leads);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<LeadResponseDto>> GetLead(int id)
    {
        var lead = await _context.Leads
            .Include(l => l.Activities)
            .FirstOrDefaultAsync(l => l.Id == id);

        if (lead is null)
            return NotFound();

        return Ok(new LeadResponseDto
        {
            Id = lead.Id,
            CompanyName = lead.CompanyName,
            ContactName = lead.ContactName,
            Email = lead.Email,
            Phone = lead.Phone,
            Website = lead.Website,
            City = lead.City,
            Source = lead.Source,
            Status = lead.Status,
            LastContactAt = lead.LastContactAt,
            NextFollowUpAt = lead.NextFollowUpAt,
            Notes = lead.Notes,
            EstimatedValue = lead.EstimatedValue,
            ProposalValue = lead.ProposalValue,
            WinProbability = lead.WinProbability,
            IsArchived = lead.IsArchived,
            ArchivedAt = lead.ArchivedAt,
            ArchiveReason = lead.ArchiveReason,
            CreatedAt = lead.CreatedAt,
            UpdatedAt = lead.UpdatedAt,
            Activities = lead.Activities
                .OrderByDescending(a => a.ActivityDate)
                .Select(a => new LeadActivityResponseDto
                {
                    Id = a.Id,
                    LeadId = a.LeadId,
                    Type = a.Type,
                    Description = a.Description,
                    ActivityDate = a.ActivityDate,
                    CreatedAt = a.CreatedAt
                })
                .ToList()
        });
    }

    [HttpPost]
    public async Task<ActionResult<Lead>> CreateLead(CreateLeadDto createLeadDto)
    {
        var companyName = createLeadDto.CompanyName.Trim();
        var email = createLeadDto.Email?.Trim();

        if (!string.IsNullOrEmpty(email) &&
            await _context.Leads.AnyAsync(l => !l.IsArchived && l.Email != null && l.Email.ToLower() == email.ToLower()))
            return BadRequest(new { message = $"Er bestaat al een lead met e-mailadres '{email}'." });

        if (await _context.Leads.AnyAsync(l => !l.IsArchived && l.CompanyName.ToLower() == companyName.ToLower()))
            return BadRequest(new { message = $"Er bestaat al een lead met bedrijfsnaam '{companyName}'." });

        var lead = new Lead
        {
            CompanyName = companyName,
            ContactName = createLeadDto.ContactName,
            Email = email,
            Phone = createLeadDto.Phone,
            Website = createLeadDto.Website,
            City = createLeadDto.City,
            Source = createLeadDto.Source,
            Status = createLeadDto.Status,
            NextFollowUpAt = createLeadDto.NextFollowUpAt,
            Notes = createLeadDto.Notes,
            EstimatedValue = createLeadDto.EstimatedValue,
            ProposalValue = createLeadDto.ProposalValue,
            WinProbability = createLeadDto.WinProbability,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Leads.Add(lead);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetLead), new { id = lead.Id }, lead);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateLead(int id, UpdateLeadDto updateLeadDto)
    {
        var lead = await _context.Leads.FindAsync(id);

        if (lead is null)
            return NotFound();

        lead.CompanyName = updateLeadDto.CompanyName;
        lead.ContactName = updateLeadDto.ContactName;
        lead.Email = updateLeadDto.Email;
        lead.Phone = updateLeadDto.Phone;
        lead.Website = updateLeadDto.Website;
        lead.City = updateLeadDto.City;
        lead.Source = updateLeadDto.Source;
        lead.Status = updateLeadDto.Status;
        lead.LastContactAt = updateLeadDto.LastContactAt;
        lead.NextFollowUpAt = updateLeadDto.NextFollowUpAt;
        lead.Notes = updateLeadDto.Notes;
        lead.EstimatedValue = updateLeadDto.EstimatedValue;
        lead.ProposalValue = updateLeadDto.ProposalValue;
        lead.WinProbability = updateLeadDto.WinProbability;
        lead.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("{id:int}/archive")]
    public async Task<IActionResult> ArchiveLead(int id, [FromBody] ArchiveDto dto)
    {
        var lead = await _context.Leads.FindAsync(id);

        if (lead is null)
            return NotFound();

        lead.IsArchived = true;
        lead.ArchivedAt = DateTime.UtcNow;
        lead.ArchiveReason = dto.Reason;
        lead.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("{id:int}/unarchive")]
    public async Task<IActionResult> UnarchiveLead(int id)
    {
        var lead = await _context.Leads.FindAsync(id);

        if (lead is null)
            return NotFound();

        lead.IsArchived = false;
        lead.ArchivedAt = null;
        lead.ArchiveReason = null;
        lead.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{id:int}/convert-to-client")]
    public async Task<IActionResult> ConvertToClient(int id)
    {
        var lead = await _context.Leads.FindAsync(id);

        if (lead is null)
            return NotFound();

        if (lead.IsArchived)
            return BadRequest(new { message = "Een gearchiveerde lead kan niet worden omgezet naar klant." });

        var companyName = lead.CompanyName.Trim();
        var email = lead.Email?.Trim();

        if (!string.IsNullOrEmpty(email) &&
            await _context.Clients.AnyAsync(c => !c.IsArchived && c.Email != null && c.Email == email))
            return BadRequest(new { message = $"Er bestaat al een actieve klant met e-mailadres '{email}'." });

        if (await _context.Clients.AnyAsync(c => !c.IsArchived && c.CompanyName == companyName))
            return BadRequest(new { message = $"Er bestaat al een actieve klant met bedrijfsnaam '{companyName}'." });

        var notes = string.IsNullOrWhiteSpace(lead.Notes)
            ? $"Aangemaakt vanuit lead #{lead.Id}"
            : $"Aangemaakt vanuit lead #{lead.Id}\n\n{lead.Notes}";

        var client = new Client
        {
            CompanyName = companyName,
            ContactName = lead.ContactName,
            Email = email,
            Phone = lead.Phone,
            Website = lead.Website,
            Notes = notes,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Clients.Add(client);

        lead.Status = LeadStatus.Won;
        lead.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { clientId = client.Id });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteLead(int id)
    {
        var lead = await _context.Leads.FindAsync(id);

        if (lead is null)
            return NotFound();

        _context.Leads.Remove(lead);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{id:int}/activities")]
    public async Task<ActionResult> CreateLeadActivity(int id, CreateLeadActivityDto createActivityDto)
    {
        var lead = await _context.Leads.FindAsync(id);

        if (lead is null)
            return NotFound();

        var activity = new LeadActivity
        {
            LeadId = id,
            Type = createActivityDto.Type,
            Description = createActivityDto.Description,
            ActivityDate = createActivityDto.ActivityDate ?? DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };

        lead.LastContactAt = activity.ActivityDate;
        lead.UpdatedAt = DateTime.UtcNow;

        _context.LeadActivities.Add(activity);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            activity.Id,
            activity.LeadId,
            activity.Type,
            activity.Description,
            activity.ActivityDate,
            activity.CreatedAt
        });
    }
}
