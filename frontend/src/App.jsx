import React, { useEffect, useState } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import {
  adminMetrics,
  applicationFlow,
  employerMetrics,
  notifications,
  seekerMetrics,
  skillGaps,
} from "./mockData";
import { API_BASE_URL, apiRequest } from "./api/client";

const currencyFormatter = new Intl.NumberFormat("en-NP", {
  style: "currency",
  currency: "NPR",
  maximumFractionDigits: 0,
});

const navItems = [
  { to: "/", label: "Overview" },
  { to: "/jobs", label: "Jobs" },
  { to: "/register", label: "Register" },
  { to: "/seeker", label: "Seeker" },
  { to: "/employer", label: "Employer" },
  { to: "/admin", label: "Admin" },
  { to: "/applications", label: "Applications" },
  { to: "/notifications", label: "Notifications" },
];

const emptyJobFilters = {
  title: "",
  location: "",
  job_type: "",
  work_mode: "",
};

const registrationRoleContent = {
  job_seeker: {
    label: "Job Seeker",
    buttonLabel: "Continue as seeker",
    eyebrow: "Candidate onboarding",
    headline: "Build a profile that makes strong employers respond faster.",
    description:
      "Upload your background, add your skills, and get a cleaner application flow with visible progress at every step.",
    dashboardTitle: "What you unlock after signup",
    outcomes: [
      "Live job recommendations with match visibility.",
      "A single place to track applied, shortlisted, and interview stages.",
      "Skill gap guidance that tells you what to improve next.",
    ],
    setup: [
      "Add resume, experience, education, and preferred locations.",
      "Choose skills from the shared taxonomy managed by admins.",
      "Start applying once approved jobs are live.",
    ],
    fields: [
      { label: "Full name", placeholder: "Aayush Sharma" },
      { label: "Email", placeholder: "you@example.com", type: "email" },
      { label: "Desired role", placeholder: "Backend Developer" },
      { label: "Preferred location", placeholder: "Kathmandu or Remote" },
      { label: "Experience", placeholder: "2 years" },
      {
        label: "Profile summary",
        placeholder: "Share the kind of work you want to do and the tools you know well.",
        type: "textarea",
      },
    ],
  },
  employer: {
    label: "Employer",
    buttonLabel: "Continue as employer",
    eyebrow: "Company onboarding",
    headline: "Set up your hiring workspace without drowning in spreadsheets.",
    description:
      "Create a company profile, publish roles with required skills, and move applicants through a clear funnel.",
    dashboardTitle: "What you unlock after signup",
    outcomes: [
      "Job posting flows built around skills, salary, and work mode.",
      "Applicant views ranked by match score when seeker profiles are ready.",
      "Interview scheduling and status updates in one place.",
    ],
    setup: [
      "Add brand, industry, website, and company location.",
      "Create openings with clear required and nice-to-have skills.",
      "Send candidates through shortlist, interview, hire, or reject states.",
    ],
    fields: [
      { label: "Company name", placeholder: "Northstar Labs" },
      { label: "Work email", placeholder: "hiring@company.com", type: "email" },
      { label: "Industry", placeholder: "Software Product" },
      { label: "Company location", placeholder: "Lalitpur" },
      { label: "Website", placeholder: "https://company.com", type: "url" },
      {
        label: "Hiring goals",
        placeholder: "Tell candidates what roles you hire for and what your team values.",
        type: "textarea",
      },
    ],
  },
  admin: {
    label: "Admin",
    buttonLabel: "Request admin access",
    eyebrow: "Platform operations",
    headline: "Moderate trust, quality, and system consistency from one control layer.",
    description:
      "Approve jobs before they go public, maintain the platform skill list, and keep activity healthy across the portal.",
    dashboardTitle: "What you unlock after signup",
    outcomes: [
      "A moderation queue for jobs and account activity.",
      "Skill taxonomy control for cleaner matching across the platform.",
      "Visibility into trust, adoption, and operational health.",
    ],
    setup: [
      "Review new jobs before they appear in public listings.",
      "Manage platform-wide skills and suspicious behavior.",
      "Keep employer and seeker experiences consistent and reliable.",
    ],
    fields: [
      { label: "Full name", placeholder: "Platform Admin" },
      { label: "Work email", placeholder: "ops@elevatehire.com", type: "email" },
      { label: "Team", placeholder: "Operations" },
      { label: "Access level", placeholder: "Moderation + Taxonomy" },
      {
        label: "Reason for access",
        placeholder: "Describe the operational work this admin account should manage.",
        type: "textarea",
      },
    ],
  },
};

