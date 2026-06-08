using VanMalderStudio.CRM.Api.Enums;

namespace VanMalderStudio.CRM.Api.DTOs;

public class CreateTaskDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime? DueDate { get; set; }
    public TaskPriority Priority { get; set; } = TaskPriority.Normal;
    public int? LeadId { get; set; }
}