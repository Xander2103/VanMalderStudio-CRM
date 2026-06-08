namespace VanMalderStudio.CRM.Api.DTOs;

public class CreateClientDto
{
    public string CompanyName { get; set; } = string.Empty;
    public string? ContactName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Website { get; set; }
    public string? Notes { get; set; }

    // Business
    public decimal? WebsitePrice { get; set; }
    public decimal? MonthlyMaintenanceFee { get; set; }
    public decimal? AmountPaid { get; set; }

    // Hosting / Server
    public string? ServerIpAddress { get; set; }
    public string? SshUsername { get; set; }
    public string? HostingProvider { get; set; }
    public string? HostingPlan { get; set; }
    public string? HostingManagementUrl { get; set; }
    public DateTime? HostingRenewalDate { get; set; }

    // Domain
    public string? DomainName { get; set; }
    public string? DomainRegistrar { get; set; }
    public string? DomainManagementUrl { get; set; }
    public DateTime? DomainRenewalDate { get; set; }
}
