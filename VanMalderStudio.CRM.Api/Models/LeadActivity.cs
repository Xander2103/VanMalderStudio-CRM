namespace VanMalderStudio.CRM.Api.Models;

public class LeadActivity
{
    public int Id { get; set; }

    public int LeadId { get; set; }
    public Lead Lead { get; set; } = null!;

    public string Type { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    public DateTime ActivityDate { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}