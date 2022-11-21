import type { ReadStream } from 'fs';
import type { SourceTrackType, SupportedLanguage, TracksMap } from './types';
import { SubtitleParser } from 'matroska-subtitles';
import {
  TranslateClientConfig,
  TranslateTextCommand,
} from '@aws-sdk/client-translate';
import ProgressBar from 'progress';
import pLimit from 'p-limit';
import { createSrtEntry } from './srt';
import { once } from 'events';
import { getTranslateClient } from './aws-sdk';
import { findSourceLanguageTrack } from './languages';
import { checkFileType } from './files';

export interface TranslateSubtitlesOptions {
  /**
   * Configuration options passed to the AWS SDK Translate client as overrides.
   */
  awsClientOverrides?: TranslateClientConfig;
  /**
   * Turns the progress bar on or off.
   */
  showProgress?: boolean;
  /**
   * Source language for translating the subtitles from.
   */
  sourceLanguage?: SupportedLanguage;
  /**
   * Source track type to select if multiple subtitle tracks of the same
   * language are available.
   *
   * @default 'auto'
   */
  sourceTrackType?: SourceTrackType;
  /**
   * Target language for translating the subtitles to.
   */
  targetLanguage: SupportedLanguage;
  /**
   * Read Stream of the video file you would like to translate subtitles for.
   */
  video: ReadStream;
}

export const translateSubtitles = async ({
  awsClientOverrides = {},
  video,
  showProgress = false,
  targetLanguage,
  sourceTrackType = 'auto',
  sourceLanguage = 'en',
}: TranslateSubtitlesOptions): Promise<string> => {
  await checkFileType(video);

  const limit = pLimit(+(process.env.SDK_REQUEST_RATE_LIMIT || '') || 5);

  const translate = getTranslateClient(awsClientOverrides);

  const tracks: TracksMap = new Map();
  const parser = new SubtitleParser();

  parser.once('tracks', subtitleTracks => {
    for (const track of subtitleTracks) {
      tracks.set(track.number, {
        language: track.language,
        subtitles: [],
      });
    }

    parser.on('subtitle', (subtitle, trackNumber) => {
      tracks.get(trackNumber)?.subtitles.push(subtitle);
    });
  });

  video.pipe(parser);

  await once(parser, 'finish');

  const { sourceTrack, sourceLanguage: matchedSourceLanguage } =
    findSourceLanguageTrack({ tracks, sourceLanguage, sourceTrackType });

  if (matchedSourceLanguage !== sourceLanguage) {
    console.warn(
      `Provided source langauge did not match source language found in video, using ${matchedSourceLanguage} for translation source.`
    );
  }

  let bar: { tick: () => null } | ProgressBar = {
    tick: () => null,
  };

  if (showProgress) {
    bar = new ProgressBar('Translating [:bar] :percent / :etas remaining', {
      total: sourceTrack.subtitles.length,
      width: 100,
    });
  }

  const translatedSubs = sourceTrack.subtitles.map((sub, idx) => {
    return limit(async () => {
      const { TranslatedText } = await translate.send(
        new TranslateTextCommand({
          SourceLanguageCode: matchedSourceLanguage,
          TargetLanguageCode: targetLanguage,
          Text: sub.text,
        })
      );
      const srtValue = createSrtEntry({
        index: idx + 1,
        time: sub.time,
        duration: sub.duration,
        subtitleText: TranslatedText || '',
      });
      bar.tick();
      return srtValue;
    });
  });

  const result = await Promise.all(translatedSubs);

  return result.join('\n\n');
};
