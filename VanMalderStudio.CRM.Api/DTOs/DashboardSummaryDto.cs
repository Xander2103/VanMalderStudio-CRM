namespace VanMalderStudio.CRM.Api.DTOs;

public class DashboardSummaryDto
{
    public int TotalLeads { get; set; }

    public int NewLeads { get; set; }
    public int CalledNoAnswerLeads { get; set; }
    public int InterestedLeads { get; set; }
    public int NotInterestedLeads { get; set; }
    public int ProposalRequestedLeads { get; set; }
    public int ProposalSentLeads { get; set; }
    public int WonLeads { get; set; }
    public int LostLeads { get; set; }

    public int TotalTasks { get; set; }
    public int OpenTasks { get; set; }
    public int DueTasks { get; set; }
    public int UrgentTasks { get; set; }
}