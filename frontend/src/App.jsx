import { NavLink, Route, Routes } from "react-router-dom";
import {
  adminMetrics,
  applicationFlow,
  employerMetrics,
  featuredJobs,
  notifications,
  seekerMetrics,
  skillGaps,
} from "./mockData";
import { API_BASE_URL } from "./api/client";

function App() {
  return (
    <div className="page-shell">
      <aside className="side-rail">
        <div>
          <p className="eyebrow">AI Hiring Platform</p>
          <h1>ElevateHire</h1>
          <p className="rail-copy">
            A React plus Django job portal built around skills, hiring transparency,
            and role-based workflows.
          </p>
        </div>

        <nav className="nav-stack">
          <NavItem to="/">Overview</NavItem>
          <NavItem to="/register">Register</NavItem>
          <NavItem to="/jobs">Jobs</NavItem>
          <NavItem to="/seeker">Seeker</NavItem>
          <NavItem to="/employer">Employer</NavItem>
          <NavItem to="/admin">Admin</NavItem>
          <NavItem to="/applications">Applications</NavItem>
          <NavItem to="/notifications">Notifications</NavItem>
        </nav>

        <div className="api-card">
          <span className="pill">API</span>
          <p>{API_BASE_URL}</p>
          <small>JWT-secured Django API with MySQL-first configuration.</small>
        </div>
      </aside>

      <main className="content-area">
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
        isActive ? "nav-link nav-link-active" : "nav-link"
      }
    >
      {children}
    </NavLink>
  );
}

function OverviewPage() {
  return (
    <div className="stack-lg">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">Skill-led recruiting</p>
          <h2>One portal, three role-specific experiences.</h2>
          <p>
            Job seekers discover high-fit roles, employers manage hiring funnels,
            and admins moderate the full platform. The core differentiator is AI
            skill matching driven by weighted job requirements and seeker proficiency.
          </p>
        </div>
        <div className="hero-grid">
          <MetricCard label="Auth" value="JWT" />
          <MetricCard label="Backend" value="Django" />
          <MetricCard label="Frontend" value="React" />
          <MetricCard label="Database" value="MySQL" />
        </div>
      </section>

      <section className="split-grid">
        <Panel
          title="What makes it stand out"
          subtitle="Beyond standard listings and resumes"
        >
          <ul className="list-clean">
            <li>AI match scores on every job card and application.</li>
            <li>Skill gap analysis with learning-resource recommendations.</li>
            <li>Blind hiring mode for fairer first-round screening.</li>
            <li>Interview scheduling and in-app notification workflows.</li>
          </ul>
        </Panel>

        <Panel
          title="Suggested backend modules"
          subtitle="Already scaffolded in Django"
        >
          <ul className="list-clean">
            <li>`accounts` for custom users and role-based profiles.</li>
            <li>`skills` for the master skill list and seeker proficiency.</li>
            <li>`jobs` for postings, requirements, alerts, and saves.</li>
            <li>`applications` for hiring stages, interviews, and timelines.</li>
            <li>`notifications` for inbox events and email-ready payloads.</li>
          </ul>
        </Panel>
      </section>
    </div>
  );
}

function RegisterPage() {
  return (
    <div className="stack-lg">
      <SectionHeader
        title="Registration Flow"
        text="The product branches immediately by role so users see the right dashboard after signup."
      />
      <section className="card-grid">
        <Panel title="Job Seeker">
          <ul className="list-clean">
            <li>Complete a profile with resume, experience, and education.</li>
            <li>Add skills from the admin-managed master list.</li>
            <li>Browse jobs with live match scores before applying.</li>
          </ul>
        </Panel>
        <Panel title="Employer">
          <ul className="list-clean">
            <li>Create a company profile with logo, industry, and website.</li>
            <li>Post jobs with required and nice-to-have skills.</li>
            <li>Review applicants sorted by AI match score.</li>
          </ul>
        </Panel>
        <Panel title="Admin">
          <ul className="list-clean">
            <li>Approve or reject job posts before they go live.</li>
            <li>Manage users and the shared skill taxonomy.</li>
            <li>Monitor activity across the platform.</li>
          </ul>
        </Panel>
      </section>
    </div>
  );
}

