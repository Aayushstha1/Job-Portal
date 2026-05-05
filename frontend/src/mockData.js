export const featuredJobs = [
  {
    id: 1,
    title: "Backend Django Engineer",
    company: "Northstar Labs",
    location: "Kathmandu",
    type: "Full Time",
    mode: "Hybrid",
    salary: "NPR 120k - 170k",
    match: 92,
    skills: ["Python", "Django", "MySQL", "REST API"],
  },
  {
    id: 2,
    title: "React Frontend Developer",
    company: "Pixel Forge",
    location: "Remote",
    type: "Contract",
    mode: "Remote",
    salary: "NPR 90k - 130k",
    match: 87,
    skills: ["React", "JavaScript", "UI Design", "Testing"],
  },
  {
    id: 3,
    title: "Full Stack Product Builder",
    company: "Atlas Works",
    location: "Pokhara",
    type: "Full Time",
    mode: "On Site",
    salary: "NPR 150k - 210k",
    match: 79,
    skills: ["Django", "React", "Docker", "PostgreSQL"],
  },
];

export const seekerMetrics = [
  { label: "Applications Sent", value: "18" },
  { label: "Shortlisted", value: "6" },
  { label: "Interviews", value: "3" },
  { label: "Average Match", value: "84%" },
];

export const employerMetrics = [
  { label: "Active Jobs", value: "7" },
  { label: "Applicants", value: "146" },
  { label: "Avg Time to Hire", value: "11 Days" },
  { label: "Top Match", value: "96%" },
];

export const adminMetrics = [
  { label: "Pending Job Reviews", value: "12" },
  { label: "New Users This Week", value: "83" },
  { label: "Skills in Master List", value: "214" },
  { label: "Open Investigations", value: "2" },
];

export const applicationFlow = [
  {
    company: "Northstar Labs",
    role: "Backend Django Engineer",
    status: "Interview Scheduled",
    score: "92%",
  },
  {
    company: "Pixel Forge",
    role: "React Frontend Developer",
    status: "Shortlisted",
    score: "87%",
  },
  {
    company: "Atlas Works",
    role: "Full Stack Product Builder",
    status: "Applied",
    score: "79%",
  },
];

export const notifications = [
  {
    id: 1,
    title: "Interview scheduled",
    message: "Northstar Labs scheduled your interview for Friday at 10:00 AM.",
    tone: "accent",
  },
  {
    id: 2,
    title: "New matching job",
    message: "A new Django + MySQL role matches 91% of your profile.",
    tone: "highlight",
  },
  {
    id: 3,
    title: "Job pending review",
    message: "Pixel Forge posted a role that needs admin approval.",
    tone: "neutral",
  },
];

export const skillGaps = [
  {
    job: "Full Stack Product Builder",
    missing: ["Docker", "CI/CD"],
    suggestion: "Add container basics and deployment workflows to increase your score.",
  },
  {
    job: "Senior React Engineer",
    missing: ["TypeScript"],
    suggestion: "A short TypeScript project could move this job into your top tier.",
  },
];
