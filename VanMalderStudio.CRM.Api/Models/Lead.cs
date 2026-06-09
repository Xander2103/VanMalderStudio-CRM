using System.ComponentModel.DataAnnotations.Schema;
using VanMalderStudio.CRM.Api.Enums;

namespace VanMalderStudio.CRM.Api.Models;

public class Lead
{
    public int Id { get; set; }

    public string CompanyName { get; set; } = string.Empty;
    public string? ContactName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Website { get; set; }
    public string? City { get; set; }
    public string? Source { get; set; }

    public LeadStatus Status { get; set; } = LeadStatus.New;

    public DateTime? LastContactAt { get; set; }
    public DateTime? NextFollowUpAt { get; set; }

    public string? Notes { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? EstimatedValue { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? ProposalValue { get; set; }

    public int? WinProbability { get; set; }

    public bool IsArchived { get; set; } = false;
    public DateTime? ArchivedAt { get; set; }
    public string? ArchiveReason { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<LeadActivity> Activities { get; set; } = new List<LeadActivity>();

    public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
}