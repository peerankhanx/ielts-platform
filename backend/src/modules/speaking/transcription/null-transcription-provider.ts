import { Injectable } from '@nestjs/common';
import type { TranscriptionProvider } from './transcription-provider.interface';

/**
 * Default provider — always returns null. Used whenever no real
 * speech-to-text service is configured (see transcription-provider.token.ts's
 * factory). This is what every Speaking evaluation in this project has run
 * against so far: Lexical Resource and Grammatical Range stay unscored
 * (see AudioFluencyEvaluator's doc comment) because there's genuinely no
 * transcript to assess them from — not because the code is faking a null.
 */
@Injectable()
export class NullTranscriptionProvider implements TranscriptionProvider {
  readonly name = 'none';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- required by the TranscriptionProvider interface
  transcribe(_audioFilePath: string): Promise<string | null> {
    return Promise.resolve(null);
  }
}
