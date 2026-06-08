using Microsoft.EntityFrameworkCore;
using VanMalderStudio.CRM.Api.Models;

namespace VanMalderStudio.CRM.Api.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Lead> Leads => Set<Lead>();
    public DbSet<LeadActivity> LeadActivities => Set<LeadActivity>();
    public DbSet<TaskItem> TaskItems => Set<TaskItem>();
}