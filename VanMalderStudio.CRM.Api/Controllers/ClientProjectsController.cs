using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VanMalderStudio.CRM.Api.Data;
using VanMalderStudio.CRM.Api.Models;
using VanMalderStudio.CRM.Api.DTOs;

namespace VanMalderStudio.CRM.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ClientProjectsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ClientProjectsController(ApplicationDbContext context)
    {
        _context = context;
    }

    private static ClientProjectResponseDto MapToDto(ClientProject p) => new()
    {
        Id = p.Id,
        ClientId = p.ClientId,
        ClientCompanyName = p.Client?.CompanyName ?? string.Empty,
        ProjectName = p.ProjectName,
        ProjectType = p.ProjectType,
        Status = p.Status,
        Price = p.Price,
        StartDate = p.StartDate,
        Deadline = p.Deadline,
        LiveUrl = p.LiveUrl,
        PreviewUrl = p.PreviewUrl,
        GitHubRepoUrl = p.GitHubRepoUrl,
        Notes = p.Notes,
        CreatedAt = p.CreatedAt,
        UpdatedAt = p.UpdatedAt
    };

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ClientProjectResponseDto>>> GetProjects()
    {
        var projects = await _context.ClientProjects
            .Include(p => p.Client)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return Ok(projects.Select(MapToDto));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ClientProjectResponseDto>> GetProject(int id)
    {
        var project = await _context.ClientProjects
            .Include(p => p.Client)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project is null)
        {
            return NotFound();
        }

        return Ok(MapToDto(project));
    }

    [HttpGet("client/{clientId:int}")]
    public async Task<ActionResult<IEnumerable<ClientProjectResponseDto>>> GetProjectsByClient(int clientId)
    {
        var projects = await _context.ClientProjects
            .Include(p => p.Client)
            .Where(p => p.ClientId == clientId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return Ok(projects.Select(MapToDto));
    }

    [HttpPost]
    public async Task<ActionResult<ClientProjectResponseDto>> CreateProject(CreateClientProjectDto dto)
    {
        var clientExists = await _context.Clients.AnyAsync(c => c.Id == dto.ClientId);
        if (!clientExists)
        {
            return BadRequest("Client not found.");
        }

        var project = new ClientProject
        {
            ClientId = dto.ClientId,
            ProjectName = dto.ProjectName,
            ProjectType = dto.ProjectType,
            Status = dto.Status,
            Price = dto.Price,
            StartDate = dto.StartDate,
            Deadline = dto.Deadline,
            LiveUrl = dto.LiveUrl,
            PreviewUrl = dto.PreviewUrl,
            GitHubRepoUrl = dto.GitHubRepoUrl,
            Notes = dto.Notes,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.ClientProjects.Add(project);
        await _context.SaveChangesAsync();

        await _context.Entry(project).Reference(p => p.Client).LoadAsync();

        return CreatedAtAction(nameof(GetProject), new { id = project.Id }, MapToDto(project));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateProject(int id, UpdateClientProjectDto dto)
    {
        var project = await _context.ClientProjects.FindAsync(id);

        if (project is null)
        {
            return NotFound();
        }

        project.ProjectName = dto.ProjectName;
        project.ProjectType = dto.ProjectType;
        project.Status = dto.Status;
        project.Price = dto.Price;
        project.StartDate = dto.StartDate;
        project.Deadline = dto.Deadline;
        project.LiveUrl = dto.LiveUrl;
        project.PreviewUrl = dto.PreviewUrl;
        project.GitHubRepoUrl = dto.GitHubRepoUrl;
        project.Notes = dto.Notes;
        project.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteProject(int id)
    {
        var project = await _context.ClientProjects.FindAsync(id);

        if (project is null)
        {
            return NotFound();
        }

        _context.ClientProjects.Remove(project);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
