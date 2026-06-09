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
public class LeadsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public LeadsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<LeadResponseDto>>> GetLeads()
    {
        var leads = await _context.Leads
            .Include(lead => lead.Activities)
            .OrderByDescending(lead => lead.CreatedAt)
            .Select(lead => new LeadResponseDto
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
                CreatedAt = lead.CreatedAt,
                UpdatedAt = lead.UpdatedAt,
                Activities = lead.Activities
                    .OrderByDescending(activity => activity.ActivityDate)
                    .Select(activity => new LeadActivityResponseDto
                    {
                        Id = activity.Id,
                        LeadId = activity.LeadId,
                        Type = activity.Type,
                        Description = activity.Description,
                        ActivityDate = activity.ActivityDate,
                        CreatedAt = activity.CreatedAt
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
            .Include(lead => lead.Activities)
            .FirstOrDefaultAsync(lead => lead.Id == id);

        if (lead is null)
        {
            return NotFound();
        }

        var leadResponse = new LeadResponseDto
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
            CreatedAt = lead.CreatedAt,
            UpdatedAt = lead.UpdatedAt,
            Activities = lead.Activities
                .OrderByDescending(activity => activity.ActivityDate)
                .Select(activity => new LeadActivityResponseDto
                {
                    Id = activity.Id,
                    LeadId = activity.LeadId,
                    Type = activity.Type,
                    Description = activity.Description,
                    ActivityDate = activity.ActivityDate,
                    CreatedAt = activity.CreatedAt
                })
                .ToList()
        };

        return Ok(leadResponse);
    }

    [HttpPost]
    public async Task<ActionResult<Lead>> CreateLead(CreateLeadDto createLeadDto)
    {
        var lead = new Lead
        {
            CompanyName = createLeadDto.CompanyName,
            ContactName = createLeadDto.ContactName,
            Email = createLeadDto.Email,
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
        {
            return NotFound();
        }

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
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteLead(int id)
    {
        var lead = await _context.Leads.FindAsync(id);

        if (lead is null)
        {
            return NotFound();
        }

        _context.Leads.Remove(lead);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{id:int}/activities")]
    public async Task<ActionResult> CreateLeadActivity(int id, CreateLeadActivityDto createActivityDto)
    {
        var lead = await _context.Leads.FindAsync(id);

        if (lead is null)
        {
            return NotFound();
        }

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