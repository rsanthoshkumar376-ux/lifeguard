import React from 'react';
import { ArrowLeft, Upload, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const HospitalRegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10 flex items-center">
        <Link to="/" className="mr-4 text-gray-600"><ArrowLeft size={24} /></Link>
        <h1 className="text-xl font-bold text-gray-900">Hospital Registration</h1>
      </div>

      <div className="p-4 space-y-5">
         <div className="bg-blue-50 p-4 rounded-xl text-blue-800 text-sm">
           Register your hospital to request blood from the LifeGuard donor network. All registrations are verified before access is granted.
         </div>

         <form className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Hospital Name *</label>
              <input type="text" className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" required />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Registration / License Number *</label>
              <input type="text" className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" required />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Full Address *</label>
              <textarea rows={3} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" required></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">City *</label>
                  <input type="text" className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" required />
               </div>
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">PIN Code *</label>
                  <input type="text" className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" required />
               </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Emergency Contact Number *</label>
              <input type="tel" className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" required />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Authorized Staff Name *</label>
              <input type="text" className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" required />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Verification Document *</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl bg-white">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Upload a file</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                </div>
              </div>
            </div>

            <button type="button" className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-lg shadow-md mt-6 flex items-center justify-center">
               <CheckCircle size={20} className="mr-2" /> SUBMIT FOR VERIFICATION
            </button>
         </form>
      </div>
    </div>
  );
};

export default HospitalRegisterPage;
