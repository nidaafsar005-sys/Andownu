import type { MediaInfo, JobResponse, PlatformItem } from './types';

const API_BASE = '/api';

export async function fetchMediaInfo(url: string): Promise<MediaInfo> {
  const res = await fetch(`${API_BASE}/media/info`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to analyze video. Please verify the link.');
  }
  return res.json();
}

export async function startDownloadProcess(
  url: string,
  formatId: string,
  ext: string = 'mp4',
  isAudioOnly: boolean = false
): Promise<JobResponse> {
  const res = await fetch(`${API_BASE}/media/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url,
      format_id: formatId,
      ext,
      is_audio_only: isAudioOnly,
    }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Could not start processing job.');
  }
  return res.json();
}

export async function pollJobStatus(jobId: string): Promise<JobResponse> {
  const res = await fetch(`${API_BASE}/media/status/${jobId}`);
  if (!res.ok) {
    throw new Error('Could not retrieve job status.');
  }
  return res.json();
}

export async function cancelJob(jobId: string): Promise<void> {
  await fetch(`${API_BASE}/media/cancel/${jobId}`, { method: 'POST' });
}

export async function fetchSupportedPlatforms(): Promise<PlatformItem[]> {
  const res = await fetch(`${API_BASE}/providers`);
  if (!res.ok) {
    throw new Error('Failed to load supported platforms.');
  }
  return res.json();
}

export async function fetchAdminStats(token: string) {
  const res = await fetch(`${API_BASE}/admin/stats`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Unauthorized or failed to load stats');
  return res.json();
}

export async function adminLogin(password: string) {
  const res = await fetch(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@andown.in', password })
  });
  if (!res.ok) throw new Error('Invalid credentials');
  return res.json();
}

export async function adminTogglePlatform(token: string, providerId: string, enabled: boolean) {
  const res = await fetch(`${API_BASE}/admin/platform/toggle`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ provider_id: providerId, enabled })
  });
  if (!res.ok) throw new Error('Failed to toggle platform');
  return res.json();
}
