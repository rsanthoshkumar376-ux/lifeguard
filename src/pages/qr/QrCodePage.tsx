import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { generateToken, getActiveTokens, revokeAllTokens, EmergencyToken, AccessLog, getAccessLogs } from '../../services/emergencyToken';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Printer, RefreshCw, ShieldAlert, History } from 'lucide-react';

const QrCodePage = () => {
  const { user } = useAuth();
  const [tokens, setTokens] = useState<EmergencyToken[]>([]);
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTokens();
    }
  }, [user]);

  const loadTokens = async () => {
    if (!user) return;
    const t = await getActiveTokens(user.uid);
    const l = await getAccessLogs(user.uid);
    if (t.length === 0) {
      const newToken = await generateToken(user.uid);
      setTokens([{ id: newToken.id, token: newToken.token, userId: user.uid, active: true, createdAt: new Date() }]);
    } else {
      setTokens(t);
    }
    setLogs(l.sort((a, b) => b.timestamp - a.timestamp));
    setLoading(false);
  };

  const handleRegenerate = async () => {
    if (!user) return;
    if (window.confirm('This will invalidate your current QR code. Are you sure?')) {
      setLoading(true);
      await revokeAllTokens(user.uid);
      await loadTokens();
    }
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  const activeToken = tokens[0]?.token;
  const qrUrl = `${window.location.origin}/emergency/view?token=${activeToken}`;

  return (
    <div className="p-4 max-w-lg mx-auto pb-24">
      <h1 className="text-2xl font-bold mb-6 text-slate-800 text-center">Emergency QR Code</h1>
      
      <div className="bg-white p-8 rounded-3xl shadow-lg flex flex-col items-center mb-6">
        <div className="bg-white p-4 rounded-xl shadow-inner border-2 border-slate-100 mb-6">
          {activeToken ? (
            <QRCodeSVG value={qrUrl} size={200} level="H" includeMargin={true} />
          ) : (
            <div className="w-[200px] h-[200px] bg-slate-100 flex items-center justify-center text-slate-400">No active token</div>
          )}
        </div>
        <p className="text-center text-sm font-medium text-slate-600 mb-6">
          This QR code allows emergency responders to view your Emergency Medical ID.
        </p>

        <div className="grid grid-cols-2 gap-4 w-full">
          <button className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-4 rounded-xl font-semibold transition-colors">
            <Download size={20} /> Download
          </button>
          <button className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-4 rounded-xl font-semibold transition-colors">
            <Printer size={20} /> Print
          </button>
          <button onClick={handleRegenerate} className="flex items-center justify-center gap-2 bg-amber-100 hover:bg-amber-200 text-amber-700 py-3 px-4 rounded-xl font-semibold transition-colors col-span-2">
            <RefreshCw size={20} /> Regenerate QR Code
          </button>
        </div>
      </div>

      <section className="bg-white p-6 rounded-2xl shadow-sm mb-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <History className="text-slate-500" /> Access History
        </h2>
        {logs.length === 0 ? (
          <p className="text-slate-500 text-center py-4">No access logs yet.</p>
        ) : (
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {logs.map(log => (
              <div key={log.id} className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-700">{log.accessType}</span>
                  <div className="text-slate-500">
                    {new Date(log.timestamp?.toDate ? log.timestamp.toDate() : (log.timestamp || log.accessedAt || Date.now())).toLocaleString()}
                  </div>
                </div>
                {(log.location || log.approximateLocation) && (
                  <div className="text-xs bg-slate-200 px-2 py-1 rounded">
                    {log.location || log.approximateLocation}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <button onClick={() => {
        if(window.confirm('Disable all QR codes? Emergency responders will not be able to access your ID.')) {
          revokeAllTokens(user!.uid).then(() => loadTokens());
        }
      }} className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-4 px-4 rounded-xl font-bold transition-colors border border-red-100">
        <ShieldAlert size={20} /> Disable Emergency Access
      </button>
    </div>
  );
};

export default QrCodePage;
