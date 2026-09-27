import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { generateToken, getActiveTokens, revokeAllTokens, EmergencyToken, AccessLog, getAccessLogs } from '../../services/emergencyToken';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Printer, RefreshCw, ShieldAlert, History, Check, AlertCircle } from 'lucide-react';

const QrCodePage = () => {
  const { user } = useAuth();
  const [tokens, setTokens] = useState<EmergencyToken[]>([]);
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const qrContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadTokens();
    } else {
      // Guest demo mode: show instant active QR code
      const demoToken: EmergencyToken = {
        id: 'demo-token',
        token: 'demo-emergency-lifeguard-108',
        userId: 'demo-user',
        active: true,
        createdAt: new Date()
      };
      setTokens([demoToken]);
      setLogs([
        {
          id: 'log-1',
          accessType: 'QR Scan by First Responder',
          location: 'Chennai Central, TN',
          timestamp: Date.now() - 3600000
        }
      ]);
      setLoading(false);
    }
  }, [user]);

  const loadTokens = async () => {
    if (!user) return;
    try {
      const t = await getActiveTokens(user.uid);
      const l = await getAccessLogs(user.uid);
      if (t.length === 0) {
        const newToken = await generateToken(user.uid);
        setTokens([{ id: newToken.id, token: newToken.token, userId: user.uid, active: true, createdAt: new Date() }]);
      } else {
        setTokens(t);
      }
      setLogs(l.sort((a, b) => b.timestamp - a.timestamp));
    } catch (e) {
      console.error('Error loading QR tokens', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!user) {
      alert('Sign in to generate a permanent cloud-synced QR code.');
      return;
    }
    if (window.confirm('This will invalidate your current QR code. Are you sure?')) {
      setLoading(true);
      await revokeAllTokens(user.uid);
      await loadTokens();
    }
  };

  const handleDownload = () => {
    const svg = qrContainerRef.current?.querySelector('svg');
    if (!svg) return;

    try {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      canvas.width = 600;
      canvas.height = 700;

      img.onload = () => {
        if (!ctx) return;
        // Background card
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, 600, 700);

        // Red Header
        ctx.fillStyle = '#DC2626';
        ctx.fillRect(0, 0, 600, 90);

        // Header Title
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 28px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('LIFEGUARD EMERGENCY ID', 300, 56);

        // Draw QR in center
        ctx.drawImage(img, 100, 130, 400, 400);

        // Footer instructions
        ctx.fillStyle = '#1F2937';
        ctx.font = 'bold 20px Inter, sans-serif';
        ctx.fillText('Scan with any phone camera in an emergency', 300, 580);

        ctx.fillStyle = '#6B7280';
        ctx.font = '16px Inter, sans-serif';
        ctx.fillText('Provides immediate access to blood group & medical info', 300, 620);

        // Trigger download
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'LifeGuard-Emergency-QR.png';
        link.href = pngUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 4000);
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (e) {
      console.error('Failed to download QR image', e);
      alert('Could not download image. You can also take a screenshot or use Print.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-6">
          <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-bold text-gray-700">Loading Emergency QR...</p>
        </div>
      </div>
    );
  }

  const activeToken = tokens[0]?.token || 'demo-emergency-token';
  const qrUrl = `${window.location.origin}/emergency/view?token=${activeToken}`;

  return (
    <div className="p-4 max-w-lg mx-auto pb-24 text-gray-900">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 text-center">Emergency QR Code</h1>
      
      {!user && (
        <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0 text-blue-600" />
          <span>Viewing in Demo Mode. <a href="/login" className="font-bold underline">Login / Register</a> to link with your cloud medical records.</span>
        </div>
      )}

      {downloadSuccess && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-800 p-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 animate-bounce">
          <Check size={18} className="text-green-600" />
          <span>QR Code card downloaded successfully!</span>
        </div>
      )}

      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-lg border border-gray-100 flex flex-col items-center mb-6">
        <div ref={qrContainerRef} className="bg-white p-4 rounded-2xl shadow-inner border-2 border-gray-100 mb-6 flex items-center justify-center">
          <QRCodeSVG value={qrUrl} size={220} level="H" includeMargin={true} />
        </div>
        <p className="text-center text-sm font-medium text-gray-700 mb-6">
          Scan this QR code with any phone camera to view Emergency Medical ID and contacts.
        </p>

        <div className="grid grid-cols-2 gap-4 w-full">
          <button 
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3.5 px-4 rounded-xl font-bold shadow transition-all active:scale-95"
          >
            <Download size={20} /> Download QR
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3.5 px-4 rounded-xl font-bold transition-all active:scale-95"
          >
            <Printer size={20} /> Print Card
          </button>
          <button 
            onClick={handleRegenerate} 
            className="flex items-center justify-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 py-3 px-4 rounded-xl font-semibold transition-colors col-span-2 text-sm"
          >
            <RefreshCw size={18} /> Regenerate QR Code
          </button>
        </div>
      </div>

      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <History className="text-gray-500" /> Access History
        </h2>
        {logs.length === 0 ? (
          <p className="text-gray-500 text-center py-4 text-sm">No emergency scans recorded yet.</p>
        ) : (
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {logs.map(log => (
              <div key={log.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm flex justify-between items-center">
                <div>
                  <span className="font-bold text-gray-800">{log.accessType}</span>
                  <div className="text-xs text-gray-500">
                    {new Date(log.timestamp?.toDate ? log.timestamp.toDate() : (log.timestamp || log.accessedAt || Date.now())).toLocaleString()}
                  </div>
                </div>
                {(log.location || log.approximateLocation) && (
                  <div className="text-xs bg-gray-200 text-gray-700 font-semibold px-2 py-1 rounded">
                    {log.location || log.approximateLocation}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {user && (
        <button onClick={() => {
          if (window.confirm('Disable all QR codes? Emergency responders will not be able to access your ID.')) {
            revokeAllTokens(user.uid).then(() => loadTokens());
          }
        }} className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3.5 px-4 rounded-xl font-bold transition-colors border border-red-200 hover:bg-red-100">
          <ShieldAlert size={20} /> Disable Emergency Access
        </button>
      )}
    </div>
  );
};

export default QrCodePage;
