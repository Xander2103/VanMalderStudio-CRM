using VanMalderStudio.CRM.Api.Enums;

namespace VanMalderStudio.CRM.Api.Models;

public class TaskItem
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }

    public DateTime? DueDate { get; set; }

    public TaskPriority Priority { get; set; } = TaskPriority.Normal;
    public Enums.TaskStatus Status { get; set; } = Enums.TaskStatus.Open;

    public int? LeadId { get; set; }
    public Lead? Lead { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}