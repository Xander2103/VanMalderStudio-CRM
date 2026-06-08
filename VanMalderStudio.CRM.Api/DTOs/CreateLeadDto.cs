using VanMalderStudio.CRM.Api.Enums;

namespace VanMalderStudio.CRM.Api.DTOs;

public class CreateLeadDto
{
    public string CompanyName { get; set; } = string.Empty;
    public string? ContactName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Website { get; set; }
    public string? City { get; set; }
    public string? Source { get; set; }
    public LeadStatus Status { get; set; } = LeadStatus.New;
    public DateTime? NextFollowUpAt { get; set; }
    public string? Notes { get; set; }
}