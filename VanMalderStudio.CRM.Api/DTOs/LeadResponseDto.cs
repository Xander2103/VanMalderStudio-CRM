using VanMalderStudio.CRM.Api.Enums;

namespace VanMalderStudio.CRM.Api.DTOs;

public class LeadResponseDto
{
    public int Id { get; set; }

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

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public List<LeadActivityResponseDto> Activities { get; set; } = new();
}