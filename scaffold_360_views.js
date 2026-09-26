import fs from 'fs';
import path from 'path';

const pagesDir = path.join(process.cwd(), 'src/pages');

const client360Content = "import React from 'react';\n" +
"import { useParams } from 'react-router-dom';\n" +
"import { useQuery } from '@tanstack/react-query';\n" +
"import { api } from '../../services/api';\n" +
"import { TableSkeleton } from '../../components/feedback/LoadingSkeleton';\n\n" +
"const fetchClient360 = async (id) => {\n" +
"  const [clientRes, projectsRes, invoicesRes, ticketsRes] = await Promise.all([\n" +
"    api.get('/clients/' + id),\n" +
"    api.get('/projects?clientId=' + id).catch(() => ({ data: [] })),\n" +
"    api.get('/invoices?clientId=' + id).catch(() => ({ data: [] })),\n" +
"    api.get('/tickets?clientId=' + id).catch(() => ({ data: [] }))\n" +
"  ]);\n" +
"  return {\n" +
"    client: clientRes.data || clientRes,\n" +
"    projects: projectsRes.data || [],\n" +
"    invoices: invoicesRes.data || [],\n" +
"    tickets: ticketsRes.data || []\n" +
"  };\n" +
"};\n\n" +
"export default function Client360() {\n" +
"  const { id } = useParams();\n" +
"  const { data, isLoading, isError } = useQuery({\n" +
"    queryKey: ['client360', id],\n" +
"    queryFn: () => fetchClient360(id)\n" +
"  });\n\n" +
"  if (isLoading) return <div className=\"p-6\"><TableSkeleton /></div>;\n" +
"  if (isError) return <div className=\"p-6 text-red-500\">Failed to load Client 360 view</div>;\n\n" +
"  const { client, projects, invoices, tickets } = data;\n\n" +
"  return (\n" +
"    <div className=\"space-y-6 p-6\">\n" +
"      <div className=\"bg-white shadow rounded-lg p-6\">\n" +
"        <h1 className=\"text-3xl font-bold text-gray-900\">{client.companyName || 'Unknown Client'}</h1>\n" +
"        <p className=\"text-gray-500 mt-2\">Client ID: {client.clientId}</p>\n" +
"        <div className=\"grid grid-cols-2 md:grid-cols-4 gap-4 mt-6\">\n" +
"          <div className=\"bg-blue-50 p-4 rounded text-center\">\n" +
"            <h3 className=\"font-bold text-blue-700\">Projects</h3>\n" +
"            <p className=\"text-2xl\">{projects.length}</p>\n" +
"          </div>\n" +
"          <div className=\"bg-green-50 p-4 rounded text-center\">\n" +
"            <h3 className=\"font-bold text-green-700\">Invoices</h3>\n" +
"            <p className=\"text-2xl\">{invoices.length}</p>\n" +
"          </div>\n" +
"          <div className=\"bg-red-50 p-4 rounded text-center\">\n" +
"            <h3 className=\"font-bold text-red-700\">Tickets</h3>\n" +
"            <p className=\"text-2xl\">{tickets.length}</p>\n" +
"          </div>\n" +
"        </div>\n" +
"      </div>\n" +
"    </div>\n" +
"  );\n" +
"}\n";

const project360Content = "import React from 'react';\n" +
"import { useParams } from 'react-router-dom';\n" +
"import { useQuery } from '@tanstack/react-query';\n" +
"import { api } from '../../services/api';\n" +
"import { TableSkeleton } from '../../components/feedback/LoadingSkeleton';\n\n" +
"const fetchProject360 = async (id) => {\n" +
"  const [projectRes, tasksRes, timeRes, bugsRes] = await Promise.all([\n" +
"    api.get('/projects/' + id),\n" +
"    api.get('/tasks?projectId=' + id).catch(() => ({ data: [] })),\n" +
"    api.get('/timeentries?projectId=' + id).catch(() => ({ data: [] })),\n" +
"    api.get('/bugs?projectId=' + id).catch(() => ({ data: [] }))\n" +
"  ]);\n" +
"  return {\n" +
"    project: projectRes.data || projectRes,\n" +
"    tasks: tasksRes.data || [],\n" +
"    timeEntries: timeRes.data || [],\n" +
"    bugs: bugsRes.data || []\n" +
"  };\n" +
"};\n\n" +
"export default function Project360() {\n" +
"  const { id } = useParams();\n" +
"  const { data, isLoading, isError } = useQuery({\n" +
"    queryKey: ['project360', id],\n" +
"    queryFn: () => fetchProject360(id)\n" +
"  });\n\n" +
"  if (isLoading) return <div className=\"p-6\"><TableSkeleton /></div>;\n" +
"  if (isError) return <div className=\"p-6 text-red-500\">Failed to load Project 360 view</div>;\n\n" +
"  const { project, tasks, bugs } = data;\n\n" +
"  return (\n" +
"    <div className=\"space-y-6 p-6\">\n" +
"      <div className=\"bg-white shadow rounded-lg p-6\">\n" +
"        <h1 className=\"text-3xl font-bold text-gray-900\">{project.name || 'Unknown Project'}</h1>\n" +
"        <p className=\"text-gray-500 mt-2\">Project ID: {project.projectId} - Status: {project.status}</p>\n" +
"        <div className=\"grid grid-cols-2 md:grid-cols-4 gap-4 mt-6\">\n" +
"          <div className=\"bg-purple-50 p-4 rounded text-center\">\n" +
"            <h3 className=\"font-bold text-purple-700\">Tasks</h3>\n" +
"            <p className=\"text-2xl\">{tasks.length}</p>\n" +
"          </div>\n" +
"          <div className=\"bg-orange-50 p-4 rounded text-center\">\n" +
"            <h3 className=\"font-bold text-orange-700\">Bugs</h3>\n" +
"            <p className=\"text-2xl\">{bugs.length}</p>\n" +
"          </div>\n" +
"        </div>\n" +
"      </div>\n" +
"    </div>\n" +
"  );\n" +
"}\n";

fs.writeFileSync(path.join(pagesDir, 'crm', 'Client360.jsx'), client360Content);
fs.writeFileSync(path.join(pagesDir, 'operations', 'Project360.jsx'), project360Content);
console.log('360 Views Scaffolded.');
