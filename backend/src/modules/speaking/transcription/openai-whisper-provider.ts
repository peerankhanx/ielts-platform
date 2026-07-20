import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { createReadStream } from 'fs';
import type { TranscriptionProvider } from './transcription-provider.interface';

/**
 * Real speech-to-text via OpenAI's hosted Whisper API. Only active when
 * OPENAI_API_KEY is set (see speaking.module.ts's provider factory) —
 * otherwise NullTranscriptionProvider handles it.
 *
 * This is the piece that was missing for genuine Lexical Resource and
 * Grammatical Range scoring in the Speaking module. It could not be tested
 * in this sandbox: two local approaches were tried first (OpenAI's original
 * Whisper via PyTorch, then the lighter faster-whisper/ctranslate2 backend)
 * and both were blocked — the first by disk space for the PyTorch/CUDA
 * dependencies, the second because model weights are hosted on
 * huggingface.co, which isn't in this sandbox's network allowlist. Calling
 * a hosted API sidesteps both problems entirely, at the cost of requiring a
 * real API key and being untestable here (api.openai.com isn't in the
 * allowlist either). Written correctly against OpenAI's documented API.
 */
@Injectable()
export class OpenAIWhisperProvider implements TranscriptionProvider {
  readonly name = 'openai-whisper';
  private readonly logger = new Logger(OpenAIWhisperProvider.name);
  private client: OpenAI | null = null;

  private getClient(): OpenAI {
    if (!this.client) {
      this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return this.client;
  }

  async transcribe(audioFilePath: string): Promise<string | null> {
    try {
      const transcription = await this.getClient().audio.transcriptions.create({
        file: createReadStream(audioFilePath),
        model: 'whisper-1',
      });
      return transcription.text;
    } catch (err) {
      this.logger.error(
        `Transcription failed for ${audioFilePath}: ${(err as Error).message}`,
      );
      return null;
    }
  }
}
