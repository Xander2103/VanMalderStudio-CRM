namespace VanMalderStudio.CRM.Api.DTOs;

public class GenerateMonthResponseDto
{
    public int CreatedCount { get; set; }
    public int SkippedCount { get; set; }
    public int Year { get; set; }
    public int Month { get; set; }
}
