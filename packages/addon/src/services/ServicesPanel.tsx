/**
 * Services panel — manage Storybook, HTTP bridge, MCP server lifecycle.
 */
import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../api';
import { Page, PageTitle, Sub, Grid2, Section, SectionTitle, Row, Stack, Muted, Pill } from '../ui';
import type { ServiceInfo, ServiceType, ServiceStatus } from '../constants';

const SERVICE_LABELS: Record<ServiceType, string> = {
  'storybook': 'Storybook',
  'http-bridge': 'HTTP Bridge',
  'backend': 'Backend',
};

const SERVICE_DESCRIPTIONS: Record<ServiceType, string> = {
  'storybook': 'Component preview server (port 6006)',
  'http-bridge': 'emdesign API server (port 4321)',
  'backend': 'All services',
};

function statusTone(status: ServiceStatus): 'ok' | 'bad' | 'warn' | 'muted' {
  switch (status) {
    case 'running': return 'ok';
    case 'starting': return 'warn';
    case 'stopping': return 'warn';
    case 'error':
    case 'crashed': return 'bad';
    case 'stopped': return 'muted';
  }
}

function ServiceCard({
  type,
  info,
  onStart,
  onStop,
  onRestart,
}: {
  type: ServiceType;
  info: ServiceInfo;
  onStart: (type: ServiceType) => void;
  onStop: (type: ServiceType) => void;
  onRestart: (type: ServiceType) => void;
}) {
  const isRunning = info.status === 'running';
  const isLoading = info.status === 'starting' || info.status === 'stopping';

  return (
    <div style={{
      padding: 16,
      borderRadius: 8,
      background: '#1a1a2e',
      border: '1px solid #2a2a3e',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#ddd' }}>{SERVICE_LABELS[type]}</div>
          <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{SERVICE_DESCRIPTIONS[type]}</div>
        </div>
        <Pill tone={statusTone(info.status)}>{info.status}</Pill>
      </div>

      {info.pid && (
        <div style={{ fontSize: 11, color: '#777', marginBottom: 4 }}>
          PID: {info.pid}
          {info.port ? ` · Port: ${info.port}` : ''}
        </div>
      )}
      {info.restartCount > 0 && (
        <div style={{ fontSize: 11, color: '#777', marginBottom: 4 }}>
          Restarts: {info.restartCount}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        {!isRunning ? (
          <button
            onClick={() => onStart(type)}
            disabled={isLoading}
            style={{
              padding: '6px 16px',
              borderRadius: 4,
              border: 'none',
              background: isLoading ? '#444' : '#1a6b3c',
              color: '#fff',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {isLoading ? '...' : 'Start'}
          </button>
        ) : (
          <button
            onClick={() => onStop(type)}
            disabled={isLoading}
            style={{
              padding: '6px 16px',
              borderRadius: 4,
              border: 'none',
              background: isLoading ? '#444' : '#6b1a1a',
              color: '#fff',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {isLoading ? '...' : 'Stop'}
          </button>
        )}
        {isRunning && (
          <button
            onClick={() => onRestart(type)}
            style={{
              padding: '6px 16px',
              borderRadius: 4,
              border: '1px solid #555',
              background: 'transparent',
              color: '#ccc',
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            Restart
          </button>
        )}
      </div>
    </div>
  );
}

export function ServicesPanel() {
  const [services, setServices] = useState<Record<string, ServiceInfo> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadServices = useCallback(async () => {
    try {
      const s = await api.listServices();
      setServices(s);
      setError(null);
    } catch (e) {
      setError('Backend not reachable');
    }
  }, []);

  useEffect(() => {
    loadServices();
    const interval = setInterval(loadServices, 5000);
    return () => clearInterval(interval);
  }, [loadServices]);

  const handleStart = async (type: ServiceType) => {
    try {
      await api.startService(type);
      await loadServices();
    } catch (e) {
      setError(`Failed to start ${type}`);
    }
  };

  const handleStop = async (type: ServiceType) => {
    try {
      await api.stopService(type);
      await loadServices();
    } catch (e) {
      setError(`Failed to stop ${type}`);
    }
  };

  const handleRestart = async (type: ServiceType) => {
    try {
      await api.restartService(type);
      await loadServices();
    } catch (e) {
      setError(`Failed to restart ${type}`);
    }
  };

  const serviceTypes: ServiceType[] = ['storybook', 'http-bridge', 'backend'];

  return (
    <Page>
      <PageTitle>Services</PageTitle>
      <Sub>manage emdesign services · start · stop · restart</Sub>

      {error && (
        <div style={{ padding: '8px 12px', marginBottom: 16, borderRadius: 4, background: '#3a1a1a', color: '#f88', fontSize: 12 }}>
          {error}
          <button onClick={loadServices} style={{ marginLeft: 12, background: 'none', border: '1px solid #f88', color: '#f88', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', fontSize: 11 }}>
            Retry
          </button>
        </div>
      )}

      <Grid2>
        {serviceTypes.map((type) => (
          <ServiceCard
            key={type}
            type={type}
            info={services?.[type] ?? { type, status: 'stopped', restartCount: 0 }}
            onStart={handleStart}
            onStop={handleStop}
            onRestart={handleRestart}
          />
        ))}
      </Grid2>
    </Page>
  );
}
