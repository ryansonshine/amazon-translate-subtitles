declare module 'matroska-subtitles' {
  export type SubtitleEventNames = 'tracks' | 'subtitle' | 'finish' | 'file';

  export interface SubtitleTrack {
    _compressed?: boolean;
    header?: string;
    language?: string;
    name?: string;
    number: number;
    type: string;
  }

  export interface Subtitle {
    /**
     * Subtitle text
     */
    text: string;
    /**
     * Beginning time to show the subtitle (ms)
     */
    time: number;
    /**
     * How long to show the subtitle (ms)
     */
    duration: number;
  }

  export interface SubtitleFile {
    filename: string;
    mimetype: string;
    data: any;
  }

  export class SubtitleParser extends WritableStream {
    once(
      eventName: 'tracks',
      callback: (tracks: SubtitleTrack[]) => void
    ): this;
    on(
      eventName: 'subtitle',
      callback: (subtitle: Subtitle, trackNumber: number) => void
    ): this;
    on(eventName: 'finish', callback: () => Promise<void>): this;
    writable: boolean;
    write(
      buffer: Uint8Array | string,
      cb?: (err?: Error | null) => void
    ): boolean;
    write(
      str: string,
      encoding?: string,
      cb?: (err?: Error | null) => void
    ): boolean;
    end(cb?: () => void): void;
    end(data: string | Uint8Array, cb?: () => void): void;
    end(str: string, encoding?: string, cb?: () => void): void;
    addListener(
      event: string | symbol,
      listener: (...args: any[]) => void
    ): this;
    removeListener(
      event: string | symbol,
      listener: (...args: any[]) => void
    ): this;
    off(event: string | symbol, listener: (...args: any[]) => void): this;
    removeAllListeners(event?: string | symbol): this;
    setMaxListeners(n: number): this;
    getMaxListeners(): number;
    listeners(event: string | symbol): any[];
    rawListeners(event: string | symbol): any[];
    emit(event: string | symbol, ...args: any[]): boolean;
    listenerCount(type: string | symbol): number;
    // Added in Node 6...
    prependListener(
      event: string | symbol,
      listener: (...args: any[]) => void
    ): this;
    prependOnceListener(
      event: string | symbol,
      listener: (...args: any[]) => void
    ): this;
    eventNames(): Array<string | symbol>;
  }
}
