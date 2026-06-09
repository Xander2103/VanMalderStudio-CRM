namespace VanMalderStudio.CRM.Api.DTOs;

public class DashboardActionsDto
{
    public List<DashboardTaskItemDto> OverdueTasks { get; set; } = [];
    public List<DashboardTaskItemDto> TodayTasks { get; set; } = [];
    public List<DashboardPaymentItemDto> OverduePayments { get; set; } = [];
    public List<DashboardRenewalItemDto> UpcomingRenewals { get; set; } = [];
    public List<DashboardLeadItemDto> WarmLeadsWithoutTask { get; set; } = [];
    public List<DashboardLeadItemDto> RecentlyWonLeads { get; set; } = [];
}

public class DashboardTaskItemDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime? DueDate { get; set; }
    public int Priority { get; set; }
    public int? LeadId { get; set; }
    public string? LeadCompanyName { get; set; }
}

public class DashboardPaymentItemDto
{
    public int ClientId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime DueDate { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }
}

public class DashboardRenewalItemDto
{
    public int ClientId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public DateTime RenewalDate { get; set; }
    public int DaysRemaining { get; set; }
}

public class DashboardLeadItemDto
{
    public int Id { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string? ContactName { get; set; }
    public int Status { get; set; }
    public DateTime UpdatedAt { get; set; }
}
