namespace VanMalderStudio.CRM.Api.DTOs;

public class UpdateAdminCredentialsDto
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string? NewEmail { get; set; }
    public string? NewPassword { get; set; }
    public string? ConfirmNewPassword { get; set; }
}
