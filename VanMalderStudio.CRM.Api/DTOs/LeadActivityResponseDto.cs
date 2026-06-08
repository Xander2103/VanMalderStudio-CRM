namespace VanMalderStudio.CRM.Api.DTOs;

public class LeadActivityResponseDto
{
    public int Id { get; set; }
    public int LeadId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime ActivityDate { get; set; }
    public DateTime CreatedAt { get; set; }
}