/**
 * Takes a value in milliseconds and returns the time format expected for an SRT
 * file (hh:mm:ss,xxx).
 *
 * @example
 * '00:00:39,540'
 */
export const toSrtTime = (totalMs: number): string => {
  const ms = totalMs % 1000;
  totalMs = (totalMs - ms) / 1000;
  const secs = totalMs % 60;
  totalMs = (totalMs - secs) / 60;
  const mins = totalMs % 60;
  const hrs = (totalMs - mins) / 60;

  return `${hrs.toString().padStart(2, '0')}:${mins
    .toString()
    .padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms
    .toString()
    .padStart(3, '0')}`;
};

export interface CreateSrtEntryInput {
  /**
   * Counter value indiciating the position of the subtitle.
   */
  index: number;
  /**
   * Subtitle text in one or more lines.
   */
  subtitleText: string;
  /**
   * Start time of the subtitle in milliseconds.
   */
  time: number;
  /**
   * Length of time to display the subtitle in milliseconds.
   */
  duration: number;
}

/**
 * Creates a single entry for an srt file as a string.
 *
 * @example
 * "1
 * 00:01:01,215 --> 00:03:10,200
 * This is an example subtitle entry"
 */
export const createSrtEntry = ({
  index,
  duration,
  subtitleText,
  time,
}: CreateSrtEntryInput): string => {
  const timestamp = [toSrtTime(time), toSrtTime(time + duration)].join(' --> ');
  return [index, timestamp, subtitleText].join('\n');
};
