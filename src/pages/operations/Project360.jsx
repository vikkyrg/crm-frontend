import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { TableSkeleton } from '../../components/feedback/LoadingSkeleton';

const fetchProject360 = async (id) => {
  const [projectRes, tasksRes, timeRes, bugsRes] = await Promise.all([
    api.get('/projects/' + id),
    api.get('/tasks?projectId=' + id).catch(() => ({ data: [] })),
    api.get('/timeentries?projectId=' + id).catch(() => ({ data: [] })),
    api.get('/bugs?projectId=' + id).catch(() => ({ data: [] }))
  ]);
  return {
    project: projectRes.data || projectRes,
    tasks: tasksRes.data || [],
    timeEntries: timeRes.data || [],
    bugs: bugsRes.data || []
  };
};

export default function Project360() {
  const { id } = useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['project360', id],
    queryFn: () => fetchProject360(id)
  });

  if (isLoading) return <div className="p-6"><TableSkeleton /></div>;
  if (isError) return <div className="p-6 text-red-500">Failed to load Project 360 view</div>;

  const { project, tasks, bugs } = data;

  return (
    <div className="space-y-6 p-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900">{project.name || 'Unknown Project'}</h1>
        <p className="text-gray-500 mt-2">Project ID: {project.projectId} - Status: {project.status}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-purple-50 p-4 rounded text-center">
            <h3 className="font-bold text-purple-700">Tasks</h3>
            <p className="text-2xl">{tasks.length}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded text-center">
            <h3 className="font-bold text-orange-700">Bugs</h3>
            <p className="text-2xl">{bugs.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