const moderationQueue = [
  {
    title: "New job pending approval",
    meta: "Pixel Forge | React Frontend Developer",
    status: "Needs review",
  },
  {
    title: "Skill taxonomy request",
    meta: "Suggested new skill: Prompt Engineering",
    status: "Pending validation",
  },
  {
    title: "Employer verification check",
    meta: "Atlas Works | Company profile missing website proof",
    status: "Follow up",
  },
];

const platformPrinciples = [
  "Clear next actions on every screen so people never guess what to do next.",
  "Readable hierarchy that separates overview, actions, and details cleanly.",
  "A design direction that feels like a real product, not a classroom scaffold.",
];

function App() {
  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="site-header">
        <NavLink className="brand-lockup" to="/">
          <span className="brand-mark">EH</span>
          <span className="brand-text">
            <strong>ElevateHire</strong>
            <small>Skill-first hiring portal</small>
          </span>
        </NavLink>

        <nav className="site-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <NavItem key={item.to} to={item.to}>
              {item.label}
            </NavItem>
          ))}
        </nav>

        <div className="header-tools">
          <span className="header-indicator">
            <span className="live-dot" />
            API connected
          </span>
          <NavLink className="primary-button compact" to="/register">
            Get started
          </NavLink>
        </div>
      </header>

      <main className="site-main">
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/seeker" element={<SeekerPage />} />
          <Route path="/employer" element={<EmployerPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Routes>
      </main>
    </div>
  );
}

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        isActive ? "nav-item nav-item-active" : "nav-item"
      }
    >
      {children}
    </NavLink>
  );
}

