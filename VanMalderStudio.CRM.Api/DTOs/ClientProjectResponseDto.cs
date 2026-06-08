using VanMalderStudio.CRM.Api.Enums;

namespace VanMalderStudio.CRM.Api.DTOs;

public class ClientProjectResponseDto
{
    public int Id { get; set; }
    public int ClientId { get; set; }
    public string ClientCompanyName { get; set; } = string.Empty;
    public string ProjectName { get; set; } = string.Empty;
    public ClientProjectType ProjectType { get; set; }
    public ClientProjectStatus Status { get; set; }
    public decimal? Price { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? Deadline { get; set; }
    public string? LiveUrl { get; set; }
    public string? PreviewUrl { get; set; }
    public string? GitHubRepoUrl { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
