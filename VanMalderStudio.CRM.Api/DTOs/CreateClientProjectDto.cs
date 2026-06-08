using VanMalderStudio.CRM.Api.Enums;

namespace VanMalderStudio.CRM.Api.DTOs;

public class CreateClientProjectDto
{
    public int ClientId { get; set; }
    public string ProjectName { get; set; } = string.Empty;
    public ClientProjectType ProjectType { get; set; } = ClientProjectType.Website;
    public ClientProjectStatus Status { get; set; } = ClientProjectStatus.Planned;
    public decimal? Price { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? Deadline { get; set; }
    public string? LiveUrl { get; set; }
    public string? PreviewUrl { get; set; }
    public string? GitHubRepoUrl { get; set; }
    public string? Notes { get; set; }
}
