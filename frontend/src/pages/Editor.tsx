import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/Modal';
import { Cloud, Check, Trash2, ArrowLeft, AlertTriangle, Download } from 'lucide-react';
import 'quill/dist/quill.snow.css';

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [userRole, setUserRole] = useState<string>('');
  const [workspacePlan, setWorkspacePlan] = useState<string | null>(null); // Use null for initial check
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const quillRef = React.useRef<HTMLDivElement>(null);
  const quillInstance = React.useRef<any>(null);

  // Fetch document and workspace plan
  useEffect(() => {
    const fetchDocAndWorkspace = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/documents/${id}`);
        setTitle(data.title);
        setContent(data.content || '');
        setUserRole(data.userRole || 'owner');
        
        const workspaceId = localStorage.getItem('currentWorkspaceId');
        if (workspaceId) {
          const { data: wsData } = await api.get('/workspaces'); 
          const currentWs = wsData.find((w: any) => w._id === workspaceId);
          setWorkspacePlan(currentWs?.subscription?.plan || 'free');
        } else {
          setWorkspacePlan('free');
        }
      } catch (err) {
        console.error('Failed to fetch data');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchDocAndWorkspace();
  }, [id, navigate]);

  // Initialize Quill directly when in Pro mode
  useEffect(() => {
    if (!loading && workspacePlan === 'pro' && quillRef.current && !quillInstance.current) {
      // Import Quill dynamically to avoid SSR/Initial load issues if any
      const initQuill = async () => {
        const { default: Quill } = await import('quill');
        quillInstance.current = new Quill(quillRef.current!, {
          theme: 'snow',
          modules: {
            toolbar: [
              [{ header: [1, 2, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              ['blockquote', 'code-block'],
              [{ list: 'ordered' }, { list: 'bullet' }],
              ['link', 'image'],
              ['clean'],
            ],
          },
        });

        // Set initial content
        if (content) {
          quillInstance.current.root.innerHTML = content;
        }

        // Listen for changes
        quillInstance.current.on('text-change', () => {
          setContent(quillInstance.current.root.innerHTML);
        });
      };
      initQuill();
    }
  }, [loading, workspacePlan, content]); // Initial load sync

  // Auto-save logic
  const saveDocument = useCallback(async (newTitle: string, newContent: string) => {
    if (!id || loading) return;
    setSaving(true);
    try {
      await api.put(`/documents/${id}`, { title: newTitle, content: newContent });
      setLastSaved(new Date());
    } catch (err) {
      console.error('Save failed');
    } finally {
      setSaving(false);
    }
  }, [id, loading]);

  useEffect(() => {
    if (loading) return;
    const timeout = setTimeout(() => {
      if (title !== undefined || content !== undefined) {
        saveDocument(title, content);
      }
    }, 2000);
    return () => clearTimeout(timeout);
  }, [title, content, saveDocument, loading]);

  const handleDocDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/documents/${id}`);
      navigate('/');
    } catch (err) {
      console.error('Delete failed');
    } finally {
      setDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get(`/documents/${id}/export`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title.replace(/\s+/g, '_') || 'document'}.md`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Editor Header */}
      <header className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-bold text-gray-900 border-none focus:ring-0 p-0 placeholder-gray-300 w-96 shadow-none"
              placeholder="Document Title"
            />
            <div className="flex items-center gap-2 text-xs text-gray-400">
              {saving ? (
                <span className="flex items-center gap-1 text-indigo-500 font-medium">
                  <Cloud size={14} className="animate-pulse" /> Saving...
                </span>
              ) : (
                <span className="flex items-center gap-1 font-medium">
                  <Check size={14} className="text-green-500" />
                  {lastSaved ? `Saved at ${lastSaved.toLocaleTimeString()}` : 'Ready'}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {workspacePlan === 'pro' && (
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
              title="Export as Markdown"
            >
              <Download size={18} />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}

          {['owner', 'admin'].includes(userRole) && (
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title="Delete Document"
            >
              <Trash2 size={20} />
            </button>
          )}
        </div>
      </header>

      {/* Editor Content */}
      <div className="flex-1 max-w-4xl mx-auto w-full py-12 px-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-neutral-400 gap-4">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="animate-pulse font-medium">Loading document...</p>
          </div>
        ) : workspacePlan === 'pro' ? (
          <div className="pro-editor-container h-[70vh] mb-12">
             <div ref={quillRef} />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3 text-indigo-700">
                <AlertTriangle size={20} />
                <span className="text-sm font-medium">You are using the Basic editor. Upgrade to **Pro** for Rich Text features!</span>
              </div>
              <button 
                onClick={() => navigate('/pricing')}
                className="text-xs font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-all"
              >
                Upgrade
              </button>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing (Basic Text)..."
              className="w-full h-[60vh] border-none focus:ring-0 text-lg leading-relaxed resize-none placeholder-gray-200 p-0 outline-none"
            />
          </div>
        )}
      </div>

      {/* Delete Document Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Document"
        footer={(
          <>
            <button 
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleDocDelete}
              disabled={deleting}
              className="bg-red-600 text-white px-6 py-2 rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 font-bold disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete Forever'}
            </button>
          </>
        )}
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="bg-red-50 p-4 rounded-3xl text-red-600">
            <AlertTriangle size={32} />
          </div>
          <div>
            <p className="text-gray-900 font-bold text-lg mb-1">Are you sure?</p>
            <p className="text-gray-500 text-sm leading-relaxed">
              This document will be permanently deleted and cannot be recovered.
            </p>
          </div>
        </div>
      </Modal>

      <style>{`
        .ql-container.ql-snow {
          border: none !important;
          font-family: 'Inter', sans-serif;
          font-size: 1.1rem;
        }
        .ql-toolbar.ql-snow {
          border: none !important;
          border-bottom: 1px solid #f3f4f6 !important;
          position: sticky;
          top: 72px;
          background: white;
          z-index: 5;
          padding: 8px 0 !important;
        }
        .ql-editor {
          padding: 0 !important;
          min-height: 50vh;
        }
        .ql-editor.ql-blank::before {
          left: 0 !important;
          font-style: normal !important;
          color: #d1d5db !important;
        }
      `}</style>
    </div>
  );
};

export default Editor;
