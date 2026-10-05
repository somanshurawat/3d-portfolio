// Single source of truth: edit your details here. The page, the chatbot and the server all read this file.
export const profile = {
  name: 'Somanshu Rawat',
  first: 'Somanshu',
  last: 'Rawat',
  initials: ['S', 'R'],
  email: 'somanshurawat@gmail.com',
  phone: '+91 88510 38623',
  location: 'New Delhi, India',
  // Put your PDF in /public (e.g. public/resume.pdf) and set resumeUrl: '/resume.pdf'
  resumeUrl: '',
  links: {
    github: 'https://github.com/somanshurawat',
    linkedin: 'https://www.linkedin.com/in/somanshu-rawat-1521a0238/',
    instagram: 'https://www.instagram.com/isthat_somanshu/?hl=en',
  },
  roles: ['Software Engineer | Full Stack Developer', 'Node.js & PostgreSQL Builder', 'Dashboard & Data Enthusiast'],
  // Used to calculate "years of experience" automatically (month is 0-based: 5 = June)
  careerStart: { year: 2024, month: 5 },
}

export const experience = [
  { role: 'Consultant', period: 'Dec 2025 – Present', bullets: ['Delivering enterprise web solutions for client projects', 'Working on multi-tenant architecture and database optimization', 'Collaborating with cross-functional teams to ship reliable features'] },
  { role: 'Full Stack Developer', period: 'Jun 2024 – Dec 2025', bullets: ['Built and maintained web applications with Node.js and PostgreSQL / SQL Server', 'Developed responsive dashboards and data-heavy interfaces', 'Improved performance and code maintainability across projects'] },
]

export const skills = [
  { name: 'HTML5', icon: 'html5', color: '#E34F26', group: 'Frontend' },
  { name: 'CSS3', icon: 'css', color: '#1572B6', group: 'Frontend' },
  { name: 'JavaScript', icon: 'javascript', color: '#F7DF1E', group: 'Frontend' },
  { name: 'jQuery', icon: 'jquery', color: '#0769AD', group: 'Frontend' },
  { name: 'Bootstrap', icon: 'bootstrap', color: '#7952B3', group: 'Frontend' },
  { name: 'React', icon: 'react', color: '#61DAFB', group: 'Frontend' },
  { name: 'Node.js', icon: 'nodedotjs', color: '#5FA04E', group: 'Backend & Data' },
  { name: 'PostgreSQL', icon: 'postgresql', color: '#4169E1', group: 'Backend & Data' },
  { name: 'SQL Server', icon: 'mssql', color: '#CC2927', group: 'Backend & Data' },
  { name: 'Git', icon: 'git', color: '#F05032', group: 'Tools' },
]
export const skillGroups = ['All', 'Frontend', 'Backend & Data', 'Tools']

// Projects are described by the problem they solve. visual: bars | map | tiles
export const projects = [
  { title: 'Keeping equipment running before it breaks', desc: 'Schedules preventive maintenance and tracks every asset, so teams across multiple organizations can plan work and avoid unplanned downtime.', features: ['Preventive maintenance scheduling', 'Asset tracking and management', 'Multi-tenant support for several organizations'], tags: ['Node.js', 'PostgreSQL', 'Bootstrap', 'DataTables'], visual: 'bars' },
  { title: 'Responding to incidents faster', desc: 'Records, tracks and analyzes incidents in one place, with live dashboards and role-based access so the right people act on them quickly.', features: ['Incident tracking and reporting', 'Analytics and live dashboards', 'Role-based access control'], tags: ['Node.js', 'SQL Server', 'Leaflet', 'Chart.js'], visual: 'map' },
  { title: 'Seeing operations at a glance', desc: 'Brings live data onto interactive maps and charts, with filters that let teams spot problems and make decisions in real time.', features: ['Real-time monitoring', 'Interactive maps and charts', 'Advanced filtering'], tags: ['Node.js', 'ApexCharts', 'Bootstrap', 'PostgreSQL'], visual: 'tiles' },
]

export const repos = [
  { name: 'somanshu-project', desc: 'A front-end project built with HTML.', lang: 'HTML', color: '#e34c26' },
  { name: 'spotify-clone', desc: 'A Spotify clone built with HTML and CSS.', lang: 'HTML', color: '#e34c26' },
  { name: 'simon-says-', desc: 'A Simon Says memory game built with JavaScript.', lang: 'JavaScript', color: '#f1e05a' },
  { name: 'spotify', desc: 'Spotify clone using HTML and CSS.', lang: 'HTML', color: '#e34c26' },
  { name: 'demo', desc: 'A demo project built with HTML.', lang: 'HTML', color: '#e34c26' },
  { name: 'demo-', desc: 'A demo repository.', lang: '', color: '' },
]

export const techStrip = ['Node.js', 'PostgreSQL', 'SQL Server', 'React', 'Bootstrap', 'jQuery', 'DataTables', 'Leaflet', 'Chart.js', 'ApexCharts', 'Git']

// Facts the chatbot is allowed to use (also sent to OpenAI as its instructions)
export const KB = `${profile.name} is a Software Engineer / Full Stack Developer based in ${profile.location}, open to opportunities.
Experience: ${experience.map((e) => `${e.role} (${e.period})`).join('; ')}.
Skills: ${skills.map((s) => s.name).join(', ')}.
Projects (by the problem they solve): ${projects.map((p) => `${p.title.toLowerCase()} (${p.desc})`).join('; ')}
GitHub (github.com/somanshurawat): ${repos.map((r) => r.name).join(', ')}.
Contact: ${profile.email}, ${profile.phone}, LinkedIn linkedin.com/in/somanshu-rawat-1521a0238, Instagram isthat_somanshu.`

// "What I do" cards in the 3D story
export const capabilities = [
  { title: 'Full-Stack Development', desc: 'Responsive, data-heavy web apps from the interface to the API.' },
  { title: 'Backend Systems', desc: 'Node.js services that stay reliable as projects and users grow.' },
  { title: 'Database Architecture', desc: 'PostgreSQL and SQL Server, including multi-tenant design and query optimization.' },
  { title: 'Dashboards & Data', desc: 'Interactive maps, charts and filters with Leaflet, Chart.js and ApexCharts.' },
]
