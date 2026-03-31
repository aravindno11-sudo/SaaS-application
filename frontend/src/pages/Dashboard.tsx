import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api, { activity } from '../services/api';
import { FileText, Plus, Search, Calendar, Users, Activity as ActivityIcon, Clock, Layout, Menu } from 'lucide-react';

interface Document {
  _id: string;
  title: string;
  updatedAt: string;
}

interface ActivityItem {
  _id: string;
  action: string;
  details: string;
  user: { name: string };
  createdAt: string;
}

interface WorkspaceStats {
  documents: number;
  members: number;
}

interface Workspace {
  _id: string;
  name: string;
  userRole: string;
  subscription?: {
    plan: 'free' | 'pro';
  };
}

const Dashboard = () => {
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('');
  const [selectedWorkspaceName, setSelectedWorkspaceName] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [stats, setStats] = useState<WorkspaceStats>({ documents: 0, members: 0 });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (selectedWorkspaceId) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const [docRes, activityRes, statsRes] = await Promise.all([
            api.get(`/documents/workspace/${selectedWorkspaceId}`, { params: { search: debouncedSearch } }),
            activity.getActivity(selectedWorkspaceId),
            activity.getStats(selectedWorkspaceId)
          ]);
          setDocuments(docRes.data);
          setActivities(activityRes.data);
          setStats(statsRes.data);
        } catch (err) {
          console.error('Failed to fetch dashboard data');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [selectedWorkspaceId, debouncedSearch]);

  const [activePlan, setActivePlan] = useState<'free' | 'pro'>('free');

  const handleCreateDoc = async () => {
    if (!selectedWorkspaceId) return;
    try {
      const { data } = await api.post('/documents', {
        title: 'Untitled Document',
        workspaceId: selectedWorkspaceId,
      });
      setDocuments([data, ...documents]);
      navigate(`/editor/${data._id}`); // Corrected path from /document/ to /editor/
    } catch (err: any) {
      if (err.response?.status === 403 && err.response?.data?.limitReached) {
        if (confirm('Document limit reached for Free plan. Would you like to upgrade to Pro for unlimited documents?')) {
          navigate('/pricing');
        }
      } else {
        console.error('Failed to create document');
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar 
        onWorkspaceSelect={(ws) => {
          setSelectedWorkspaceId(ws._id);
          setSelectedWorkspaceName(ws.name);
          setUserRole(ws.userRole);
          setActivePlan(ws.subscription?.plan || 'free');
          setIsSidebarOpen(false);
        }} 
        activeWorkspaceId={selectedWorkspaceId} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg flex-shrink-0"
            >
              <Menu size={24} />
            </button>
            <h1 className="font-bold text-lg md:text-xl text-gray-900 truncate max-w-[120px] sm:max-w-[200px]">
              {selectedWorkspaceName || 'Dashboard'}
            </h1>
            {activePlan === 'pro' && (
              <span className="bg-indigo-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 shadow-sm">
                PRO
              </span>
            )}
          </div>
          <div className="relative w-96 max-w-sm hidden md:block">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent rounded-lg focus:bg-white focus:border-indigo-500 focus:ring-0 transition-all text-sm font-medium"
            />
          </div>
          <button
            onClick={handleCreateDoc}
            className="flex items-center gap-2 bg-indigo-600 text-white px-3 md:px-5 py-2 md:py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 font-bold active:scale-[0.98] text-sm md:text-base flex-shrink-0"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">New Document</span>
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-6 md:p-8">
          {!selectedWorkspaceId ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <div className="bg-indigo-100 p-6 rounded-3xl text-indigo-600 mb-6">
                <Layout size={48} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to SaaS Docs</h2>
              <p className="text-gray-500 mb-8">
                To get started, please select a workspace from the sidebar or create a new one using the <span className="font-bold text-indigo-600">+</span> button.
              </p>
              <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="w-1/3 h-full bg-indigo-500 animate-pulse" />
              </div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              {/* Stats Bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                  <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
                    <FileText size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Documents</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.documents}</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                  <div className="bg-cyan-50 p-3 rounded-xl text-cyan-600">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Members</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.members}</p>
                  </div>
                </div>
                <div className="bg-indigo-600 p-6 rounded-2xl shadow-lg shadow-indigo-600/20 flex items-center gap-4 text-white">
                  <div className="bg-white/20 p-3 rounded-xl">
                    <ActivityIcon size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-indigo-100 uppercase tracking-wider">Plan Status</p>
                    <p className="text-2xl font-bold capitalize">{activePlan}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-8">
                {/* Document List */}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
                    Recent Documents
                    {userRole && (
                      <span className="text-xs font-normal bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full uppercase tracking-wider">
                        {userRole}
                      </span>
                    )}
                  </h2>

                  {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white h-40 rounded-xl border border-gray-100 shadow-sm" />
                      ))}
                    </div>
                  ) : documents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {documents.map((doc) => (
                        <div
                          key={doc._id}
                          onClick={() => navigate(`/editor/${doc._id}`)}
                          className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group"
                        >
                          <div className="bg-indigo-50 p-3 w-fit rounded-lg mb-4 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <FileText size={24} />
                          </div>
                          <h3 className="font-semibold text-gray-800 mb-2 truncate">{doc.title}</h3>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Calendar size={14} />
                            {new Date(doc.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                      <FileText className="mx-auto text-gray-200 mb-4" size={48} />
                      <p className="text-gray-500">No documents found.</p>
                    </div>
                  )}
                </div>

                {/* Activity Sidebar */}
                <div className="lg:w-80 flex-shrink-0">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <Clock size={20} className="text-indigo-600" />
                      Activity History
                    </h3>
                    <div className="space-y-6">
                      {activities.length > 0 ? (
                        activities.map((act) => (
                          <div key={act._id} className="relative pl-6 border-l-2 border-indigo-100 last:border-0 pb-1">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-50 border-2 border-indigo-500 shadow-sm" />
                            <p className="text-sm font-bold text-gray-900 leading-tight mb-1">{act.details}</p>
                            <div className="flex items-center gap-2 text-[11px] text-gray-400">
                              <span className="font-semibold text-indigo-500 uppercase">{act.user.name}</span>
                              <span>•</span>
                              <span>{new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-400 text-center py-4 italic">No recent activity.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