function JobsPage() {
  return (
    <div className="stack-lg">
      <SectionHeader
        title="Matching Jobs"
        text="Designed for quick scanning, filtering, and confidence around fit."
      />
      <section className="jobs-grid">
        {featuredJobs.map((job) => (
          <article className="job-card" key={job.id}>
            <div className="job-card-top">
              <div>
                <h3>{job.title}</h3>
                <p>{job.company}</p>
              </div>
              <span className="match-pill">{job.match}% match</span>
            </div>
            <div className="job-meta">
              <span>{job.location}</span>
              <span>{job.type}</span>
              <span>{job.mode}</span>
            </div>
            <p className="job-salary">{job.salary}</p>
            <div className="tag-row">
              {job.skills.map((skill) => (
                <span className="tag" key={skill}>
                  {skill}
                </span>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function SeekerPage() {
  return (
    <div className="stack-lg">
      <SectionHeader
        title="Job Seeker Dashboard"
        text="A career assistant centered on profile strength, applications, and upskilling."
      />
      <section className="metric-grid">
        {seekerMetrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </section>
      <section className="split-grid">
        <Panel title="Current Application Pipeline">
          {applicationFlow.map((item) => (
            <div className="line-item" key={`${item.company}-${item.role}`}>
              <div>
                <strong>{item.role}</strong>
                <p>{item.company}</p>
              </div>
              <div className="line-item-right">
                <span>{item.score}</span>
                <small>{item.status}</small>
              </div>
            </div>
          ))}
        </Panel>
        <Panel title="Skill Gap Guidance">
          {skillGaps.map((gap) => (
            <div className="line-item" key={gap.job}>
              <div>
                <strong>{gap.job}</strong>
                <p>{gap.missing.join(", ")}</p>
              </div>
              <small>{gap.suggestion}</small>
            </div>
          ))}
        </Panel>
      </section>
    </div>
  );
}

function EmployerPage() {
  return (
    <div className="stack-lg">
      <SectionHeader
        title="Employer Dashboard"
        text="Track candidate quality, move applications through the funnel, and improve hiring throughput."
      />
      <section className="metric-grid">
        {employerMetrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </section>
      <section className="split-grid">
        <Panel title="High-Intent Applicants">
          {applicationFlow.map((item) => (
            <div className="line-item" key={`${item.role}-employer`}>
              <div>
                <strong>{item.role}</strong>
                <p>{item.company}</p>
              </div>
              <div className="line-item-right">
                <span>{item.score}</span>
                <small>{item.status}</small>
              </div>
            </div>
          ))}
        </Panel>
        <Panel title="Hiring Funnel Actions">
          <ul className="list-clean">
            <li>Shortlist or reject directly from each applicant profile.</li>
            <li>Schedule phone, video, or on-site interviews.</li>
            <li>Capture private interviewer notes per candidate.</li>
            <li>Mark a candidate hired and automatically close the job.</li>
          </ul>
        </Panel>
      </section>
    </div>
  );
}

function AdminPage() {
  return (
    <div className="stack-lg">
      <SectionHeader
        title="Admin Control Tower"
        text="The platform operations layer for moderation, taxonomy, and trust."
      />
      <section className="metric-grid">
        {adminMetrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </section>
      <section className="split-grid">
        <Panel title="Moderation Focus">
          <ul className="list-clean">
            <li>Review new job posts before approval.</li>
            <li>Add and curate the master skill list.</li>
            <li>Manage suspicious accounts or posting activity.</li>
          </ul>
        </Panel>
        <Panel title="System Health">
          <ul className="list-clean">
            <li>MySQL-backed persistence for production-friendly scaling.</li>
            <li>Role-based API permissions enforced in Django REST Framework.</li>
            <li>Notification entities ready for inbox and email workflows.</li>
          </ul>
        </Panel>
      </section>
    </div>
  );
}

function ApplicationsPage() {
  return (
    <div className="stack-lg">
      <SectionHeader
        title="Application Status Flow"
        text="Applied to shortlisted to interview to hired or rejected, with visibility at every stage."
      />
      <section className="timeline-card">
        {applicationFlow.map((item, index) => (
          <div className="timeline-row" key={`${item.company}-${index}`}>
            <span className="timeline-dot" />
            <div className="timeline-copy">
              <strong>{item.role}</strong>
              <p>{item.company}</p>
            </div>
            <span className="status-chip">{item.status}</span>
          </div>
        ))}
      </section>
    </div>
  );
}

function NotificationsPage() {
  return (
    <div className="stack-lg">
      <SectionHeader
        title="Notifications Center"
        text="Designed for real-time updates inside the portal and mirrored email events."
      />
      <section className="card-grid">
        {notifications.map((item) => (
          <article className={`notice-card notice-${item.tone}`} key={item.id}>
            <h3>{item.title}</h3>
            <p>{item.message}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

function SectionHeader({ title, text }) {
  return (
    <header className="section-header">
      <h2>{title}</h2>
      <p>{text}</p>
    </header>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Panel({ title, subtitle, children }) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h3>{title}</h3>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      <div>{children}</div>
    </section>
  );
}

export default App;
