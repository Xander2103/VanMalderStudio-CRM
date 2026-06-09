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

    [HttpGet("actions")]
    public async Task<ActionResult<DashboardActionsDto>> GetActions()
    {
        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);
        var renewalCutoff = today.AddDays(31); // exclusive upper bound for 30-day window

        var overdueTasks = await _context.TaskItems
            .Include(t => t.Lead)
            .Where(t => t.DueDate != null && t.DueDate < today &&
                        (t.Status == Enums.TaskStatus.Open || t.Status == Enums.TaskStatus.InProgress))
            .OrderBy(t => t.DueDate)
            .Take(10)
            .Select(t => new DashboardTaskItemDto
            {
                Id = t.Id,
                Title = t.Title,
                DueDate = t.DueDate,
                Priority = (int)t.Priority,
                LeadId = t.LeadId,
                LeadCompanyName = t.Lead != null ? t.Lead.CompanyName : null
            })
            .ToListAsync();

        var todayTasks = await _context.TaskItems
            .Include(t => t.Lead)
            .Where(t => t.DueDate != null && t.DueDate >= today && t.DueDate < tomorrow &&
                        (t.Status == Enums.TaskStatus.Open || t.Status == Enums.TaskStatus.InProgress))
            .OrderBy(t => t.Priority)
            .Take(10)
            .Select(t => new DashboardTaskItemDto
            {
                Id = t.Id,
                Title = t.Title,
                DueDate = t.DueDate,
                Priority = (int)t.Priority,
                LeadId = t.LeadId,
                LeadCompanyName = t.Lead != null ? t.Lead.CompanyName : null
            })
            .ToListAsync();

        var overduePayments = await _context.ClientPayments
            .Include(p => p.Client)
            .Where(p => p.DueDate < today &&
                        (p.Status == ClientPaymentStatus.Pending || p.Status == ClientPaymentStatus.Overdue) &&
                        !p.Client.IsArchived)
            .OrderBy(p => p.DueDate)
            .Take(10)
            .Select(p => new DashboardPaymentItemDto
            {
                ClientId = p.ClientId,
                CompanyName = p.Client.CompanyName,
                Amount = p.Amount,
                DueDate = p.DueDate,
                Month = p.Month,
                Year = p.Year
            })
            .ToListAsync();

        var renewalClients = await _context.Clients
            .Where(c => !c.IsArchived &&
                        ((c.HostingRenewalDate != null && c.HostingRenewalDate >= today && c.HostingRenewalDate < renewalCutoff) ||
                         (c.DomainRenewalDate != null && c.DomainRenewalDate >= today && c.DomainRenewalDate < renewalCutoff)))
            .ToListAsync();

        var upcomingRenewals = new List<DashboardRenewalItemDto>();
        foreach (var client in renewalClients)
        {
            if (client.HostingRenewalDate.HasValue)
            {
                var d = client.HostingRenewalDate.Value.Date;
                if (d >= today && d < renewalCutoff)
                    upcomingRenewals.Add(new DashboardRenewalItemDto
                    {
                        ClientId = client.Id,
                        CompanyName = client.CompanyName,
                        Type = "Hosting",
                        Label = client.HostingProvider ?? "Hosting",
                        RenewalDate = client.HostingRenewalDate.Value,
                        DaysRemaining = (int)(d - today).TotalDays
                    });
            }
            if (client.DomainRenewalDate.HasValue)
            {
                var d = client.DomainRenewalDate.Value.Date;
                if (d >= today && d < renewalCutoff)
                    upcomingRenewals.Add(new DashboardRenewalItemDto
                    {
                        ClientId = client.Id,
                        CompanyName = client.CompanyName,
                        Type = "Domein",
                        Label = client.DomainName ?? "Domein",
                        RenewalDate = client.DomainRenewalDate.Value,
                        DaysRemaining = (int)(d - today).TotalDays
                    });
            }
        }
        upcomingRenewals = upcomingRenewals.OrderBy(r => r.RenewalDate).Take(8).ToList();

        var warmLeadsWithoutTask = await _context.Leads
            .Where(l => !l.IsArchived &&
                        (l.Status == LeadStatus.Interested ||
                         l.Status == LeadStatus.ProposalRequested ||
                         l.Status == LeadStatus.ProposalSent) &&
                        !_context.TaskItems.Any(t => t.LeadId == l.Id &&
                            (t.Status == Enums.TaskStatus.Open || t.Status == Enums.TaskStatus.InProgress)))
            .OrderByDescending(l => l.UpdatedAt)
            .Take(8)
            .Select(l => new DashboardLeadItemDto
            {
                Id = l.Id,
                CompanyName = l.CompanyName,
                ContactName = l.ContactName,
                Status = (int)l.Status,
                UpdatedAt = l.UpdatedAt
            })
            .ToListAsync();

        var recentlyWonLeads = await _context.Leads
            .Where(l => !l.IsArchived && l.Status == LeadStatus.Won)
            .OrderByDescending(l => l.UpdatedAt)
            .Take(5)
            .Select(l => new DashboardLeadItemDto
            {
                Id = l.Id,
                CompanyName = l.CompanyName,
                ContactName = l.ContactName,
                Status = (int)l.Status,
                UpdatedAt = l.UpdatedAt
            })
            .ToListAsync();

        return Ok(new DashboardActionsDto
        {
            OverdueTasks = overdueTasks,
            TodayTasks = todayTasks,
            OverduePayments = overduePayments,
            UpcomingRenewals = upcomingRenewals,
            WarmLeadsWithoutTask = warmLeadsWithoutTask,
            RecentlyWonLeads = recentlyWonLeads
        });
    }
}