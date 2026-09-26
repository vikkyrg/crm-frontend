import fs from 'fs';
import path from 'path';

const pagesDir = path.join(process.cwd(), 'src/pages');
if (!fs.existsSync(pagesDir)) fs.mkdirSync(pagesDir, { recursive: true });

const entities = [
  { name: 'Clients', folder: 'crm', endpoint: 'clients' },
  { name: 'Quotations', folder: 'crm', endpoint: 'quotations' },
  { name: 'Projects', folder: 'operations', endpoint: 'projects' },
  { name: 'Tasks', folder: 'operations', endpoint: 'tasks' },
  { name: 'Websites', folder: 'assets', endpoint: 'websites' },
  { name: 'Domains', folder: 'assets', endpoint: 'domains' },
  { name: 'Tickets', folder: 'support', endpoint: 'tickets' },
  { name: 'Invoices', folder: 'finance', endpoint: 'invoices' },
  { name: 'Payments', folder: 'finance', endpoint: 'payments' },
  { name: 'Expenses', folder: 'finance', endpoint: 'expenses' },
  { name: 'Employees', folder: 'hr', endpoint: 'employees' },
  { name: 'Attendance', folder: 'hr', endpoint: 'attendances' },
  { name: 'Leave', folder: 'hr', endpoint: 'leaves' },
  { name: 'Payroll', folder: 'hr', endpoint: 'payrolls' }
];

entities.forEach(entity => {
  const entityDir = path.join(pagesDir, entity.folder);
  if (!fs.existsSync(entityDir)) fs.mkdirSync(entityDir, { recursive: true });
  
  const componentName = entity.name.replace(/\\s+/g, '');
  
  const content = "import React from 'react';\n" +
"import { Plus } from 'lucide-react';\n" +
"import { Button } from '../../components/ui/Button';\n" +
"import DataTable from '../../components/tables/DataTable';\n" +
"import { useQuery } from '@tanstack/react-query';\n" +
"import { api } from '../../services/api';\n" +
"import { TableSkeleton } from '../../components/feedback/LoadingSkeleton';\n" +
"import ErrorState from '../../components/feedback/ErrorState';\n\n" +
"const fetch" + componentName + " = async () => {\n" +
"  const res = await api.get('/" + entity.endpoint + "');\n" +
"  return res.data || res;\n" +
"};\n\n" +
"const columns = [\n" +
"  { header: 'ID', accessor: '_id' },\n" +
"  { header: 'Created At', accessor: 'createdAt' },\n" +
"  { \n" +
"    header: 'Status', \n" +
"    accessor: 'status',\n" +
"    cell: (row) => (\n" +
"      <span className=\"px-2.5 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full\">\n" +
"        {row.status || 'Active'}\n" +
"      </span>\n" +
"    )\n" +
"  }\n" +
"];\n\n" +
"export default function " + componentName + "() {\n" +
"  const { data, isLoading, isError, refetch } = useQuery({\n" +
"    queryKey: ['" + entity.endpoint + "'],\n" +
"    queryFn: fetch" + componentName + "\n" +
"  });\n\n" +
"  const displayData = data?.data || data || [];\n\n" +
"  return (\n" +
"    <div className=\"space-y-6 p-6\">\n" +
"      <div className=\"flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4\">\n" +
"        <div>\n" +
"          <h1 className=\"text-2xl font-bold tracking-tight text-text\">" + entity.name + "</h1>\n" +
"          <p className=\"text-sm text-text-muted mt-1\">Manage and track your " + entity.name.toLowerCase() + ".</p>\n" +
"        </div>\n" +
"        <Button>\n" +
"          <Plus className=\"mr-2 h-4 w-4\" /> Add " + componentName + "\n" +
"        </Button>\n" +
"      </div>\n\n" +
"      {isLoading && <TableSkeleton />}\n" +
"      {isError && <ErrorState title=\"Failed to load " + entity.name.toLowerCase() + "\" onRetry={refetch} />}\n" +
"      {!isLoading && !isError && displayData.length === 0 && (\n" +
"        <ErrorState title=\"No records found\" message=\"There are currently no " + entity.name.toLowerCase() + " in the database.\" />\n" +
"      )}\n" +
"      {!isLoading && !isError && displayData.length > 0 && (\n" +
"        <DataTable \n" +
"          columns={columns} \n" +
"          data={displayData} \n" +
"          onRowClick={(row) => console.log('Clicked', row)} \n" +
"        />\n" +
"      )}\n" +
"    </div>\n" +
"  );\n" +
"}\n";

  fs.writeFileSync(path.join(entityDir, componentName + '.jsx'), content);
  console.log('Generated ' + componentName + '.jsx');
});

const appContent = "import React from 'react';\n" +
"import { Routes, Route } from 'react-router-dom';\n" +
"import ProtectedRoute from './routes/ProtectedRoute';\n\n" +
entities.map(e => "import " + e.name.replace(/\s+/g, '') + " from './pages/" + e.folder + "/" + e.name.replace(/\s+/g, '') + "';").join('\n') + "\n\n" +
"export default function AppRoutes() {\n" +
"  return (\n" +
"    <Routes>\n" +
"      " + entities.map(e => "<Route path=\"/" + e.endpoint + "\" element={<ProtectedRoute><" + e.name.replace(/\s+/g, '') + " /></ProtectedRoute>} />").join('\n      ') + "\n" +
"    </Routes>\n" +
"  );\n" +
"}\n";

fs.writeFileSync(path.join(process.cwd(), 'src/AppRoutes.jsx'), appContent);
console.log('Frontend scaffolding complete.');
