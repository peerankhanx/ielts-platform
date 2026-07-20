import { execSync } from 'child_process';

export interface AudioAnalysis {
  durationSeconds: number;
  silenceSeconds: number;
  pauseCount: number;
}

/**
 * Runs real signal analysis on a recorded answer using ffmpeg/ffprobe —
 * no fabricated numbers. `silencedetect` flags any stretch quieter than
 * -35dB for 0.6s+ as a pause, which is a reasonable proxy for hesitation
 * in spoken English (brief inter-word gaps are quieter/shorter than this).
 */
export function analyzeAudio(filePath: string): AudioAnalysis {
  const durationOutput = execSync(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`,
  ).toString();
  const durationSeconds = parseFloat(durationOutput) || 0;

  const silenceOutput = execSync(
    `ffmpeg -i "${filePath}" -af silencedetect=noise=-35dB:d=0.6 -f null - 2>&1 || true`,
  ).toString();

  const silenceDurations = [
    ...silenceOutput.matchAll(/silence_duration:\s*([\d.]+)/g),
  ].map((m) => parseFloat(m[1]));

  const silenceSeconds = silenceDurations.reduce((sum, d) => sum + d, 0);
  const pauseCount = silenceDurations.length;

  return { durationSeconds, silenceSeconds, pauseCount };
}
