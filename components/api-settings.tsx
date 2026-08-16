'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getApiBaseUrl, setApiBaseUrl, clearApiBaseUrl, syncApiBaseUrl } from '@/lib/api-config';
import { checkHealth } from '@/lib/api';

export default function ApiSettings() {
  const [url, setUrl] = useState('');
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle');
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    setUrl(getApiBaseUrl());
  }, []);

  function handleSave() {
    setApiBaseUrl(url);
    setSaved(true);
    setStatus('idle');
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleTest() {
    setApiBaseUrl(url);
    setStatus('testing');
    const ok = await checkHealth();
    setStatus(ok ? 'ok' : 'fail');
  }

  function handleReset() {
    clearApiBaseUrl();
    setUrl('');
    setStatus('idle');
  }

  async function handleResync() {
    setSyncing(true);
    const domain = await syncApiBaseUrl();
    setUrl(domain);
    setSyncing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-lg mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">Backend API Settings</h1>
      <p className="text-sm text-muted-foreground">
        This normally updates itself automatically on every page refresh from the backend
        resolver. Use the fields below only if you need to manually override it (e.g. testing
        against a different backend).
      </p>

      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://your-tunnel.trycloudflare.com"
        className="w-full border rounded px-3 py-2 bg-background"
      />

      <div className="flex flex-wrap gap-2">
        <Button onClick={handleSave}>Save</Button>
        <Button variant="outline" onClick={handleTest}>Test Connection</Button>
        <Button variant="outline" onClick={handleResync} disabled={syncing}>
          {syncing ? 'Syncing…' : 'Re-sync from resolver'}
        </Button>
        <Button variant="outline" className="text-red-600" onClick={handleReset}>Reset</Button>
      </div>

      {saved && <p className="text-green-600 text-sm">Saved.</p>}
      {status === 'testing' && <p className="text-sm text-muted-foreground">Testing…</p>}
      {status === 'ok' && <p className="text-green-600 text-sm">✅ Connected successfully.</p>}
      {status === 'fail' && <p className="text-red-600 text-sm">❌ Could not reach backend. Check the URL and CORS settings.</p>}
    </div>
  );
}