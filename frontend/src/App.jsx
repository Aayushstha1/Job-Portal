import React, { useEffect, useState } from "react";
import {
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { API_BASE_URL, apiRequest } from "./api/client";
import { dashboardPathForRole, useAuth } from "./auth.jsx";

const currencyFormatter = new Intl.NumberFormat("en-NP", {
  style: "currency",
  currency: "NPR",
  maximumFractionDigits: 0,
});

const publicFeatures = [
  {
    title: "Role-based product flow",
    description:
      "The app now separates public browsing, authentication, and post-login experiences cleanly.",
  },
  {
    title: "Live backend integration",
    description:
      "Jobs, applications, notifications, profiles, and skills can all be pulled from your Django API.",
  },
  {
    title: "Dedicated dashboards",
    description:
      "Job seekers, employers, and admins each land in a different workspace after login.",
  },
];

const roleOverview = [
  {
    role: "Job Seeker",
    title: "Track applications and improve job fit.",
    bullets: [
      "See your latest applications and interview status.",
      "Review skill coverage and profile readiness.",
      "Browse live roles with clearer context around fit.",
    ],
  },
  {
    role: "Employer",
    title: "Manage jobs, applicants, and hiring momentum.",
    bullets: [
      "Track pending and approved roles.",
      "Review applicants across your openings.",
      "See interview activity and platform notifications.",
    ],
  },
  {
    role: "Admin",
    title: "Moderate jobs and monitor system health.",
    bullets: [
      "Review pending jobs and moderation workload.",
      "Track platform application volume and skills growth.",
      "Keep operational quality visible in one place.",
    ],
  },
];

const emptyJobFilters = {
  title: "",
  location: "",
  job_type: "",
  work_mode: "",
};

function App() {
  const auth = useAuth();

  if (auth.status === "loading") {
    return <FullScreenLoader message="Preparing your workspace..." />;
  }

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <SiteHeader />

      <main className="site-main">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/login"
            element={
              auth.isAuthenticated ? (
                <Navigate to={dashboardPathForRole(auth.user.role)} replace />
              ) : (
                <LoginPage />
              )
            }
          />
          <Route
            path="/register"
            element={
              auth.isAuthenticated ? (
                <Navigate to={dashboardPathForRole(auth.user.role)} replace />
              ) : (
                <RegisterPage />
              )
            }
          />
          <Route path="/jobs" element={<JobsPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/seeker"
            element={
              <ProtectedRoute roles={["job_seeker"]}>
                <SeekerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/employer"
            element={
              <ProtectedRoute roles={["employer"]}>
                <EmployerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function SiteHeader() {
  const { isAuthenticated, user, logout } = useAuth();

  const navItems = isAuthenticated
    ? [
        { to: "/", label: "Home" },
        { to: "/jobs", label: "Jobs" },
        { to: "/dashboard", label: "Dashboard" },
      ]
    : [
        { to: "/", label: "Home" },
        { to: "/jobs", label: "Jobs" },
        { to: "/login", label: "Login" },
        { to: "/register", label: "Register" },
      ];

  return (
    <header className="site-header">
      <NavLink className="brand-lockup" to="/">
        <span className="brand-mark">EH</span>
        <span className="brand-text">
          <strong>ElevateHire</strong>
          <small>Advanced multi-role hiring platform</small>
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
          Backend online
        </span>

        {isAuthenticated ? (
          <div className="account-pill">
            <div className="account-copy">
              <strong>{user.full_name || user.email}</strong>
              <small>{readableRole(user.role)}</small>
            </div>
            <button className="secondary-button compact" type="button" onClick={logout}>
              Logout
            </button>
          </div>
        ) : (
          <div className="header-cta-row">
            <NavLink className="secondary-button compact" to="/login">
              Sign in
            </NavLink>
            <NavLink className="primary-button compact" to="/register">
              Create account
            </NavLink>
          </div>
        )}
      </div>
    </header>
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

function ProtectedRoute({ children, roles }) {
  const auth = useAuth();
  const location = useLocation();

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.includes(auth.user.role)) {
    return <Navigate to={dashboardPathForRole(auth.user.role)} replace />;
  }

  return children;
}

function DashboardRedirect() {
  const { user } = useAuth();
  return <Navigate to={dashboardPathForRole(user.role)} replace />;
}

function LandingPage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="page-stack">
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">Advanced project foundation</span>
          <h1>Login, register, and role-specific dashboards in one cleaner product flow.</h1>
          <p>
            This version moves the project away from a demo-style interface and toward
            a real multi-user product. Visitors can browse jobs publicly, users can
            sign in, and each role lands in its own workspace after authentication.
          </p>

          <div className="hero-actions">
            {isAuthenticated ? (
              <NavLink className="primary-button" to={dashboardPathForRole(user.role)}>
                Open your dashboard
              </NavLink>
            ) : (
              <>
                <NavLink className="primary-button" to="/register">
                  Start with registration
                </NavLink>
                <NavLink className="secondary-button" to="/login">
                  Sign in
                </NavLink>
              </>
            )}
          </div>

          <div className="hero-proof">
            <span className="proof-chip">Live API</span>
            <span className="proof-text">{API_BASE_URL}</span>
          </div>
        </div>

        <section className="surface-card dark-surface hero-panel">
          <span className="card-label">Now included</span>
          <h3>What changed in the project structure</h3>
          <div className="feature-stack">
            {publicFeatures.map((item) => (
              <div className="feature-row" key={item.title}>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      </section>

      <PageHeader
        eyebrow="Role dashboards"
        title="Every user type gets a different post-login experience."
        text="That separation matters because job seekers, employers, and admins do not need the same tools or the same priorities."
      />

      <section className="role-grid">
        {roleOverview.map((item) => (
          <SurfaceCard key={item.role} className="surface-card">
            <span className="card-label">{item.role}</span>
            <h3>{item.title}</h3>
            <ul className="list-compact">
              {item.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </SurfaceCard>
        ))}
      </section>
    </div>
  );
}

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const user = await login(form);
      const redirectTarget = resolvePostAuthDestination(user, location.state?.from);
      navigate(redirectTarget, { replace: true });
    } catch (error) {
      setErrorMessage(error.message || "Unable to sign in right now.");
      setStatus("error");
      return;
    }

    setStatus("idle");
  }

  return (
    <div className="auth-shell">
      <section className="surface-card auth-side">
        <span className="card-label">Sign in</span>
        <h1>Welcome back to your hiring workspace.</h1>
        <p>
          Use the account you created earlier and we will route you directly to the
          correct dashboard for your role.
        </p>
        <ul className="list-compact">
          <li>Job seekers go to their application and skills dashboard.</li>
          <li>Employers go to their job and applicant dashboard.</li>
          <li>Admins go to platform moderation and system health.</li>
        </ul>
      </section>

      <section className="surface-card auth-form-card">
        <PageHeader
          eyebrow="Account access"
          title="Login to continue"
          text="Your role decides where you land after authentication."
        />

        <form className="form-grid single-column-form" onSubmit={handleSubmit}>
          <FormField
            field={{
              label: "Email",
              name: "email",
              type: "email",
              value: form.email,
              onChange: handleChange,
              placeholder: "you@example.com",
            }}
          />
          <FormField
            field={{
              label: "Password",
              name: "password",
              type: "password",
              value: form.password,
              onChange: handleChange,
              placeholder: "Enter your password",
            }}
          />

          {errorMessage ? <InlineMessage tone="error" text={errorMessage} /> : null}

          <div className="panel-actions">
            <button className="primary-button" disabled={status === "submitting"} type="submit">
              {status === "submitting" ? "Signing in..." : "Login"}
            </button>
            <span className="helper-note">
              Need an account? <NavLink className="inline-link" to="/register">Create one here.</NavLink>
            </span>
          </div>
        </form>
      </section>
    </div>
  );
}

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    role: "job_seeker",
    fullName: "",
    email: "",
    password: "",
    location: "",
    companyName: "",
    industry: "",
  });
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const { firstName, lastName } = splitFullName(form.fullName);
    const payload = {
      email: form.email,
      password: form.password,
      first_name: firstName,
      last_name: lastName,
      role: form.role,
      full_name: form.fullName,
      location: form.location,
    };

    if (form.role === "employer") {
      payload.company_name = form.companyName;
      payload.industry = form.industry;
    }

    try {
      const user = await register(payload);
      navigate(dashboardPathForRole(user.role), { replace: true });
    } catch (error) {
      setErrorMessage(error.message || "Unable to create the account.");
      setStatus("error");
      return;
    }

    setStatus("idle");
  }

  const isEmployer = form.role === "employer";

  return (
    <div className="auth-shell">
      <section className="surface-card auth-form-card">
        <PageHeader
          eyebrow="Create account"
          title="Register for the platform"
          text="Registration is open for job seekers and employers. Admin accounts should sign in with pre-created access."
        />

        <div className="segmented-toggle" role="tablist" aria-label="Select account type">
          <button
            className={form.role === "job_seeker" ? "segment-item segment-item-active" : "segment-item"}
            type="button"
            onClick={() => setForm((current) => ({ ...current, role: "job_seeker" }))}
          >
            Job Seeker
          </button>
          <button
            className={form.role === "employer" ? "segment-item segment-item-active" : "segment-item"}
            type="button"
            onClick={() => setForm((current) => ({ ...current, role: "employer" }))}
          >
            Employer
          </button>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <FormField
            field={{
              label: isEmployer ? "Contact name" : "Full name",
              name: "fullName",
              value: form.fullName,
              onChange: handleChange,
              placeholder: isEmployer ? "Hiring manager name" : "Your full name",
            }}
          />
          <FormField
            field={{
              label: "Email",
              name: "email",
              type: "email",
              value: form.email,
              onChange: handleChange,
              placeholder: "you@example.com",
            }}
          />
          <FormField
            field={{
              label: "Password",
              name: "password",
              type: "password",
              value: form.password,
              onChange: handleChange,
              placeholder: "At least 8 characters",
            }}
          />
          <FormField
            field={{
              label: isEmployer ? "Company location" : "Current city",
              name: "location",
              value: form.location,
              onChange: handleChange,
              placeholder: "Kathmandu, Pokhara, Remote...",
            }}
          />

          {isEmployer ? (
            <>
              <FormField
                field={{
                  label: "Company name",
                  name: "companyName",
                  value: form.companyName,
                  onChange: handleChange,
                  placeholder: "Northstar Labs",
                }}
              />
              <FormField
                field={{
                  label: "Industry",
                  name: "industry",
                  value: form.industry,
                  onChange: handleChange,
                  placeholder: "Software, Design, Finance...",
                }}
              />
            </>
          ) : null}

          {errorMessage ? <InlineMessage tone="error" text={errorMessage} /> : null}

          <div className="panel-actions form-actions-full">
            <button className="primary-button" disabled={status === "submitting"} type="submit">
              {status === "submitting" ? "Creating account..." : "Register"}
            </button>
            <span className="helper-note">
              Already registered? <NavLink className="inline-link" to="/login">Login here.</NavLink>
            </span>
          </div>
        </form>
      </section>

      <section className="surface-card auth-side dark-surface">
        <span className="card-label">{isEmployer ? "Employer flow" : "Job seeker flow"}</span>
        <h3>
          {isEmployer
            ? "Create a company workspace and start posting jobs."
            : "Build a candidate account and track every application in one place."}
        </h3>
        <ul className="list-compact">
          {isEmployer ? (
            <>
              <li>Post roles and manage approval-ready job listings.</li>
              <li>Review applicants, interview activity, and notifications.</li>
              <li>Use the employer dashboard as your daily hiring workspace.</li>
            </>
          ) : (
            <>
              <li>Get a personal dashboard for applications and profile readiness.</li>
              <li>Browse live jobs and see role-specific opportunities.</li>
              <li>Keep skills, applications, and alerts in one place.</li>
            </>
          )}
        </ul>
      </section>
    </div>
  );
}

function JobsPage() {
  const { isAuthenticated, user } = useAuth();
  const isSeeker = isAuthenticated && user.role === "job_seeker";
  const [formFilters, setFormFilters] = useState(emptyJobFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyJobFilters);
  const [jobs, setJobs] = useState([]);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedJobDetail, setSelectedJobDetail] = useState(null);
  const [detailStatus, setDetailStatus] = useState("idle");
  const [detailErrorMessage, setDetailErrorMessage] = useState("");
  const [savedJobs, setSavedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [jobAlerts, setJobAlerts] = useState([]);
  const [actionMessage, setActionMessage] = useState("");
  const [actionTone, setActionTone] = useState("success");
  const [jobActionStatus, setJobActionStatus] = useState("idle");
  const [alertActionStatus, setAlertActionStatus] = useState("idle");
  const [coverLetter, setCoverLetter] = useState("");

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
        const requests = [apiRequest(path)];
        if (isSeeker) {
          requests.push(apiRequest("/jobs/saved/"));
          requests.push(apiRequest("/applications/"));
          requests.push(apiRequest("/job-alerts/"));
        }
        const response = await Promise.all(requests);
        if (cancelled) {
          return;
        }
        const [jobsResponse, savedResponse = [], applicationsResponse = [], alertsResponse = []] = response;
        setJobs(Array.isArray(jobsResponse) ? jobsResponse : []);
        setSavedJobs(Array.isArray(savedResponse) ? savedResponse : []);
        setApplications(Array.isArray(applicationsResponse) ? applicationsResponse : []);
        setJobAlerts(Array.isArray(alertsResponse) ? alertsResponse : []);
        setStatus("ready");
      } catch (error) {
        if (cancelled) {
          return;
        }
        setJobs([]);
        setSavedJobs([]);
        setApplications([]);
        setJobAlerts([]);
        setErrorMessage(error.message || "Unable to load jobs right now.");
        setStatus("error");
      }
    }

    loadJobs();
    return () => {
      cancelled = true;
    };
  }, [appliedFilters, isSeeker, refreshTick]);

  useEffect(() => {
    if (!isSeeker) {
      setSelectedJobId(null);
      setSelectedJobDetail(null);
      setDetailStatus("idle");
      setDetailErrorMessage("");
      return;
    }

    if (!jobs.length) {
      setSelectedJobId(null);
      setSelectedJobDetail(null);
      setDetailStatus("idle");
      setDetailErrorMessage("");
      return;
    }

    const stillVisible = jobs.some((job) => job.id === selectedJobId);
    if (!stillVisible) {
      setSelectedJobId(jobs[0].id);
      setCoverLetter("");
      setActionMessage("");
    }
  }, [isSeeker, jobs, selectedJobId]);

  useEffect(() => {
    if (!isSeeker || !selectedJobId) {
      return;
    }

    let cancelled = false;

    async function loadJobDetail() {
      setDetailStatus("loading");
      setDetailErrorMessage("");

      try {
        const response = await apiRequest(`/jobs/${selectedJobId}/`);
        if (cancelled) {
          return;
        }
        setSelectedJobDetail(response);
        setDetailStatus("ready");
      } catch (error) {
        if (cancelled) {
          return;
        }
        setSelectedJobDetail(null);
        setDetailStatus("error");
        setDetailErrorMessage(error.message || "Unable to load the AI match breakdown for this job.");
      }
    }

    loadJobDetail();
    return () => {
      cancelled = true;
    };
  }, [isSeeker, selectedJobId]);

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
    setActionMessage("");
  }

  function handleReset() {
    setFormFilters(emptyJobFilters);
    setAppliedFilters(emptyJobFilters);
    setRefreshTick((current) => current + 1);
    setActionMessage("");
  }

  const jobStats = summarizeJobs(jobs);
  const savedJobIds = new Set(savedJobs.map((job) => job.id));
  const appliedJobIds = new Set(applications.map((application) => application.job));
  const selectedJobIsSaved = selectedJobDetail ? savedJobIds.has(selectedJobDetail.id) : false;
  const selectedJobAlreadyApplied = selectedJobDetail ? appliedJobIds.has(selectedJobDetail.id) : false;
  const selectedJobAlertExists = selectedJobDetail
    ? jobAlerts.some((alert) => alert.is_active && alertsMatchJob(alert, selectedJobDetail))
    : false;

  async function handleSaveToggle(job) {
    setJobActionStatus(`saving-${job.id}`);
    setActionMessage("");

    try {
      const response = await apiRequest(`/jobs/${job.id}/save/`, {
        method: "POST",
      });
      if (response.saved) {
        const savedSummary = createJobSummary(job);
        setSavedJobs((current) => [savedSummary, ...current.filter((item) => item.id !== job.id)]);
        setActionTone("success");
        setActionMessage("Job saved to your shortlist.");
      } else {
        setSavedJobs((current) => current.filter((item) => item.id !== job.id));
        setActionTone("success");
        setActionMessage("Job removed from your shortlist.");
      }
    } catch (error) {
      setActionTone("error");
      setActionMessage(error.message || "Unable to update your saved jobs.");
    } finally {
      setJobActionStatus("idle");
    }
  }

  async function handleApply(jobId) {
    setJobActionStatus(`applying-${jobId}`);
    setActionMessage("");

    try {
      const createdApplication = await apiRequest(`/jobs/${jobId}/apply/`, {
        method: "POST",
        body: {
          cover_letter: coverLetter,
        },
      });
      setApplications((current) => [createdApplication, ...current]);
      setJobs((current) =>
        current.map((job) =>
          job.id === jobId
            ? {
                ...job,
                applications_count: Number(job.applications_count || 0) + 1,
              }
            : job,
        ),
      );
      setSelectedJobDetail((current) =>
        current && current.id === jobId
          ? {
              ...current,
              applications_count: Number(current.applications_count || 0) + 1,
            }
          : current,
      );
      setCoverLetter("");
      setActionTone("success");
      setActionMessage("Application submitted. The employer now has your match score and skill profile.");
    } catch (error) {
      setActionTone("error");
      setActionMessage(error.message || "Unable to submit your application right now.");
    } finally {
      setJobActionStatus("idle");
    }
  }

  async function handleCreateAlert() {
    if (!selectedJobDetail) {
      return;
    }

    setAlertActionStatus("saving");
    setActionMessage("");

    try {
      const createdAlert = await apiRequest("/job-alerts/", {
        method: "POST",
        body: {
          keywords: appliedFilters.title || selectedJobDetail.title,
          location: appliedFilters.location || selectedJobDetail.location,
          salary_min: selectedJobDetail.salary_min,
          salary_max: selectedJobDetail.salary_max,
          job_type: appliedFilters.job_type || selectedJobDetail.job_type,
          industry: selectedJobDetail.industry || "",
          is_active: true,
        },
      });
      setJobAlerts((current) => [createdAlert, ...current]);
      setActionTone("success");
      setActionMessage("Job alert created. Matching roles will now be tracked from your seeker dashboard.");
    } catch (error) {
      setActionTone("error");
      setActionMessage(error.message || "Unable to create a job alert from this role.");
    } finally {
      setAlertActionStatus("idle");
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Public jobs board"
        title="Browse jobs publicly, then sign in for role-specific workflow."
        text="Visitors can browse openings freely. Logged-in users use their dashboard to continue with the right tools for their role."
      />

      <section className="surface-card board-banner">
        <div>
          <span className="card-label">Platform note</span>
          <h3>
            {isAuthenticated
              ? `You are signed in as ${readableRole(user.role)}.`
              : "You are browsing as a visitor."}
          </h3>
          <p className="muted-copy">
            {isAuthenticated
              ? "Use your dashboard for the rest of your workflow after exploring roles here."
              : "Create an account or sign in to unlock the role-specific dashboards and protected actions."}
          </p>
        </div>

        <div className="board-banner-actions">
          {isAuthenticated ? (
            <NavLink className="primary-button" to={dashboardPathForRole(user.role)}>
              Open dashboard
            </NavLink>
          ) : (
            <>
              <NavLink className="primary-button" to="/register">
                Register now
              </NavLink>
              <NavLink className="secondary-button" to="/login">
                Login
              </NavLink>
            </>
          )}
        </div>
      </section>

      <section className="surface-card filter-surface">
        <form className="filters-grid" onSubmit={handleSearch}>
          <FormField
            field={{
              label: "Keyword",
              name: "title",
              value: formFilters.title,
              onChange: handleFilterChange,
              placeholder: "Django, React, Product...",
              className: "field-wide",
            }}
          />
          <FormField
            field={{
              label: "Location",
              name: "location",
              value: formFilters.location,
              onChange: handleFilterChange,
              placeholder: "Kathmandu or Remote",
            }}
          />
          <SelectField
            label="Job type"
            name="job_type"
            value={formFilters.job_type}
            onChange={handleFilterChange}
            options={[
              { value: "", label: "Any type" },
              { value: "full_time", label: "Full Time" },
              { value: "part_time", label: "Part Time" },
              { value: "contract", label: "Contract" },
              { value: "internship", label: "Internship" },
            ]}
          />
          <SelectField
            label="Work mode"
            name="work_mode"
            value={formFilters.work_mode}
            onChange={handleFilterChange}
            options={[
              { value: "", label: "Any mode" },
              { value: "remote", label: "Remote" },
              { value: "hybrid", label: "Hybrid" },
              { value: "on_site", label: "On Site" },
            ]}
          />

          <div className="filter-actions">
            <button className="primary-button" type="submit">
              Search jobs
            </button>
            <button className="secondary-button" type="button" onClick={handleReset}>
              Reset
            </button>
          </div>
        </form>
      </section>

      <section className="stats-grid">
        {jobStats.map((item) => (
          <MetricCard key={item.label} label={item.label} value={item.value} detail={item.detail} />
        ))}
      </section>

      {isSeeker ? (
        <section className="surface-card insight-banner">
          <div>
            <span className="card-label">AI Match Lab</span>
            <h3>Inspect how well you fit each role before you apply.</h3>
            <p className="muted-copy">
              Open a role to see its live match score, missing skills, learning links, saved-state, and
              one-click alert setup for similar openings.
            </p>
          </div>
          <div className="insight-metrics">
            <div className="mini-stat">
              <strong>{savedJobs.length}</strong>
              <span>saved jobs</span>
            </div>
            <div className="mini-stat">
              <strong>{jobAlerts.length}</strong>
              <span>alerts</span>
            </div>
            <div className="mini-stat">
              <strong>{applications.length}</strong>
              <span>applications</span>
            </div>
          </div>
        </section>
      ) : null}

      {actionMessage ? (
        <InlineMessage tone={actionTone === "error" ? "error" : "success"} text={actionMessage} />
      ) : null}

      {status === "loading" ? <SkeletonBoard /> : null}

      {status === "error" ? (
        <InlineStateCard
          title="Could not load jobs"
          text="The backend request failed. Make sure Django is running, then refresh this page."
          tone="error"
          action={
            <button className="primary-button" type="button" onClick={() => setRefreshTick((current) => current + 1)}>
              Retry
            </button>
          }
          details={errorMessage}
        />
      ) : null}

      {status === "ready" && jobs.length === 0 ? (
        <InlineStateCard
          title="No public jobs found"
          text="Your frontend is connected, but there are currently no approved jobs matching these filters."
          tone="neutral"
        />
      ) : null}

      {status === "ready" && jobs.length > 0 ? (
        isSeeker ? (
          <section className="insight-layout">
            <div className="jobs-board job-collection">
              {jobs.map((job) => {
                const isSelected = job.id === selectedJobId;
                const isSaved = savedJobIds.has(job.id);
                const alreadyApplied = appliedJobIds.has(job.id);

                return (
                  <article
                    className={isSelected ? "surface-card job-card job-card-selected" : "surface-card job-card"}
                    key={job.id}
                  >
                    <div className="job-card-top">
                      <div>
                        <span className="card-label">{formatEnumLabel(job.work_mode)}</span>
                        <h3>{job.title}</h3>
                        <p className="company-line">{job.employer_name}</p>
                      </div>
                      <span className={`soft-pill ${matchToneClass(job.match_score)}`}>
                        {job.match_score == null ? "Public listing" : `${Math.round(Number(job.match_score))}% match`}
                      </span>
                    </div>

                    <p className="job-salary">{formatSalary(job.salary_min, job.salary_max)}</p>

                    <div className="meta-row">
                      <span className="meta-chip">{job.location}</span>
                      <span className="meta-chip">{formatEnumLabel(job.job_type)}</span>
                      {job.industry ? <span className="meta-chip">{job.industry}</span> : null}
                      {job.blind_hiring ? <span className="meta-chip">Blind hiring</span> : null}
                      <span className="meta-chip">Closes {formatDate(job.expires_at)}</span>
                    </div>

                    <div className="job-card-footer">
                      <div className="subtle-metrics">
                        <span>{job.views_count} views</span>
                        <span>{job.applications_count} applications</span>
                        <span>{alreadyApplied ? "Already applied" : "Ready to inspect"}</span>
                      </div>
                      <div className="job-card-actions">
                        <button
                          className="primary-button compact"
                          type="button"
                          onClick={() => {
                            setSelectedJobId(job.id);
                            setCoverLetter("");
                            setActionMessage("");
                          }}
                        >
                          {isSelected ? "Viewing fit" : "Inspect fit"}
                        </button>
                        <button
                          className="secondary-button compact"
                          type="button"
                          onClick={() => handleSaveToggle(job)}
                          disabled={jobActionStatus !== "idle"}
                        >
                          {jobActionStatus === `saving-${job.id}` ? "Saving..." : isSaved ? "Saved" : "Save"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <aside className="surface-card insight-panel">
              <span className="card-label">Selected role</span>
              {detailStatus === "loading" ? (
                <div className="insight-empty">
                  <h3>Preparing your match breakdown...</h3>
                  <p className="muted-copy">
                    Pulling requirements, skill gaps, and employer context from the backend.
                  </p>
                </div>
              ) : null}

              {detailStatus === "error" ? (
                <div className="insight-empty">
                  <h3>Could not load this role</h3>
                  <p className="muted-copy">{detailErrorMessage}</p>
                </div>
              ) : null}

              {detailStatus === "ready" && selectedJobDetail ? (
                <div className="insight-stack">
                  <div className="insight-header">
                    <div>
                      <h3>{selectedJobDetail.title}</h3>
                      <p>{selectedJobDetail.employer.company_name}</p>
                    </div>
                    <span className={`soft-pill ${matchToneClass(selectedJobDetail.match_score)}`}>
                      {Math.round(Number(selectedJobDetail.match_score || 0))}% fit
                    </span>
                  </div>

                  <div className="meta-row">
                    <span className="meta-chip">{selectedJobDetail.location}</span>
                    <span className="meta-chip">{formatEnumLabel(selectedJobDetail.job_type)}</span>
                    <span className="meta-chip">{formatEnumLabel(selectedJobDetail.work_mode)}</span>
                    {selectedJobDetail.blind_hiring ? <span className="meta-chip">Blind hiring enabled</span> : null}
                  </div>

                  <div className="detail-list">
                    <DetailRow label="Salary" value={formatSalary(selectedJobDetail.salary_min, selectedJobDetail.salary_max)} />
                    <DetailRow label="Closes" value={formatDate(selectedJobDetail.expires_at)} />
                    <DetailRow label="Company" value={selectedJobDetail.employer.company_name} />
                    <DetailRow label="Industry" value={selectedJobDetail.industry || "Not specified"} />
                  </div>

                  <section className="insight-section">
                    <h4>AI fit summary</h4>
                    {selectedJobDetail.skill_gap.length > 0 ? (
                      <div className="gap-stack">
                        {selectedJobDetail.skill_gap.map((gap) => (
                          <article className="gap-card" key={`${selectedJobDetail.id}-${gap.skill}`}>
                            <div className="gap-card-top">
                              <strong>{gap.skill}</strong>
                              <span className={`soft-pill ${gap.importance === "required" ? "soft-pill-danger" : "soft-pill-neutral"}`}>
                                {formatEnumLabel(gap.importance)}
                              </span>
                            </div>
                            <p>
                              You are at level {gap.your_level}; this role asks for level {gap.required_level}.
                            </p>
                            {gap.resources.length > 0 ? (
                              <div className="resource-row">
                                {gap.resources.slice(0, 3).map((resource) => (
                                  <a
                                    className="resource-link"
                                    href={resource.url}
                                    key={resource.url}
                                    rel="noreferrer"
                                    target="_blank"
                                  >
                                    {resource.provider || "Learn"}: {resource.title}
                                  </a>
                                ))}
                              </div>
                            ) : (
                              <p className="helper-note">No linked resources yet for this gap.</p>
                            )}
                          </article>
                        ))}
                      </div>
                    ) : (
                      <div className="positive-callout">
                        <strong>Strong fit signal</strong>
                        <p className="muted-copy">
                          Your tracked skills currently cover the listed requirements for this job.
                        </p>
                      </div>
                    )}
                  </section>

                  <section className="insight-section">
                    <h4>Required skills</h4>
                    {selectedJobDetail.requirements.length > 0 ? (
                      <div className="requirement-stack">
                        {selectedJobDetail.requirements.map((requirement) => (
                          <div className="requirement-row" key={requirement.id}>
                            <div>
                              <strong>{requirement.skill.name}</strong>
                              <p>{requirement.skill.category || "General skill"}</p>
                            </div>
                            <div className="list-row-end">
                              <span className={`soft-pill ${requirement.importance === "required" ? "soft-pill-danger" : "soft-pill-neutral"}`}>
                                {formatEnumLabel(requirement.importance)}
                              </span>
                              <small>Level {requirement.minimum_proficiency}+ expected</small>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="muted-copy">This role does not have structured skill requirements yet.</p>
                    )}
                  </section>

                  <section className="insight-section">
                    <h4>Role snapshot</h4>
                    <p>{selectedJobDetail.description}</p>
                    {selectedJobDetail.responsibilities ? (
                      <p className="responsibility-copy">{selectedJobDetail.responsibilities}</p>
                    ) : null}
                  </section>

                  <section className="insight-section">
                    <h4>Quick apply</h4>
                    <TextAreaField
                      label="Cover letter"
                      name="cover_letter"
                      value={coverLetter}
                      onChange={(event) => setCoverLetter(event.target.value)}
                      placeholder="Add a short note about why this role fits your experience."
                    />
                    <div className="job-card-actions">
                      <button
                        className="primary-button"
                        type="button"
                        onClick={() => handleApply(selectedJobDetail.id)}
                        disabled={selectedJobAlreadyApplied || jobActionStatus !== "idle"}
                      >
                        {selectedJobAlreadyApplied
                          ? "Already applied"
                          : jobActionStatus === `applying-${selectedJobDetail.id}`
                            ? "Submitting..."
                            : "Apply now"}
                      </button>
                      <button
                        className="secondary-button"
                        type="button"
                        onClick={() => handleSaveToggle(selectedJobDetail)}
                        disabled={jobActionStatus !== "idle"}
                      >
                        {jobActionStatus === `saving-${selectedJobDetail.id}`
                          ? "Saving..."
                          : selectedJobIsSaved
                            ? "Saved to shortlist"
                            : "Save for later"}
                      </button>
                    </div>
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={handleCreateAlert}
                      disabled={selectedJobAlertExists || alertActionStatus === "saving"}
                    >
                      {selectedJobAlertExists
                        ? "Alert already active"
                        : alertActionStatus === "saving"
                          ? "Creating alert..."
                          : "Track similar jobs"}
                    </button>
                  </section>
                </div>
              ) : null}
            </aside>
          </section>
        ) : (
          <section className="jobs-board">
            {jobs.map((job) => (
              <article className="surface-card job-card" key={job.id}>
                <div className="job-card-top">
                  <div>
                    <span className="card-label">{formatEnumLabel(job.work_mode)}</span>
                    <h3>{job.title}</h3>
                    <p className="company-line">{job.employer_name}</p>
                  </div>
                  <span className="soft-pill">
                    {job.match_score == null ? "Public listing" : `${Math.round(Number(job.match_score))}% match`}
                  </span>
                </div>

                <p className="job-salary">{formatSalary(job.salary_min, job.salary_max)}</p>

                <div className="meta-row">
                  <span className="meta-chip">{job.location}</span>
                  <span className="meta-chip">{formatEnumLabel(job.job_type)}</span>
                  {job.industry ? <span className="meta-chip">{job.industry}</span> : null}
                  <span className="meta-chip">Closes {formatDate(job.expires_at)}</span>
                </div>

                <div className="job-card-footer">
                  <div className="subtle-metrics">
                    <span>{job.views_count} views</span>
                    <span>{job.applications_count} applications</span>
                  </div>
                  <div className="job-card-actions">
                    {isAuthenticated ? (
                      <NavLink className="secondary-button compact" to={dashboardPathForRole(user.role)}>
                        Continue in dashboard
                      </NavLink>
                    ) : (
                      <NavLink className="primary-button compact" to="/login">
                        Login to continue
                      </NavLink>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </section>
        )
      ) : null}
    </div>
  );
}

function SeekerDashboard() {
  const { user } = useAuth();
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    city: "",
    experience_years: 0,
    desired_title: "",
    preferred_location: "",
    education: "",
    bio: "",
    video_intro: "",
  });
  const [profileSaveStatus, setProfileSaveStatus] = useState("idle");
  const [profileSaveMessage, setProfileSaveMessage] = useState("");
  const [skillsCatalog, setSkillsCatalog] = useState([]);
  const [newSkillForm, setNewSkillForm] = useState({
    skill_id: "",
    proficiency: 3,
  });
  const [skillActionStatus, setSkillActionStatus] = useState("idle");
  const [skillActionMessage, setSkillActionMessage] = useState("");
  const [data, setData] = useState({
    profile: null,
    applications: [],
    notifications: [],
    jobs: [],
    savedJobs: [],
    skills: [],
    jobAlerts: [],
  });
  const [savedJobsStatus, setSavedJobsStatus] = useState("idle");
  const [savedJobsMessage, setSavedJobsMessage] = useState("");
  const [savedJobsTone, setSavedJobsTone] = useState("success");
  const [alertActionStatus, setAlertActionStatus] = useState("idle");
  const [alertActionMessage, setAlertActionMessage] = useState("");
  const [alertActionTone, setAlertActionTone] = useState("success");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setStatus("loading");
      setErrorMessage("");

      try {
        const [profile, applications, notifications, jobs, savedJobs, skills, allSkills, jobAlerts] = await Promise.all([
          apiRequest("/auth/seeker-profile/"),
          apiRequest("/applications/"),
          apiRequest("/notifications/"),
          apiRequest("/jobs/"),
          apiRequest("/jobs/saved/"),
          apiRequest("/seeker-skills/"),
          apiRequest("/skills/"),
          apiRequest("/job-alerts/"),
        ]);

        if (cancelled) {
          return;
        }

        setData({
          profile,
          applications,
          notifications,
          jobs,
          savedJobs,
          skills,
          jobAlerts,
        });
        setProfileForm({
          full_name: profile.full_name || user.full_name || "",
          city: profile.city || "",
          experience_years: Number(profile.experience_years || 0),
          desired_title: profile.desired_title || "",
          preferred_location: profile.preferred_location || "",
          education: profile.education || "",
          bio: profile.bio || "",
          video_intro: profile.video_intro || "",
        });
        setSkillsCatalog(Array.isArray(allSkills) ? allSkills : []);
        setStatus("ready");
      } catch (error) {
        if (cancelled) {
          return;
        }
        setErrorMessage(error.message || "Unable to load the seeker dashboard.");
        setStatus("error");
      }
    }

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") {
    return <DashboardLoading title="Loading seeker dashboard..." />;
  }

  if (status === "error") {
    return (
      <InlineStateCard
        title="Seeker dashboard failed to load"
        text="The authentication worked, but one of the dashboard requests failed."
        tone="error"
        details={errorMessage}
      />
    );
  }

  const recommendedJobs = [...data.jobs]
    .sort((left, right) => Number(right.match_score || 0) - Number(left.match_score || 0))
    .slice(0, 4);
  const selectedSkillIds = new Set(data.skills.map((entry) => entry.skill.id));
  const addableSkills = skillsCatalog.filter((item) => !selectedSkillIds.has(item.id));
  const learningRoadmap = buildLearningRoadmap(data.applications);

  const seekerMetrics = [
    {
      label: "Applications",
      value: String(data.applications.length),
      detail: "Jobs you have already applied to.",
    },
    {
      label: "Interviews",
      value: String(countScheduledInterviews(data.applications)),
      detail: "Interview events currently attached to your applications.",
    },
    {
      label: "Saved jobs",
      value: String(data.savedJobs.length),
      detail: "Roles saved for a later decision.",
    },
    {
      label: "Profile score",
      value: `${computeSeekerProfileCompletion(data.profile)}%`,
      detail: "How complete your seeker profile currently looks.",
    },
  ];

  function handleProfileFormChange(event) {
    const { name, value } = event.target;
    setProfileForm((current) => ({
      ...current,
      [name]: name === "experience_years" ? Number(value || 0) : value,
    }));
  }

  async function handleProfileSave(event) {
    event.preventDefault();
    setProfileSaveStatus("saving");
    setProfileSaveMessage("");
    try {
      const updatedProfile = await apiRequest("/auth/seeker-profile/", {
        method: "PATCH",
        body: profileForm,
      });
      setData((current) => ({
        ...current,
        profile: updatedProfile,
      }));
      setProfileSaveStatus("success");
      setProfileSaveMessage("Profile updated successfully.");
    } catch (error) {
      setProfileSaveStatus("error");
      setProfileSaveMessage(error.message || "Unable to update your profile right now.");
    }
  }

  function handleNewSkillChange(event) {
    const { name, value } = event.target;
    setNewSkillForm((current) => ({
      ...current,
      [name]: name === "proficiency" ? Number(value) : value,
    }));
  }

  async function handleAddSkill(event) {
    event.preventDefault();
    if (!newSkillForm.skill_id) {
      setSkillActionStatus("error");
      setSkillActionMessage("Please select a skill first.");
      return;
    }
    setSkillActionStatus("saving");
    setSkillActionMessage("");
    try {
      const created = await apiRequest("/seeker-skills/", {
        method: "POST",
        body: {
          skill_id: Number(newSkillForm.skill_id),
          proficiency: Number(newSkillForm.proficiency),
        },
      });
      setData((current) => ({
        ...current,
        skills: [...current.skills, created],
      }));
      setNewSkillForm({ skill_id: "", proficiency: 3 });
      setSkillActionStatus("success");
      setSkillActionMessage("Skill added.");
    } catch (error) {
      setSkillActionStatus("error");
      setSkillActionMessage(error.message || "Could not add this skill.");
    }
  }

  async function handleSkillProficiencyUpdate(skillEntryId, proficiency) {
    setSkillActionStatus("saving");
    setSkillActionMessage("");
    try {
      const updated = await apiRequest(`/seeker-skills/${skillEntryId}/`, {
        method: "PATCH",
        body: { proficiency: Number(proficiency) },
      });
      setData((current) => ({
        ...current,
        skills: current.skills.map((item) => (item.id === skillEntryId ? updated : item)),
      }));
      setSkillActionStatus("success");
      setSkillActionMessage("Skill level updated.");
    } catch (error) {
      setSkillActionStatus("error");
      setSkillActionMessage(error.message || "Could not update skill level.");
    }
  }

  async function handleSkillDelete(skillEntryId) {
    setSkillActionStatus("saving");
    setSkillActionMessage("");
    try {
      await apiRequest(`/seeker-skills/${skillEntryId}/`, {
        method: "DELETE",
      });
      setData((current) => ({
        ...current,
        skills: current.skills.filter((item) => item.id !== skillEntryId),
      }));
      setSkillActionStatus("success");
      setSkillActionMessage("Skill removed.");
    } catch (error) {
      setSkillActionStatus("error");
      setSkillActionMessage(error.message || "Could not remove this skill.");
    }
  }

  async function handleSavedJobToggle(jobId) {
    setSavedJobsStatus(`saving-${jobId}`);
    setSavedJobsMessage("");

    try {
      await apiRequest(`/jobs/${jobId}/save/`, {
        method: "POST",
      });
      setData((current) => ({
        ...current,
        savedJobs: current.savedJobs.filter((item) => item.id !== jobId),
      }));
      setSavedJobsTone("success");
      setSavedJobsMessage("Saved jobs updated.");
    } catch (error) {
      setSavedJobsTone("error");
      setSavedJobsMessage(error.message || "Could not update your saved jobs.");
    } finally {
      setSavedJobsStatus("idle");
    }
  }

  async function handleAlertToggle(alert) {
    setAlertActionStatus(`saving-${alert.id}`);
    setAlertActionMessage("");

    try {
      const updatedAlert = await apiRequest(`/job-alerts/${alert.id}/`, {
        method: "PATCH",
        body: {
          is_active: !alert.is_active,
        },
      });
      setData((current) => ({
        ...current,
        jobAlerts: current.jobAlerts.map((item) => (item.id === alert.id ? updatedAlert : item)),
      }));
      setAlertActionTone("success");
      setAlertActionMessage(updatedAlert.is_active ? "Alert enabled." : "Alert paused.");
    } catch (error) {
      setAlertActionTone("error");
      setAlertActionMessage(error.message || "Could not update that alert.");
    } finally {
      setAlertActionStatus("idle");
    }
  }

  async function handleAlertDelete(alertId) {
    setAlertActionStatus(`saving-${alertId}`);
    setAlertActionMessage("");

    try {
      await apiRequest(`/job-alerts/${alertId}/`, {
        method: "DELETE",
      });
      setData((current) => ({
        ...current,
        jobAlerts: current.jobAlerts.filter((item) => item.id !== alertId),
      }));
      setAlertActionTone("success");
      setAlertActionMessage("Alert removed.");
    } catch (error) {
      setAlertActionTone("error");
      setAlertActionMessage(error.message || "Could not remove that alert.");
    } finally {
      setAlertActionStatus("idle");
    }
  }

  return (
    <div className="page-stack">
      <DashboardHeader
        eyebrow="Job seeker dashboard"
        title={`Welcome back, ${user.full_name || user.email}.`}
        text="This workspace is focused on what matters to a candidate: profile quality, opportunities, applications, and signals about next actions."
        actionLabel="Explore jobs"
        actionHref="/jobs"
      />

      <section className="stats-grid">
        {seekerMetrics.map((item) => (
          <MetricCard key={item.label} label={item.label} value={item.value} detail={item.detail} />
        ))}
      </section>

      <section className="dashboard-grid">
        <SurfaceCard className="surface-card">
          <span className="card-label">Profile summary</span>
          <h3>{data.profile.full_name || user.full_name || user.email}</h3>
          <p className="muted-copy">
            {data.profile.desired_title || "Set your desired title to improve matching visibility."}
          </p>
          <div className="detail-list">
            <DetailRow label="City" value={data.profile.city || "Not added"} />
            <DetailRow label="Experience" value={`${data.profile.experience_years || 0} years`} />
            <DetailRow label="Preferred location" value={data.profile.preferred_location || "Not added"} />
            <DetailRow label="Education" value={truncateText(data.profile.education || "Not added", 80)} />
          </div>
        </SurfaceCard>

        <SurfaceCard className="surface-card accent-surface">
          <span className="card-label">Notifications</span>
          <h3>Recent updates for you</h3>
          <NotificationList notifications={data.notifications} emptyText="You have no notifications yet." />
        </SurfaceCard>
      </section>

      <section className="dashboard-grid">
        <SurfaceCard className="surface-card">
          <span className="card-label">Edit profile</span>
          <h3>Keep your candidate profile updated</h3>
          <form className="form-grid" onSubmit={handleProfileSave}>
            <FormField
              field={{
                label: "Full name",
                name: "full_name",
                value: profileForm.full_name,
                onChange: handleProfileFormChange,
                placeholder: "Your full name",
              }}
            />
            <FormField
              field={{
                label: "Current city",
                name: "city",
                value: profileForm.city,
                onChange: handleProfileFormChange,
                placeholder: "Kathmandu",
              }}
            />
            <FormField
              field={{
                label: "Experience (years)",
                name: "experience_years",
                type: "number",
                value: String(profileForm.experience_years),
                onChange: handleProfileFormChange,
                placeholder: "2",
              }}
            />
            <FormField
              field={{
                label: "Desired title",
                name: "desired_title",
                value: profileForm.desired_title,
                onChange: handleProfileFormChange,
                placeholder: "Frontend Developer",
              }}
            />
            <FormField
              field={{
                label: "Preferred location",
                name: "preferred_location",
                value: profileForm.preferred_location,
                onChange: handleProfileFormChange,
                placeholder: "Remote",
              }}
            />
            <FormField
              field={{
                label: "Education",
                name: "education",
                value: profileForm.education,
                onChange: handleProfileFormChange,
                placeholder: "BSc CSIT",
              }}
            />
            <FormField
              field={{
                label: "Bio",
                name: "bio",
                value: profileForm.bio,
                onChange: handleProfileFormChange,
                placeholder: "Short summary about your background",
                className: "field-wide",
              }}
            />
            <FormField
              field={{
                label: "Video intro URL",
                name: "video_intro",
                value: profileForm.video_intro,
                onChange: handleProfileFormChange,
                placeholder: "https://...",
                className: "field-wide",
              }}
            />
            {profileSaveMessage ? (
              <InlineMessage
                tone={profileSaveStatus === "error" ? "error" : "success"}
                text={profileSaveMessage}
              />
            ) : null}
            <div className="panel-actions form-actions-full">
              <button className="primary-button" type="submit" disabled={profileSaveStatus === "saving"}>
                {profileSaveStatus === "saving" ? "Saving profile..." : "Save profile"}
              </button>
            </div>
          </form>
        </SurfaceCard>

        <SurfaceCard className="surface-card">
          <span className="card-label">Manage skills</span>
          <h3>Add or update your skills</h3>
          <form className="form-grid single-column-form" onSubmit={handleAddSkill}>
            <SelectField
              label="Add skill"
              name="skill_id"
              value={newSkillForm.skill_id}
              onChange={handleNewSkillChange}
              options={[
                { value: "", label: addableSkills.length ? "Select skill" : "No additional skills available" },
                ...addableSkills.map((item) => ({ value: String(item.id), label: item.name })),
              ]}
            />
            <SelectField
              label="Proficiency"
              name="proficiency"
              value={String(newSkillForm.proficiency)}
              onChange={handleNewSkillChange}
              options={[
                { value: "1", label: "1 - Beginner" },
                { value: "2", label: "2 - Basic" },
                { value: "3", label: "3 - Intermediate" },
                { value: "4", label: "4 - Advanced" },
                { value: "5", label: "5 - Expert" },
              ]}
            />
            <div className="panel-actions">
              <button
                className="primary-button"
                type="submit"
                disabled={!addableSkills.length || skillActionStatus === "saving"}
              >
                Add skill
              </button>
            </div>
          </form>

          {skillActionMessage ? (
            <InlineMessage
              tone={skillActionStatus === "error" ? "error" : "success"}
              text={skillActionMessage}
            />
          ) : null}

          {data.skills.length > 0 ? (
            <div className="skill-stack">
              {data.skills.map((item) => (
                <div className="skill-row" key={item.id}>
                  <div>
                    <strong>{item.skill.name}</strong>
                    <p>{item.skill.category || "General skill"}</p>
                  </div>
                  <div className="list-row-end">
                    <select
                      value={String(item.proficiency)}
                      onChange={(event) => handleSkillProficiencyUpdate(item.id, event.target.value)}
                    >
                      <option value="1">Level 1</option>
                      <option value="2">Level 2</option>
                      <option value="3">Level 3</option>
                      <option value="4">Level 4</option>
                      <option value="5">Level 5</option>
                    </select>
                    <button
                      className="secondary-button compact"
                      type="button"
                      onClick={() => handleSkillDelete(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted-copy">No skills added yet. Add your first skill above.</p>
          )}
        </SurfaceCard>
      </section>

      <section className="dashboard-grid">
        <SurfaceCard className="surface-card">
          <span className="card-label">Recommended jobs</span>
          <h3>Best current opportunities</h3>
          {recommendedJobs.length > 0 ? (
            <div className="list-stack">
              {recommendedJobs.map((job) => (
                <div className="list-row" key={job.id}>
                  <div>
                    <strong>{job.title}</strong>
                    <p>{job.employer_name}</p>
                  </div>
                  <div className="list-row-end">
                    <span className={`soft-pill ${matchToneClass(job.match_score)}`}>
                      {job.match_score == null ? "Public listing" : `${Math.round(Number(job.match_score))}% match`}
                    </span>
                    <small>{job.location}</small>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted-copy">No approved jobs are available for recommendation yet.</p>
          )}
        </SurfaceCard>

        <SurfaceCard className="surface-card">
          <span className="card-label">Saved jobs</span>
          <h3>Your shortlist</h3>
          {savedJobsMessage ? (
            <InlineMessage tone={savedJobsTone} text={savedJobsMessage} />
          ) : null}
          {data.savedJobs.length > 0 ? (
            <div className="list-stack">
              {data.savedJobs.map((job) => (
                <div className="list-row" key={job.id}>
                  <div>
                    <strong>{job.title}</strong>
                    <p>{job.employer_name}</p>
                  </div>
                  <div className="list-row-end">
                    <span className={`soft-pill ${matchToneClass(job.match_score)}`}>
                      {job.match_score == null ? "Saved" : `${Math.round(Number(job.match_score))}% match`}
                    </span>
                    <div className="button-group-compact">
                      <NavLink className="secondary-button compact" to="/jobs">
                        Open jobs
                      </NavLink>
                      <button
                        className="secondary-button compact"
                        type="button"
                        onClick={() => handleSavedJobToggle(job.id)}
                        disabled={savedJobsStatus !== "idle"}
                      >
                        {savedJobsStatus === `saving-${job.id}` ? "Removing..." : "Remove"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted-copy">You have not saved any jobs yet. Use the AI Match Lab on the jobs page to build a shortlist.</p>
          )}
        </SurfaceCard>
      </section>

      <section className="dashboard-grid">
        <SurfaceCard className="surface-card">
          <span className="card-label">Skill inventory</span>
          <h3>Your tracked skills</h3>
          {data.skills.length > 0 ? (
            <div className="skill-stack">
              {data.skills.slice(0, 6).map((item) => (
                <div className="skill-row" key={item.id}>
                  <div>
                    <strong>{item.skill.name}</strong>
                    <p>{item.skill.category || "General skill"}</p>
                  </div>
                  <span className="soft-pill">Level {item.proficiency}/5</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted-copy">No seeker skills have been added yet.</p>
          )}
        </SurfaceCard>

        <SurfaceCard className="surface-card accent-surface">
          <span className="card-label">Job alerts</span>
          <h3>Searches you are tracking</h3>
          {alertActionMessage ? (
            <InlineMessage tone={alertActionTone} text={alertActionMessage} />
          ) : null}
          {data.jobAlerts.length > 0 ? (
            <div className="list-stack">
              {data.jobAlerts.map((alert) => (
                <div className="list-row block-row" key={alert.id}>
                  <div>
                    <strong>{formatJobAlertTitle(alert)}</strong>
                    <p>{formatJobAlertSummary(alert)}</p>
                  </div>
                  <div className="list-row-end">
                    <span className={alert.is_active ? "soft-pill soft-pill-success" : "soft-pill soft-pill-neutral"}>
                      {alert.is_active ? "Active" : "Paused"}
                    </span>
                    <div className="button-group-compact">
                      <button
                        className="secondary-button compact"
                        type="button"
                        onClick={() => handleAlertToggle(alert)}
                        disabled={alertActionStatus !== "idle"}
                      >
                        {alertActionStatus === `saving-${alert.id}` ? "Updating..." : alert.is_active ? "Pause" : "Resume"}
                      </button>
                      <button
                        className="secondary-button compact"
                        type="button"
                        onClick={() => handleAlertDelete(alert.id)}
                        disabled={alertActionStatus !== "idle"}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted-copy">No alerts yet. Create one from a job inside the AI Match Lab on the jobs board.</p>
          )}
        </SurfaceCard>
      </section>

      <section className="dashboard-grid">
        <SurfaceCard className="surface-card spotlight-surface">
          <span className="card-label">Learning roadmap</span>
          <h3>Most common skill gaps from your applications</h3>
          {learningRoadmap.length > 0 ? (
            <div className="gap-stack">
              {learningRoadmap.map((item) => (
                <article className="gap-card" key={item.skill}>
                  <div className="gap-card-top">
                    <strong>{item.skill}</strong>
                    <span className={`soft-pill ${item.requiredCount > 0 ? "soft-pill-danger" : "soft-pill-neutral"}`}>
                      {item.requiredCount > 0 ? "Required gap" : "Nice-to-have gap"}
                    </span>
                  </div>
                  <p>
                    Missing across {item.count} application{item.count === 1 ? "" : "s"}.
                    Highest target level: {item.maxRequiredLevel}.
                  </p>
                  {item.resources.length > 0 ? (
                    <div className="resource-row">
                      {item.resources.map((resource) => (
                        <a
                          className="resource-link"
                          href={resource.url}
                          key={resource.url}
                          rel="noreferrer"
                          target="_blank"
                        >
                          {resource.provider || "Learn"}: {resource.title}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="helper-note">No linked learning resources yet for this skill.</p>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <p className="muted-copy">
              Apply to jobs with structured requirements and your personalized learning roadmap will start building itself here.
            </p>
          )}
        </SurfaceCard>

        <SurfaceCard className="surface-card">
          <span className="card-label">Application timeline</span>
          <h3>Your latest applications</h3>
          {data.applications.length > 0 ? (
            <div className="list-stack">
              {data.applications.map((application) => (
                <div className="list-row" key={application.id}>
                  <div>
                    <strong>{application.job_title}</strong>
                    <p>{application.employer_name}</p>
                  </div>
                  <div className="list-row-end">
                    <span className={`soft-pill ${statusToneClass(application.status)}`}>
                      {formatEnumLabel(application.status)}
                    </span>
                    <small>{formatDateTime(application.created_at)}</small>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted-copy">You have not applied to any jobs yet.</p>
          )}
        </SurfaceCard>
      </section>
    </div>
  );
}

function EmployerDashboard() {
  const { user } = useAuth();
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [data, setData] = useState({
    profile: null,
    jobs: [],
    applications: [],
    notifications: [],
  });

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setStatus("loading");
      setErrorMessage("");

      try {
        const [profile, jobs, applications, notifications] = await Promise.all([
          apiRequest("/auth/employer-profile/"),
          apiRequest("/jobs/?scope=mine"),
          apiRequest("/applications/"),
          apiRequest("/notifications/"),
        ]);

        if (cancelled) {
          return;
        }

        setData({
          profile,
          jobs,
          applications,
          notifications,
        });
        setStatus("ready");
      } catch (error) {
        if (cancelled) {
          return;
        }
        setErrorMessage(error.message || "Unable to load the employer dashboard.");
        setStatus("error");
      }
    }

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") {
    return <DashboardLoading title="Loading employer dashboard..." />;
  }

  if (status === "error") {
    return (
      <InlineStateCard
        title="Employer dashboard failed to load"
        text="The account is valid, but one of the employer dashboard requests did not complete."
        tone="error"
        details={errorMessage}
      />
    );
  }

  const employerMetrics = [
    {
      label: "My jobs",
      value: String(data.jobs.length),
      detail: "All roles created under your employer account.",
    },
    {
      label: "Pending review",
      value: String(data.jobs.filter((job) => job.status === "pending").length),
      detail: "Jobs still waiting for admin approval.",
    },
    {
      label: "Applicants",
      value: String(data.applications.length),
      detail: "Applications submitted across your roles.",
    },
    {
      label: "Interviews",
      value: String(countScheduledInterviews(data.applications)),
      detail: "Interview events scheduled for your applicants.",
    },
  ];

  const strongestApplicants = [...data.applications]
    .sort((left, right) => Number(right.match_score || 0) - Number(left.match_score || 0))
    .slice(0, 5);

  return (
    <div className="page-stack">
      <DashboardHeader
        eyebrow="Employer dashboard"
        title={`Hiring workspace for ${data.profile.company_name || user.email}`}
        text="Use this dashboard to track live jobs, incoming applicants, and the health of your hiring pipeline."
        actionLabel="Browse public jobs"
        actionHref="/jobs"
      />

      <section className="stats-grid">
        {employerMetrics.map((item) => (
          <MetricCard key={item.label} label={item.label} value={item.value} detail={item.detail} />
        ))}
      </section>

      <section className="dashboard-grid">
        <SurfaceCard className="surface-card">
          <span className="card-label">Company profile</span>
          <h3>{data.profile.company_name}</h3>
          <p className="muted-copy">{data.profile.about || "Add a richer employer profile to strengthen trust with applicants."}</p>
          <div className="detail-list">
            <DetailRow label="Industry" value={data.profile.industry || "Not added"} />
            <DetailRow label="Location" value={data.profile.location || "Not added"} />
            <DetailRow label="Website" value={data.profile.website || "Not added"} />
            <DetailRow label="Verification" value={data.profile.is_verified ? "Verified" : "Pending verification"} />
          </div>
        </SurfaceCard>

        <SurfaceCard className="surface-card accent-surface">
          <span className="card-label">Employer notifications</span>
          <h3>Recent updates</h3>
          <NotificationList notifications={data.notifications} emptyText="No employer notifications yet." />
        </SurfaceCard>
      </section>

      <section className="dashboard-grid">
        <SurfaceCard className="surface-card">
          <span className="card-label">My job posts</span>
          <h3>Current job activity</h3>
          {data.jobs.length > 0 ? (
            <div className="list-stack">
              {data.jobs.map((job) => (
                <div className="list-row" key={job.id}>
                  <div>
                    <strong>{job.title}</strong>
                    <p>{job.location}</p>
                  </div>
                  <div className="list-row-end">
                    <span className={`soft-pill ${statusToneClass(job.status)}`}>
                      {formatEnumLabel(job.status)}
                    </span>
                    <small>{job.applications_count} applications</small>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted-copy">You have not created any jobs yet.</p>
          )}
        </SurfaceCard>

        <SurfaceCard className="surface-card">
          <span className="card-label">Top applicants</span>
          <h3>Best current candidate signals</h3>
          {strongestApplicants.length > 0 ? (
            <div className="list-stack">
              {strongestApplicants.map((application) => (
                <div className="list-row" key={application.id}>
                  <div>
                    <strong>{application.seeker_name}</strong>
                    <p>{application.job_title}</p>
                  </div>
                  <div className="list-row-end">
                    <span className="soft-pill">
                      {Math.round(Number(application.match_score || 0))}% match
                    </span>
                    <small>{formatEnumLabel(application.status)}</small>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted-copy">No applicants have come in yet.</p>
          )}
        </SurfaceCard>
      </section>
    </div>
  );
}

function AdminDashboard() {
  const { user } = useAuth();
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [data, setData] = useState({
    jobs: [],
    applications: [],
    notifications: [],
    skills: [],
  });

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setStatus("loading");
      setErrorMessage("");

      try {
        const [jobs, applications, notifications, skills] = await Promise.all([
          apiRequest("/jobs/"),
          apiRequest("/applications/"),
          apiRequest("/notifications/"),
          apiRequest("/skills/"),
        ]);

        if (cancelled) {
          return;
        }

        setData({
          jobs,
          applications,
          notifications,
          skills,
        });
        setStatus("ready");
      } catch (error) {
        if (cancelled) {
          return;
        }
        setErrorMessage(error.message || "Unable to load the admin dashboard.");
        setStatus("error");
      }
    }

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") {
    return <DashboardLoading title="Loading admin dashboard..." />;
  }

  if (status === "error") {
    return (
      <InlineStateCard
        title="Admin dashboard failed to load"
        text="The admin account is valid, but one of the moderation requests failed."
        tone="error"
        details={errorMessage}
      />
    );
  }

  const pendingJobs = data.jobs.filter((job) => job.status === "pending");
  const approvedJobs = data.jobs.filter((job) => job.status === "approved");
  const recentApplications = [...data.applications]
    .sort((left, right) => new Date(right.created_at) - new Date(left.created_at))
    .slice(0, 5);

  const adminMetrics = [
    {
      label: "Pending jobs",
      value: String(pendingJobs.length),
      detail: "Roles waiting for moderation review.",
    },
    {
      label: "Approved jobs",
      value: String(approvedJobs.length),
      detail: "Listings currently approved on the platform.",
    },
    {
      label: "Applications",
      value: String(data.applications.length),
      detail: "Applications across the full platform.",
    },
    {
      label: "Skills",
      value: String(data.skills.length),
      detail: "Items in the platform skill library.",
    },
  ];

  return (
    <div className="page-stack">
      <DashboardHeader
        eyebrow="Admin dashboard"
        title={`Platform operations for ${user.email}`}
        text="This workspace is for moderation, oversight, and operational visibility across the whole portal."
        actionLabel="View public jobs"
        actionHref="/jobs"
      />

      <section className="stats-grid">
        {adminMetrics.map((item) => (
          <MetricCard key={item.label} label={item.label} value={item.value} detail={item.detail} />
        ))}
      </section>

      <section className="dashboard-grid">
        <SurfaceCard className="surface-card">
          <span className="card-label">Moderation queue</span>
          <h3>Jobs waiting for review</h3>
          {pendingJobs.length > 0 ? (
            <div className="list-stack">
              {pendingJobs.map((job) => (
                <div className="list-row" key={job.id}>
                  <div>
                    <strong>{job.title}</strong>
                    <p>{job.employer_name}</p>
                  </div>
                  <div className="list-row-end">
                    <span className={`soft-pill ${statusToneClass(job.status)}`}>
                      {formatEnumLabel(job.status)}
                    </span>
                    <small>{job.location}</small>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted-copy">There are no pending jobs to review right now.</p>
          )}
        </SurfaceCard>

        <SurfaceCard className="surface-card accent-surface">
          <span className="card-label">Admin notifications</span>
          <h3>Latest operational signals</h3>
          <NotificationList notifications={data.notifications} emptyText="No admin notifications yet." />
        </SurfaceCard>
      </section>

      <section className="dashboard-grid">
        <SurfaceCard className="surface-card">
          <span className="card-label">Recent applications</span>
          <h3>Cross-platform hiring activity</h3>
          {recentApplications.length > 0 ? (
            <div className="list-stack">
              {recentApplications.map((application) => (
                <div className="list-row" key={application.id}>
                  <div>
                    <strong>{application.seeker_name}</strong>
                    <p>{application.job_title}</p>
                  </div>
                  <div className="list-row-end">
                    <span className={`soft-pill ${statusToneClass(application.status)}`}>
                      {formatEnumLabel(application.status)}
                    </span>
                    <small>{formatDateTime(application.created_at)}</small>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted-copy">No applications have been submitted yet.</p>
          )}
        </SurfaceCard>

        <SurfaceCard className="surface-card">
          <span className="card-label">Skill library</span>
          <h3>Current taxonomy snapshot</h3>
          {data.skills.length > 0 ? (
            <div className="skill-stack">
              {data.skills.slice(0, 6).map((skill) => (
                <div className="skill-row" key={skill.id}>
                  <div>
                    <strong>{skill.name}</strong>
                    <p>{skill.category || "Uncategorized"}</p>
                  </div>
                  <span className="soft-pill">
                    {skill.resources.length} resource{skill.resources.length === 1 ? "" : "s"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted-copy">The skill library is currently empty.</p>
          )}
        </SurfaceCard>
      </section>
    </div>
  );
}

function DashboardHeader({ eyebrow, title, text, actionLabel, actionHref }) {
  return (
    <section className="surface-card dashboard-hero">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
      {actionLabel && actionHref ? (
        <div className="dashboard-hero-actions">
          <NavLink className="primary-button" to={actionHref}>
            {actionLabel}
          </NavLink>
        </div>
      ) : null}
    </section>
  );
}

function NotificationList({ notifications, emptyText }) {
  if (!notifications.length) {
    return <p className="muted-copy">{emptyText}</p>;
  }

  return (
    <div className="list-stack">
      {notifications.slice(0, 5).map((item) => (
        <div className="list-row block-row" key={item.id}>
          <div>
            <strong>{item.title}</strong>
            <p>{item.message}</p>
          </div>
          <div className="list-row-end">
            <span className={item.is_read ? "soft-pill soft-pill-neutral" : "soft-pill"}>
              {item.is_read ? "Read" : "Unread"}
            </span>
            <small>{formatDateTime(item.created_at)}</small>
          </div>
        </div>
      ))}
    </div>
  );
}

function SkeletonBoard() {
  return (
    <section className="jobs-board">
      {Array.from({ length: 4 }).map((_, index) => (
        <div className="surface-card skeleton-card" key={index}>
          <div className="skeleton-line skeleton-line-title" />
          <div className="skeleton-line" />
          <div className="skeleton-line" />
          <div className="skeleton-chip-row">
            <span className="skeleton-chip" />
            <span className="skeleton-chip" />
          </div>
        </div>
      ))}
    </section>
  );
}

function DashboardLoading({ title }) {
  return (
    <div className="page-stack">
      <InlineStateCard
        title={title}
        text="Pulling live data from the backend and preparing the dashboard."
        tone="neutral"
      />
      <SkeletonBoard />
    </div>
  );
}

function FullScreenLoader({ message }) {
  return (
    <div className="full-screen-loader">
      <div className="loader-card">
        <span className="live-dot" />
        <strong>{message}</strong>
      </div>
    </div>
  );
}

function InlineStateCard({ title, text, tone, details, action }) {
  return (
    <section className={`surface-card state-card state-${tone}`}>
      <h3>{title}</h3>
      <p className="muted-copy">{text}</p>
      {details ? <p className="inline-message inline-message-error">{details}</p> : null}
      {action ? <div className="panel-actions">{action}</div> : null}
    </section>
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

function MetricCard({ label, value, detail }) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

function FormField({ field }) {
  return (
    <label className={`field-shell ${field.className || ""}`.trim()}>
      <span>{field.label}</span>
      <input
        name={field.name}
        onChange={field.onChange}
        placeholder={field.placeholder}
        type={field.type || "text"}
        value={field.value}
      />
    </label>
  );
}

function TextAreaField({ label, name, onChange, placeholder, value, className }) {
  return (
    <label className={`field-shell ${className || ""}`.trim()}>
      <span>{label}</span>
      <textarea
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        value={value}
      />
    </label>
  );
}

function SelectField({ label, name, onChange, options, value }) {
  return (
    <label className="field-shell">
      <span>{label}</span>
      <select name={name} onChange={onChange} value={value}>
        {options.map((option) => (
          <option key={`${name}-${option.value || "blank"}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="detail-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function InlineMessage({ text, tone }) {
  return (
    <p
      className={`inline-message ${
        tone === "error"
          ? "inline-message-error"
          : tone === "success"
            ? "inline-message-success"
            : ""
      }`}
    >
      {text}
    </p>
  );
}

function resolvePostAuthDestination(user, requestedPath) {
  if (
    requestedPath &&
    requestedPath !== "/login" &&
    requestedPath !== "/register" &&
    requestedPath !== "/dashboard"
  ) {
    return requestedPath;
  }
  return dashboardPathForRole(user.role);
}

function splitFullName(value) {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) {
    return { firstName: "", lastName: "" };
  }
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
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
  const blindHiring = jobs.filter((job) => job.blind_hiring).length;

  return [
    {
      label: "Live roles",
      value: String(jobs.length),
      detail: "Public listings returned by the backend.",
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
      label: "Blind hiring",
      value: String(blindHiring),
      detail: "Listings currently using blind hiring mode.",
    },
  ];
}

function computeSeekerProfileCompletion(profile) {
  if (!profile) {
    return 0;
  }

  const checks = [
    Boolean(profile.full_name),
    Boolean(profile.city),
    Boolean(profile.experience_years),
    Boolean(profile.bio),
    Boolean(profile.education),
    Boolean(profile.desired_title),
    Boolean(profile.preferred_location),
    Boolean(profile.video_intro),
    Boolean(profile.resume_url || profile.resume),
  ];
  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
}

function countScheduledInterviews(applications) {
  return applications.reduce(
    (total, application) => total + (application.interviews ? application.interviews.length : 0),
    0,
  );
}

function readableRole(value) {
  return formatEnumLabel(value);
}

function statusToneClass(status) {
  if (status === "approved" || status === "hired") {
    return "soft-pill-success";
  }
  if (status === "pending" || status === "applied") {
    return "soft-pill-neutral";
  }
  if (status === "shortlisted" || status === "interview_scheduled") {
    return "soft-pill-info";
  }
  if (status === "rejected") {
    return "soft-pill-danger";
  }
  return "";
}

function matchToneClass(score) {
  if (score == null) {
    return "soft-pill-neutral";
  }
  const numericScore = Number(score || 0);
  if (numericScore >= 80) {
    return "soft-pill-success";
  }
  if (numericScore >= 60) {
    return "soft-pill-info";
  }
  if (numericScore > 0) {
    return "soft-pill-neutral";
  }
  return "soft-pill-danger";
}

function formatEnumLabel(value) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function createJobSummary(job) {
  return {
    id: job.id,
    title: job.title,
    slug: job.slug,
    employer_name: job.employer_name || job.employer?.company_name || "Employer",
    location: job.location,
    industry: job.industry,
    salary_min: job.salary_min,
    salary_max: job.salary_max,
    job_type: job.job_type,
    work_mode: job.work_mode,
    status: job.status,
    blind_hiring: job.blind_hiring,
    expires_at: job.expires_at,
    views_count: job.views_count || 0,
    applications_count: job.applications_count || 0,
    match_score: job.match_score,
  };
}

function alertsMatchJob(alert, job) {
  const keyword = (alert.keywords || "").trim().toLowerCase();
  const jobTitle = (job.title || "").trim().toLowerCase();
  const location = (alert.location || "").trim().toLowerCase();
  const jobLocation = (job.location || "").trim().toLowerCase();
  const alertIndustry = (alert.industry || "").trim().toLowerCase();
  const jobIndustry = (job.industry || "").trim().toLowerCase();

  return (
    keyword === jobTitle &&
    location === jobLocation &&
    (alert.job_type || "") === (job.job_type || "") &&
    alertIndustry === jobIndustry
  );
}

function formatJobAlertTitle(alert) {
  return alert.keywords || alert.industry || alert.location || "Custom alert";
}

function formatJobAlertSummary(alert) {
  const pieces = [];
  if (alert.location) {
    pieces.push(alert.location);
  }
  if (alert.job_type) {
    pieces.push(formatEnumLabel(alert.job_type));
  }
  if (alert.industry) {
    pieces.push(alert.industry);
  }
  if (alert.salary_min != null || alert.salary_max != null) {
    pieces.push(formatSalary(alert.salary_min, alert.salary_max));
  }
  return pieces.length ? pieces.join(" • ") : "No filter details saved";
}

function buildLearningRoadmap(applications) {
  const roadmap = new Map();

  applications.forEach((application) => {
    (application.skill_gap_summary || []).forEach((gap) => {
      const existing = roadmap.get(gap.skill) || {
        skill: gap.skill,
        count: 0,
        requiredCount: 0,
        maxRequiredLevel: 0,
        resources: [],
      };
      existing.count += 1;
      if (gap.importance === "required") {
        existing.requiredCount += 1;
      }
      existing.maxRequiredLevel = Math.max(existing.maxRequiredLevel, Number(gap.required_level || 0));
      existing.resources = mergeRoadmapResources(existing.resources, gap.resources || []);
      roadmap.set(gap.skill, existing);
    });
  });

  return [...roadmap.values()]
    .sort((left, right) => {
      if (right.requiredCount !== left.requiredCount) {
        return right.requiredCount - left.requiredCount;
      }
      if (right.count !== left.count) {
        return right.count - left.count;
      }
      return left.skill.localeCompare(right.skill);
    })
    .slice(0, 4);
}

function mergeRoadmapResources(existingResources, incomingResources) {
  const merged = [...existingResources];
  incomingResources.forEach((resource) => {
    if (!merged.some((item) => item.url === resource.url)) {
      merged.push(resource);
    }
  });
  return merged.slice(0, 3);
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

function formatDateTime(value) {
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

function truncateText(value, maxLength) {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength - 1)}...`;
}

export default App;
