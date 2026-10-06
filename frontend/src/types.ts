export interface MediaFormat {
  format_id: string;
  format_note?: string;
  resolution?: string;
  quality_label?: string;
  ext: string;
  filesize_approx?: number;
  filesize_formatted?: string;
  is_audio_only: boolean;
  has_video: boolean;
  has_audio: boolean;
}

export interface MediaInfo {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  duration?: number;
  duration_formatted?: string;
  uploader?: string;
  platform: string;
  webpage_url: string;
  formats: MediaFormat[];
}

export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface JobResponse {
  job_id: string;
  status: JobStatus;
  progress_percentage?: number;
  status_message: string;
  download_url?: string;
  filename?: string;
  filesize_formatted?: string;
  media_info?: MediaInfo;
  expires_at?: string;
  error?: string;
}

export interface PlatformItem {
  id: string;
  name: string;
  domains: string[];
  is_enabled: boolean;
  supported_media: string[];
  icon_name: string;
  description: string;
}

export interface DownloadHistoryItem {
  id: string;
  title: string;
  platform: string;
  format: string;
  date: string;
  filename?: string;
}
