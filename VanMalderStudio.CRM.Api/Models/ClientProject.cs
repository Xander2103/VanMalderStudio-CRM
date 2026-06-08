using System.ComponentModel.DataAnnotations.Schema;
using VanMalderStudio.CRM.Api.Enums;

namespace VanMalderStudio.CRM.Api.Models;

public class ClientProject
{
    public int Id { get; set; }

    public int ClientId { get; set; }
    public Client Client { get; set; } = null!;

    public string ProjectName { get; set; } = string.Empty;
    public ClientProjectType ProjectType { get; set; } = ClientProjectType.Website;
    public ClientProjectStatus Status { get; set; } = ClientProjectStatus.Planned;

    [Column(TypeName = "decimal(18,2)")]
    public decimal? Price { get; set; }

    public DateTime? StartDate { get; set; }
    public DateTime? Deadline { get; set; }

    public string? LiveUrl { get; set; }
    public string? PreviewUrl { get; set; }
    public string? GitHubRepoUrl { get; set; }
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
