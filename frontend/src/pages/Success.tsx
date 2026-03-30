import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const Success = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const triggerMockUpgrade = async () => {
      const workspaceId = localStorage.getItem('currentWorkspaceId');
      if (sessionId === 'mock_session_id' && workspaceId) {
        try {
          await api.post('/subscription/mock-upgrade', { workspaceId });
          console.log('Mock upgrade triggered');
        } catch (error) {
          console.error('Failed to trigger mock upgrade:', error);
        }
      }
    };
    triggerMockUpgrade();
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-12 text-center max-w-md w-full shadow-2xl">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold mb-4 italic">Success!</h1>
        <p className="text-neutral-400 mb-8">
          Thank you for upgrading! Your workspace has been successfully upgraded to the Pro plan.
        </p>
        <button
          onClick={() => navigate('/')}
          className="w-full py-4 px-8 rounded-2xl bg-white text-black font-bold hover:bg-neutral-200 transition-all transform active:scale-[0.98]"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Success;
