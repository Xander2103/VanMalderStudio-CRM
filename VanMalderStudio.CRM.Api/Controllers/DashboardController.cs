using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VanMalderStudio.CRM.Api.Data;
using VanMalderStudio.CRM.Api.DTOs;
using VanMalderStudio.CRM.Api.Enums;

namespace VanMalderStudio.CRM.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DashboardController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("summary")]
    public async Task<ActionResult<DashboardSummaryDto>> GetSummary()
    {
        var now = DateTime.UtcNow;

        var summary = new DashboardSummaryDto
        {
            TotalLeads = await _context.Leads.CountAsync(),

            NewLeads = await _context.Leads.CountAsync(lead => lead.Status == LeadStatus.New),
            CalledNoAnswerLeads = await _context.Leads.CountAsync(lead => lead.Status == LeadStatus.CalledNoAnswer),
            InterestedLeads = await _context.Leads.CountAsync(lead => lead.Status == LeadStatus.Interested),
            NotInterestedLeads = await _context.Leads.CountAsync(lead => lead.Status == LeadStatus.NotInterested),
            ProposalRequestedLeads = await _context.Leads.CountAsync(lead => lead.Status == LeadStatus.ProposalRequested),
            ProposalSentLeads = await _context.Leads.CountAsync(lead => lead.Status == LeadStatus.ProposalSent),
            WonLeads = await _context.Leads.CountAsync(lead => lead.Status == LeadStatus.Won),
            LostLeads = await _context.Leads.CountAsync(lead => lead.Status == LeadStatus.Lost),

            TotalTasks = await _context.TaskItems.CountAsync(),

            OpenTasks = await _context.TaskItems.CountAsync(task =>
                task.Status == Enums.TaskStatus.Open ||
                task.Status == Enums.TaskStatus.InProgress),

            DueTasks = await _context.TaskItems.CountAsync(task =>
                task.DueDate != null &&
                task.DueDate <= now &&
                task.Status != Enums.TaskStatus.Done &&
                task.Status != Enums.TaskStatus.Cancelled),

            UrgentTasks = await _context.TaskItems.CountAsync(task =>
                task.Priority == TaskPriority.Urgent &&
                task.Status != Enums.TaskStatus.Done &&
                task.Status != Enums.TaskStatus.Cancelled)
        };

        return Ok(summary);
    }
}