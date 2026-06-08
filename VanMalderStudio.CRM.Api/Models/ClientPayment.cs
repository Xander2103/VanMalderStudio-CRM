using System.ComponentModel.DataAnnotations.Schema;
using VanMalderStudio.CRM.Api.Enums;

namespace VanMalderStudio.CRM.Api.Models;

public class ClientPayment
{
    public int Id { get; set; }

    public int ClientId { get; set; }
    public Client Client { get; set; } = null!;

    public int Month { get; set; }
    public int Year { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    public ClientPaymentStatus Status { get; set; } = ClientPaymentStatus.Pending;

    public DateTime DueDate { get; set; }
    public DateTime? PaidAt { get; set; }
    public DateTime? ReminderSentAt { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
