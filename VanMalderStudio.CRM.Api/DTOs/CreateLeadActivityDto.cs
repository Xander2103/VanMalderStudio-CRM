namespace VanMalderStudio.CRM.Api.DTOs;

public class CreateLeadActivityDto
{
    public string Type { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime? ActivityDate { get; set; }
}