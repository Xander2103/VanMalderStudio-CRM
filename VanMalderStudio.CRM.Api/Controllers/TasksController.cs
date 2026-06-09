using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VanMalderStudio.CRM.Api.Data;
using VanMalderStudio.CRM.Api.DTOs;
using VanMalderStudio.CRM.Api.Models;

namespace VanMalderStudio.CRM.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TasksController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskResponseDto>>> GetTasks()
    {
        var tasks = await _context.TaskItems
            .Include(task => task.Lead)
            .OrderBy(task => task.Status)
            .ThenBy(task => task.DueDate)
            .Select(task => new TaskResponseDto
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                DueDate = task.DueDate,
                Priority = task.Priority,
                Status = task.Status,
                LeadId = task.LeadId,
                LeadCompanyName = task.Lead != null ? task.Lead.CompanyName : null,
                CreatedAt = task.CreatedAt,
                UpdatedAt = task.UpdatedAt
            })
            .ToListAsync();

        return Ok(tasks);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TaskResponseDto>> GetTask(int id)
    {
        var task = await _context.TaskItems
            .Include(task => task.Lead)
            .FirstOrDefaultAsync(task => task.Id == id);

        if (task is null)
        {
            return NotFound();
        }

        var response = new TaskResponseDto
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            DueDate = task.DueDate,
            Priority = task.Priority,
            Status = task.Status,
            LeadId = task.LeadId,
            LeadCompanyName = task.Lead?.CompanyName,
            CreatedAt = task.CreatedAt,
            UpdatedAt = task.UpdatedAt
        };

        return Ok(response);
    }

    [HttpGet("due")]
    public async Task<ActionResult<IEnumerable<TaskResponseDto>>> GetDueTasks()
    {
        var now = DateTime.UtcNow;

        var tasks = await _context.TaskItems
            .Include(task => task.Lead)
            .Where(task =>
                task.DueDate != null &&
                task.DueDate <= now &&
                task.Status != Enums.TaskStatus.Done &&
                task.Status != Enums.TaskStatus.Cancelled)
            .OrderBy(task => task.DueDate)
            .Select(task => new TaskResponseDto
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                DueDate = task.DueDate,
                Priority = task.Priority,
                Status = task.Status,
                LeadId = task.LeadId,
                LeadCompanyName = task.Lead != null ? task.Lead.CompanyName : null,
                CreatedAt = task.CreatedAt,
                UpdatedAt = task.UpdatedAt
            })
            .ToListAsync();

        return Ok(tasks);
    }

    [HttpPost]
    public async Task<ActionResult<TaskResponseDto>> CreateTask(CreateTaskDto createTaskDto)
    {
        if (createTaskDto.LeadId is not null)
        {
            var leadExists = await _context.Leads.AnyAsync(lead => lead.Id == createTaskDto.LeadId);

            if (!leadExists)
            {
                return BadRequest("The selected lead does not exist.");
            }
        }

        var task = new TaskItem
        {
            Title = createTaskDto.Title,
            Description = createTaskDto.Description,
            DueDate = createTaskDto.DueDate,
            Priority = createTaskDto.Priority,
            Status = Enums.TaskStatus.Open,
            LeadId = createTaskDto.LeadId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.TaskItems.Add(task);
        await _context.SaveChangesAsync();

        var response = new TaskResponseDto
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            DueDate = task.DueDate,
            Priority = task.Priority,
            Status = task.Status,
            LeadId = task.LeadId,
            CreatedAt = task.CreatedAt,
            UpdatedAt = task.UpdatedAt
        };

        return CreatedAtAction(nameof(GetTask), new { id = task.Id }, response);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateTask(int id, UpdateTaskDto updateTaskDto)
    {
        var task = await _context.TaskItems.FindAsync(id);

        if (task is null)
        {
            return NotFound();
        }

        if (updateTaskDto.LeadId is not null)
        {
            var leadExists = await _context.Leads.AnyAsync(lead => lead.Id == updateTaskDto.LeadId);

            if (!leadExists)
            {
                return BadRequest("The selected lead does not exist.");
            }
        }

        task.Title = updateTaskDto.Title;
        task.Description = updateTaskDto.Description;
        task.DueDate = updateTaskDto.DueDate;
        task.Priority = updateTaskDto.Priority;
        task.Status = updateTaskDto.Status;
        task.LeadId = updateTaskDto.LeadId;
        task.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteTask(int id)
    {
        var task = await _context.TaskItems.FindAsync(id);

        if (task is null)
        {
            return NotFound();
        }

        _context.TaskItems.Remove(task);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}