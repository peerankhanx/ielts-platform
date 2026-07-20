export interface TranscriptionProvider {
  readonly name: string;
  /** Returns null if this provider can't/won't produce a transcript
   *  (e.g. the null provider, always; a real provider on failure). */
  transcribe(audioFilePath: string): Promise<string | null>;
}
