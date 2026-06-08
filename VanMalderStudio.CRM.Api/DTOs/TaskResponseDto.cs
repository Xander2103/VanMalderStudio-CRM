using VanMalderStudio.CRM.Api.Enums;

namespace VanMalderStudio.CRM.Api.DTOs;

public class TaskResponseDto
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }

    public DateTime? DueDate { get; set; }

    public TaskPriority Priority { get; set; }
    public Enums.TaskStatus Status { get; set; }

    public int? LeadId { get; set; }
    public string? LeadCompanyName { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}