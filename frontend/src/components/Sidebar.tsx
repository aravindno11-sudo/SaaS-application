import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Modal from './Modal';
import { Layout, Plus, FileText, Settings, LogOut, Zap, Trash2, AlertTriangle } from 'lucide-react';

interface Workspace {
  _id: string;
  name: string;
  userRole: string;
  subscription?: {
    plan: 'free' | 'pro';
    status: string;
  };
}

interface SidebarProps {
  onWorkspaceSelect: (ws: Workspace) => void;
  activeWorkspaceId?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onWorkspaceSelect, activeWorkspaceId, isOpen, onClose }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<string | null>(null);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const activeWorkspace = workspaces.find(ws => ws._id === activeWorkspaceId);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const { data } = await api.get('/workspaces');
        setWorkspaces(data);
        if (data.length > 0 && !activeWorkspaceId) {
          onWorkspaceSelect(data[0]);
        }
      } catch (err) {
        console.error('Failed to fetch workspaces');
      }
    };
    fetchWorkspaces();
  }, [onWorkspaceSelect, activeWorkspaceId]);

  useEffect(() => {
    if (activeWorkspaceId) {
      localStorage.setItem('currentWorkspaceId', activeWorkspaceId);
    }
  }, [activeWorkspaceId]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post('/workspaces', { name: newWorkspaceName });
      const newWs = { ...data, userRole: 'owner' };
      setWorkspaces([...workspaces, newWs]);
      onWorkspaceSelect(newWs);
      setIsCreateModalOpen(false);
      setNewWorkspaceName('');
    } catch (err) {
      console.error('Failed to create workspace');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!workspaceToDelete) return;
    setLoading(true);
    try {
      await api.delete(`/workspaces/${workspaceToDelete}`);
      setWorkspaces(workspaces.filter(ws => ws._id !== workspaceToDelete));
      if (activeWorkspaceId === workspaceToDelete) {
        onWorkspaceSelect({} as any);
      }
      setIsDeleteModalOpen(false);
      setWorkspaceToDelete(null);
    } catch (err) {
      console.error('Failed to delete workspace');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      <div className={`fixed inset-y-0 left-0 z-50 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out w-64 bg-slate-900 h-screen text-slate-300 flex flex-col border-r border-slate-800 shrink-0`}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="bg-indigo-500 p-2 rounded-lg text-white">
            <Layout size={20} />
          </div>
          <h1 className="font-bold text-white text-lg tracking-tight">SaaS Docs</h1>
        </div>

      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-4">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 px-2 mb-2">
            Workspaces
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="hover:text-white transition-colors cursor-pointer"
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="space-y-1">
            {workspaces.map((ws) => (
              <div key={ws._id} className="group relative">
                <button
                  onClick={() => onWorkspaceSelect(ws)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${
                    activeWorkspaceId === ws._id
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                      : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${activeWorkspaceId === ws._id ? 'bg-white' : 'bg-slate-600'}`} />
                  <span className="truncate pr-6">{ws.name}</span>
                </button>
                {ws.userRole === 'owner' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setWorkspaceToDelete(ws._id);
                      setIsDeleteModalOpen(true);
                    }}
                    className="absolute right-2 top-2 p-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-800 space-y-1">
        {activeWorkspace?.subscription?.plan === 'pro' ? (
          <div className="px-3 py-2 text-xs font-bold text-indigo-400 bg-indigo-500/10 rounded-md border border-indigo-500/20 mb-2 flex items-center justify-between">
            PRO WORKSPACE
            <Zap size={12} className="fill-indigo-400" />
          </div>
        ) : (
          <button 
            onClick={() => navigate('/pricing')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all mb-2 border border-indigo-500/20"
          >
            <Zap size={18} />
            Upgrade to Pro
          </button>
        )}
        <button 
          onClick={() => navigate('/settings')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-slate-800 transition-colors"
        >
          <Settings size={18} />
          Settings
        </button>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-red-900/20 hover:text-red-400 transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      {/* Create Workspace Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Workspace"
        footer={(
          <>
            <button 
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleCreateWorkspace}
              disabled={loading || !newWorkspaceName.trim()}
              className="bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 font-bold disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Workspace'}
            </button>
          </>
        )}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Workspace Name</label>
            <input 
              type="text"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              placeholder="e.g. My Projects"
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:border-indigo-500 transition-all outline-none font-medium"
              autoFocus
            />
          </div>
          <p className="text-xs text-gray-400">
            Workspaces help you organize your documents and collaborate with team members.
          </p>
        </div>
      </Modal>

      {/* Delete Workspace Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Workspace"
        footer={(
          <>
            <button 
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleDeleteWorkspace}
              disabled={loading}
              className="bg-red-600 text-white px-6 py-2 rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 font-bold disabled:opacity-50"
            >
              {loading ? 'Deleting...' : 'Delete Forever'}
            </button>
          </>
        )}
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="bg-red-50 p-4 rounded-3xl text-red-600">
            <AlertTriangle size={32} />
          </div>
          <div>
            <p className="text-gray-900 font-bold text-lg mb-1">Are you absolutely sure?</p>
            <p className="text-gray-500 text-sm leading-relaxed">
              This action cannot be undone. All documents associated with this workspace will be permanently deleted.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  </>
  );
};
export default Sidebar;
