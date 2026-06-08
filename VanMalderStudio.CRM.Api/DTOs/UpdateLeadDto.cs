using VanMalderStudio.CRM.Api.Enums;

namespace VanMalderStudio.CRM.Api.DTOs;

public class UpdateLeadDto
{
    public string CompanyName { get; set; } = string.Empty;
    public string? ContactName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Website { get; set; }
    public string? City { get; set; }
    public string? Source { get; set; }
    public LeadStatus Status { get; set; }
    public DateTime? LastContactAt { get; set; }
    public DateTime? NextFollowUpAt { get; set; }
    public string? Notes { get; set; }
    public decimal? EstimatedValue { get; set; }
    public decimal? ProposalValue { get; set; }
    public int? WinProbability { get; set; }
}