using VanMalderStudio.CRM.Api.Enums;

namespace VanMalderStudio.CRM.Api.DTOs;

public class CreateClientPaymentDto
{
    public int ClientId { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }
    public decimal Amount { get; set; }
    public ClientPaymentStatus Status { get; set; } = ClientPaymentStatus.Pending;
    public DateTime DueDate { get; set; }
    public string? Notes { get; set; }
}