function OverviewPage() {
  return (
    <div className="page-stack">
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">Job portal redesign</span>
          <h1>Make hiring feel fast, clear, and actually pleasant to use.</h1>
          <p>
            ElevateHire brings job seekers, employers, and admins into one flow with
            cleaner navigation, stronger visibility, and a live Django-backed job
            board ready to grow into the full product.
          </p>

          <div className="hero-actions">
            <NavLink className="primary-button" to="/jobs">
              Explore live jobs
            </NavLink>
            <NavLink className="secondary-button" to="/register">
              Create an account
            </NavLink>
          </div>

          <div className="hero-proof">
            <span className="proof-chip">Live API</span>
            <span className="proof-text">{API_BASE_URL}</span>
          </div>
        </div>

        <div className="hero-aside">
          <SurfaceCard className="surface-card dark-surface">
            <span className="card-label">Product snapshot</span>
            <h3>One workspace, three role-based experiences.</h3>
            <p className="muted-copy">
              Candidates track momentum, employers manage hiring, and admins keep
              moderation and quality under control.
            </p>
            <div className="mini-stat-grid">
              <MiniStat label={seekerMetrics[3].label} value={seekerMetrics[3].value} />
              <MiniStat label={employerMetrics[1].label} value={employerMetrics[1].value} />
              <MiniStat label={adminMetrics[0].label} value={adminMetrics[0].value} />
              <MiniStat label="Database" value="MariaDB" />
            </div>
          </SurfaceCard>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard label="Frontend style" value="Cleaner product shell" detail="Top navigation, calmer spacing, stronger hierarchy." />
        <StatCard label="Live data" value="Jobs API wired" detail="The jobs page now fetches real listings from Django." />
        <StatCard label="Backend status" value="Database connected" detail="Django and your XAMPP MariaDB connection are working." />
        <StatCard label="Design goal" value="User friendly first" detail="Less clutter, better readability, better flow." />
      </section>

      <PageHeader
        eyebrow="Role-based journeys"
        title="Each user enters the platform with a clearer next step."
        text="The UI now prioritizes actions, not just sections, so each role immediately understands what matters most."
      />

      <section className="role-grid">
        {Object.entries(registrationRoleContent).map(([key, role]) => (
          <SurfaceCard key={key} className="surface-card">
            <span className="card-label">{role.eyebrow}</span>
            <h3>{role.label}</h3>
            <p className="muted-copy">{role.description}</p>
            <ul className="list-compact">
              {role.outcomes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </SurfaceCard>
        ))}
      </section>

      <section className="two-column-grid">
        <SurfaceCard className="surface-card">
          <span className="card-label">Why this UI feels better</span>
          <h3>Less dashboard noise, more guidance.</h3>
          <ul className="list-compact">
            {platformPrinciples.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </SurfaceCard>

        <SurfaceCard className="surface-card accent-surface">
          <span className="card-label">Application flow</span>
          <h3>Every major stage is visible, not hidden in random pages.</h3>
          <div className="timeline-preview">
            {applicationFlow.map((item) => (
              <div className="timeline-preview-row" key={`${item.company}-${item.role}`}>
                <span className="timeline-marker" />
                <div>
                  <strong>{item.role}</strong>
                  <p>{item.company}</p>
                </div>
                <span className="soft-pill">{item.status}</span>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </section>
    </div>
  );
}

function RegisterPage() {
  const [activeRole, setActiveRole] = useState("job_seeker");
  const role = registrationRoleContent[activeRole];

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Sign up flow"
        title="Start with the workspace that matches how you use the platform."
        text="This page is now framed like a real onboarding experience instead of a text-only placeholder."
      />

      <section className="two-column-grid">
        <SurfaceCard className="surface-card form-surface">
          <div className="role-toggle-row">
            {Object.entries(registrationRoleContent).map(([key, item]) => (
              <button
                key={key}
                type="button"
                className={key === activeRole ? "role-toggle role-toggle-active" : "role-toggle"}
                onClick={() => setActiveRole(key)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <span className="card-label">{role.eyebrow}</span>
          <h3>{role.headline}</h3>
          <p className="muted-copy">{role.description}</p>

          <div className="form-grid">
            {role.fields.map((field) => (
              <FormField key={field.label} field={field} />
            ))}
          </div>

          <div className="panel-actions">
            <button className="primary-button" type="button">
              {role.buttonLabel}
            </button>
            <span className="helper-note">Backend endpoint ready at `{API_BASE_URL}/auth/register/`</span>
          </div>
        </SurfaceCard>

        <SurfaceCard className="surface-card dark-surface">
          <span className="card-label">{role.dashboardTitle}</span>
          <h3>{role.label} dashboard experience</h3>
          <ul className="list-compact">
            {role.outcomes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <div className="checklist-block">
            <strong>Recommended first steps</strong>
            <ul className="list-compact">
              {role.setup.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </SurfaceCard>
      </section>
    </div>
  );
}

function JobsPage() {
  const [formFilters, setFormFilters] = useState(emptyJobFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyJobFilters);
  const [jobs, setJobs] = useState([]);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadJobs() {
      setStatus("loading");
      setErrorMessage("");

      const params = new URLSearchParams();
      Object.entries(appliedFilters).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        }
      });

      const path = params.toString() ? `/jobs/?${params.toString()}` : "/jobs/";

      try {
        const response = await apiRequest(path);
        if (cancelled) {
          return;
        }
        setJobs(Array.isArray(response) ? response : []);
        setStatus("ready");
      } catch (error) {
        if (cancelled) {
          return;
        }
        setJobs([]);
        setErrorMessage(error.message || "Unable to load jobs right now.");
        setStatus("error");
      }
    }

    loadJobs();

    return () => {
      cancelled = true;
    };
  }, [appliedFilters, refreshTick]);

  const jobStats = summarizeJobs(jobs);
  const activeFilterEntries = Object.entries(appliedFilters).filter(([, value]) => value);

  function handleFilterChange(event) {
    const { name, value } = event.target;
    setFormFilters((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSearch(event) {
    event.preventDefault();
    setAppliedFilters(formFilters);
  }

  function handleReset() {
    setFormFilters(emptyJobFilters);
    setAppliedFilters(emptyJobFilters);
    setRefreshTick((current) => current + 1);
  }

  function handleRetry() {
    setRefreshTick((current) => current + 1);
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Live jobs board"
        title="A calmer, more useful place to browse open roles."
        text="This screen now behaves like a real job board with live data, clearer filters, and better empty and loading states."
      />

      <SurfaceCard className="surface-card filter-surface">
        <form className="filters-grid" onSubmit={handleSearch}>
          <label className="field-shell field-wide">
            <span>Role or keyword</span>
            <input
              name="title"
              value={formFilters.title}
              onChange={handleFilterChange}
              placeholder="Search for Django, React, Product..."
            />
          </label>

          <label className="field-shell">
            <span>Location</span>
            <input
              name="location"
              value={formFilters.location}
              onChange={handleFilterChange}
              placeholder="Kathmandu, Remote..."
            />
          </label>

          <label className="field-shell">
            <span>Job type</span>
            <select name="job_type" value={formFilters.job_type} onChange={handleFilterChange}>
              <option value="">Any type</option>
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </label>

          <label className="field-shell">
            <span>Work mode</span>
            <select name="work_mode" value={formFilters.work_mode} onChange={handleFilterChange}>
              <option value="">Any mode</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="on_site">On Site</option>
            </select>
          </label>

          <div className="filter-actions">
            <button className="primary-button" type="submit">
              Search jobs
            </button>
            <button className="secondary-button" type="button" onClick={handleReset}>
              Reset
            </button>
          </div>
        </form>

        <div className="filter-chip-row">
          {activeFilterEntries.length > 0 ? (
            activeFilterEntries.map(([key, value]) => (
              <span className="filter-chip" key={key}>
                {humanizeFilterKey(key)}: {formatEnumLabel(value)}
              </span>
            ))
          ) : (
            <span className="helper-note">Showing all public jobs from `{API_BASE_URL}/jobs/`.</span>
          )}
        </div>
      </SurfaceCard>

      <section className="stats-grid">
        {jobStats.map((item) => (
          <StatCard
            key={item.label}
            label={item.label}
            value={item.value}
            detail={item.detail}
          />
        ))}
      </section>

      {status === "loading" ? (
        <section className="jobs-board">
          {Array.from({ length: 6 }).map((_, index) => (
            <div className="surface-card skeleton-card" key={index}>
              <div className="skeleton-line skeleton-line-title" />
              <div className="skeleton-line" />
              <div className="skeleton-line" />
              <div className="skeleton-chip-row">
                <span className="skeleton-chip" />
                <span className="skeleton-chip" />
                <span className="skeleton-chip" />
              </div>
            </div>
          ))}
        </section>
      ) : null}

      {status === "error" ? (
        <SurfaceCard className="surface-card">
          <span className="card-label">Could not load jobs</span>
          <h3>The UI is ready, but the API request failed.</h3>
          <p className="muted-copy">
            Make sure Django is running on `127.0.0.1:8000`, then try again.
          </p>
          <p className="inline-error">{errorMessage}</p>
          <div className="panel-actions">
            <button className="primary-button" type="button" onClick={handleRetry}>
              Retry
            </button>
          </div>
        </SurfaceCard>
      ) : null}

      {status === "ready" && jobs.length === 0 ? (
        <SurfaceCard className="surface-card">
          <span className="card-label">No results yet</span>
          <h3>Your frontend is connected, but there are no public jobs to show.</h3>
          <p className="muted-copy">
            Create a job from the employer side and approve it from the admin flow.
            As soon as it becomes public, it will appear here automatically.
          </p>
        </SurfaceCard>
      ) : null}

      {status === "ready" && jobs.length > 0 ? (
        <section className="jobs-board">
          {jobs.map((job) => (
            <article className="surface-card job-surface" key={job.id}>
              <div className="job-topline">
                <div>
                  <span className="card-label">{formatEnumLabel(job.work_mode)}</span>
                  <h3>{job.title}</h3>
                  <p className="company-line">{job.employer_name}</p>
                </div>
                <span className={job.blind_hiring ? "soft-pill soft-pill-warm" : "soft-pill"}>
                  {job.blind_hiring ? "Blind hiring" : formatMatchLabel(job.match_score)}
                </span>
              </div>

              <p className="job-salary">{formatSalary(job.salary_min, job.salary_max)}</p>

              <div className="meta-row">
                <span className="meta-chip">{job.location}</span>
                <span className="meta-chip">{formatEnumLabel(job.job_type)}</span>
                {job.industry ? <span className="meta-chip">{job.industry}</span> : null}
                <span className="meta-chip">Closes {formatDate(job.expires_at)}</span>
              </div>

              <div className="job-footer">
                <div className="subtle-metrics">
                  <span>{job.views_count} views</span>
                  <span>{job.applications_count} applications</span>
                </div>
                <p className="helper-note">
                  Sign in as a job seeker to see personalized match details and apply.
                </p>
              </div>
            </article>
          ))}
        </section>
      ) : null}
    </div>
  );
}

function SeekerPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Seeker dashboard"
        title="Keep applications, readiness, and next moves in one clear view."
        text="The goal here is simple: make job hunting feel less scattered and easier to act on."
      />

      <section className="stats-grid">
        {seekerMetrics.map((metric) => (
          <StatCard key={metric.label} label={metric.label} value={metric.value} detail="Live UI preview for job seekers." />
        ))}
      </section>

      <section className="two-column-grid">
        <SurfaceCard className="surface-card">
          <span className="card-label">Application tracker</span>
          <h3>See momentum at a glance</h3>
          <div className="list-stack">
            {applicationFlow.map((item) => (
              <div className="list-row" key={`${item.company}-${item.role}`}>
                <div>
                  <strong>{item.role}</strong>
                  <p>{item.company}</p>
                </div>
                <div className="list-row-end">
                  <span>{item.score}</span>
                  <span className="soft-pill">{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard className="surface-card accent-surface">
          <span className="card-label">Skill gap coach</span>
          <h3>Know exactly what improves your chances next.</h3>
          <div className="list-stack">
            {skillGaps.map((gap) => (
              <div className="list-row block-row" key={gap.job}>
                <div>
                  <strong>{gap.job}</strong>
                  <p>{gap.missing.join(", ")}</p>
                </div>
                <p className="muted-copy">{gap.suggestion}</p>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </section>
    </div>
  );
}

function EmployerPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Employer dashboard"
        title="Move from hiring chaos to a focused candidate pipeline."
        text="This version surfaces what employers care about first: active hiring, applicant quality, and fast next actions."
      />

      <section className="stats-grid">
        {employerMetrics.map((metric) => (
          <StatCard key={metric.label} label={metric.label} value={metric.value} detail="Employer-facing preview state." />
        ))}
      </section>

      <section className="two-column-grid">
        <SurfaceCard className="surface-card">
          <span className="card-label">Top candidates</span>
          <h3>Applicants with hiring momentum</h3>
          <div className="list-stack">
            {applicationFlow.map((item) => (
              <div className="list-row" key={`${item.role}-${item.company}`}>
                <div>
                  <strong>{item.role}</strong>
                  <p>{item.company}</p>
                </div>
                <div className="list-row-end">
                  <span>{item.score}</span>
                  <span className="soft-pill">{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard className="surface-card dark-surface">
          <span className="card-label">Hiring checklist</span>
          <h3>What this UI now emphasizes</h3>
          <ul className="list-compact">
            <li>Post jobs with clear salary, work mode, and required skills.</li>
            <li>Shortlist or reject quickly without losing candidate history.</li>
            <li>Schedule interviews and keep updates visible to candidates.</li>
            <li>Close the role once a candidate is hired.</li>
          </ul>
        </SurfaceCard>
      </section>
    </div>
  );
}

function AdminPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Admin control"
        title="Moderation, trust, and skill quality in one operational view."
        text="Admins need clarity more than decoration, so this screen focuses on queues, health, and governance."
      />

      <section className="stats-grid">
        {adminMetrics.map((metric) => (
          <StatCard key={metric.label} label={metric.label} value={metric.value} detail="Admin-facing preview state." />
        ))}
      </section>

      <section className="two-column-grid">
        <SurfaceCard className="surface-card">
          <span className="card-label">Moderation queue</span>
          <h3>Work that needs admin attention</h3>
          <div className="list-stack">
            {moderationQueue.map((item) => (
              <div className="list-row block-row" key={item.title}>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.meta}</p>
                </div>
                <span className="soft-pill">{item.status}</span>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard className="surface-card accent-surface">
          <span className="card-label">Platform health</span>
          <h3>What a good admin UI should surface</h3>
          <ul className="list-compact">
            <li>Job review backlog and time to approval.</li>
            <li>Quality of the master skill taxonomy.</li>
            <li>Trust signals across employers, seekers, and posting activity.</li>
            <li>Notification health and operational follow-ups.</li>
          </ul>
        </SurfaceCard>
      </section>
    </div>
  );
}

function ApplicationsPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Application journey"
        title="Make each hiring stage easy to understand, not buried in status noise."
        text="This page keeps the progression readable so both candidates and employers know what changed and what comes next."
      />

      <SurfaceCard className="surface-card">
        <div className="timeline-preview">
          {applicationFlow.map((item, index) => (
            <div className="timeline-preview-row" key={`${item.company}-${index}`}>
              <span className="timeline-marker" />
              <div>
                <strong>{item.role}</strong>
                <p>{item.company}</p>
              </div>
              <span className="soft-pill">{item.status}</span>
            </div>
          ))}
        </div>
      </SurfaceCard>
    </div>
  );
}

function NotificationsPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Notifications"
        title="A calmer inbox that helps users act quickly."
        text="Instead of scattered alerts, this layout treats notifications like a focused action center."
      />

      <section className="notice-grid">
        {notifications.map((item) => (
          <article className={`surface-card notice-card notice-${item.tone}`} key={item.id}>
            <span className="card-label">Inbox item</span>
            <h3>{item.title}</h3>
            <p className="muted-copy">{item.message}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

function PageHeader({ eyebrow, title, text }) {
  return (
    <header className="page-header">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      <p>{text}</p>
    </header>
  );
}

function SurfaceCard({ className, children }) {
  return <section className={className}>{children}</section>;
}

function StatCard({ label, value, detail }) {
  return (
    <article className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="mini-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function FormField({ field }) {
  if (field.type === "textarea") {
    return (
      <label className="field-shell field-shell-full">
        <span>{field.label}</span>
        <textarea placeholder={field.placeholder} rows="4" />
      </label>
    );
  }

  return (
    <label className="field-shell">
      <span>{field.label}</span>
      <input type={field.type || "text"} placeholder={field.placeholder} />
    </label>
  );
}

function summarizeJobs(jobs) {
  const remoteFriendly = jobs.filter(
    (job) => job.work_mode === "remote" || job.work_mode === "hybrid",
  ).length;
  const salaryShared = jobs.filter(
    (job) => job.salary_min != null || job.salary_max != null,
  ).length;
  const closingSoon = jobs.filter((job) => {
    const remainingDays = daysUntil(job.expires_at);
    return remainingDays != null && remainingDays <= 7;
  }).length;

  return [
    {
      label: "Live roles",
      value: String(jobs.length),
      detail: "Public listings currently returned by the backend.",
    },
    {
      label: "Remote friendly",
      value: String(remoteFriendly),
      detail: "Roles marked remote or hybrid.",
    },
    {
      label: "Salary shared",
      value: String(salaryShared),
      detail: "Jobs with visible salary information.",
    },
    {
      label: "Closing soon",
      value: String(closingSoon),
      detail: "Jobs expiring within the next 7 days.",
    },
  ];
}

function daysUntil(value) {
  const targetDate = new Date(value);
  if (Number.isNaN(targetDate.getTime())) {
    return null;
  }

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const difference = targetDate.getTime() - startOfToday.getTime();
  return Math.ceil(difference / (1000 * 60 * 60 * 24));
}

function humanizeFilterKey(value) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatEnumLabel(value) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatSalary(min, max) {
  if (min == null && max == null) {
    return "Salary not disclosed";
  }
  if (min != null && max != null) {
    return `${currencyFormatter.format(min)} - ${currencyFormatter.format(max)}`;
  }
  if (min != null) {
    return `From ${currencyFormatter.format(min)}`;
  }
  return `Up to ${currencyFormatter.format(max)}`;
}

function formatMatchLabel(matchScore) {
  if (matchScore == null) {
    return "Public listing";
  }
  return `${Math.round(Number(matchScore))}% match`;
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default App;
