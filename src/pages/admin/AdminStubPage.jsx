import React from 'react';
import AdminLayout from './AdminLayout';
import { AlertCircle } from 'lucide-react';

const AdminStubPage = ({ title }) => {
  return (
    <AdminLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="w-20 h-20 rounded-3xl bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20">
          <AlertCircle size={40} className="text-blue-500" />
        </div>
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic mb-4">
          Module <span className="text-blue-500">Under Construction</span>
        </h2>
        <p className="text-gray-500 text-sm font-black uppercase tracking-[0.2em] max-w-md italic">
          The {title || 'requested'} administrative terminal is currently being synchronized with the Pulse Core.
        </p>
      </div>
    </AdminLayout>
  );
};

export default AdminStubPage;
