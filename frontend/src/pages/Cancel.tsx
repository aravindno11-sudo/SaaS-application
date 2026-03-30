import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';

const Cancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-12 text-center max-w-md w-full shadow-2xl">
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Payment Canceled</h1>
        <p className="text-neutral-400 mb-8">
          Your payment was not completed. If you had any issues, please feel free to contact support.
        </p>
        <button
          onClick={() => navigate('/pricing')}
          className="w-full py-4 px-8 rounded-2xl bg-neutral-800 text-white font-bold hover:bg-neutral-700 transition-all transform active:scale-[0.98]"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default Cancel;
