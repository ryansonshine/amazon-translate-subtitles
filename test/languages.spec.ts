jest.mock('@aws-sdk/client-translate');

import { TranslateClient } from '@aws-sdk/client-translate';
import { InvalidLanguageError, NoSubtitleTracksError } from '../src/errors';
import {
  findSourceLanguageTrack,
  validateLanguages,
  ValidateLanguagesInput,
} from '../src/languages';
import { Track, TracksMap } from '../src/types';
import { listLanguagesResponse } from './doubles/translate-client';

const mockTranslate = <jest.Mocked<TranslateClient>>new TranslateClient({});

describe('languages', () => {
  describe('validateLanguages', () => {
    beforeEach(() => {
      mockTranslate.send.mockImplementation(() => listLanguagesResponse);
    });
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should throw an error when one of the languages provided is not supported', async () => {
      const input: ValidateLanguagesInput = {
        // @ts-expect-error Intentionally providing invalid language
        languages: ['en', 'xx'],
        translate: mockTranslate,
      };

      const fn = () => validateLanguages(input);

      await expect(fn()).rejects.toThrow(InvalidLanguageError);
    });

    it('should not throw an error when all languages provided are supported', async () => {
      const input: ValidateLanguagesInput = {
        languages: ['af', 'auto', 'es'],
        translate: mockTranslate,
      };

      const fn = () => validateLanguages(input);

      await expect(fn()).resolves.toBeUndefined();
    });
  });

  describe('getSourceLanguageTrack', () => {
    it('should return track labelled "eng" before returning undefined when provided with "en"', () => {
      const tracks: TracksMap = new Map();
      const frenchTrack: Track = { subtitles: [], language: 'fre' };
      const englishTrack: Track = { subtitles: [], language: 'eng' };
      const englishUndefinedTrack: Track = {
        subtitles: [],
        language: undefined,
      };
      const germanTrack: Track = { subtitles: [], language: 'ger' };
      tracks.set(1, frenchTrack);
      tracks.set(2, englishUndefinedTrack);
      tracks.set(3, englishTrack);
      tracks.set(4, germanTrack);

      const sourceLanguageTrack = findSourceLanguageTrack({
        tracks,
        sourceLanguage: 'en',
      });

      expect(sourceLanguageTrack).toEqual({
        sourceTrack: englishTrack,
        sourceLanguage: 'en',
      });
    });

    it('should return track labelled undefined when no "eng" track exists when provided with "en"', () => {
      const tracks: TracksMap = new Map();
      const frenchTrack: Track = { subtitles: [], language: 'fre' };
      const englishUndefinedTrack: Track = {
        subtitles: [],
        language: undefined,
      };
      const germanTrack: Track = { subtitles: [], language: 'ger' };
      tracks.set(1, frenchTrack);
      tracks.set(2, englishUndefinedTrack);
      tracks.set(3, germanTrack);

      const sourceLanguageTrack = findSourceLanguageTrack({
        tracks,
        sourceLanguage: 'en',
      });

      expect(sourceLanguageTrack).toEqual({
        sourceTrack: englishUndefinedTrack,
        sourceLanguage: 'en',
      });
    });

    it('should return "ger" when provided with "de"', () => {
      const tracks: TracksMap = new Map();
      const frenchTrack: Track = { subtitles: [], language: 'fre' };
      const englishTrack: Track = { subtitles: [], language: 'eng' };
      const englishUndefinedTrack: Track = {
        subtitles: [],
        language: undefined,
      };
      const germanTrack: Track = { subtitles: [], language: 'ger' };
      tracks.set(1, frenchTrack);
      tracks.set(2, englishUndefinedTrack);
      tracks.set(3, englishTrack);
      tracks.set(4, germanTrack);

      const sourceLanguageTrack = findSourceLanguageTrack({
        tracks,
        sourceLanguage: 'de',
      });

      expect(sourceLanguageTrack).toEqual({
        sourceTrack: germanTrack,
        sourceLanguage: 'de',
      });
    });

    it('should return the first track along with "auto" for sourceLanguage if no track matches', () => {
      const tracks: TracksMap = new Map();
      const frenchTrack: Track = { subtitles: [], language: 'fre' };
      const englishTrack: Track = { subtitles: [], language: 'eng' };
      const englishUndefinedTrack: Track = {
        subtitles: [],
        language: undefined,
      };
      const germanTrack: Track = { subtitles: [], language: 'ger' };
      tracks.set(1, frenchTrack);
      tracks.set(2, englishUndefinedTrack);
      tracks.set(3, englishTrack);
      tracks.set(4, germanTrack);

      const sourceLanguageTrack = findSourceLanguageTrack({
        tracks,
        sourceLanguage: 'am',
      });

      expect(sourceLanguageTrack).toEqual({
        sourceTrack: frenchTrack,
        sourceLanguage: 'auto',
      });
    });

    it('should return the subtitle track with the least amount of subtitles if forced is specified', () => {
      const tracks: TracksMap = new Map();
      const sdh: Track = {
        subtitles: [
          { duration: 100, text: 'Hello', time: 100 },
          { duration: 200, text: '[Bangs drum]', time: 1000 },
          { duration: 300, text: 'How are you?', time: 2000 },
          { duration: 300, text: '[In Spanish] I am well.', time: 2000 },
        ],
      };
      const auto: Track = {
        subtitles: [
          { duration: 100, text: 'Hello', time: 100 },
          { duration: 300, text: 'How are you?', time: 2000 },
          { duration: 300, text: '[In Spanish] I am well.', time: 2000 },
        ],
      };
      const forced: Track = {
        subtitles: [{ duration: 300, text: 'I am well.', time: 2000 }],
      };
      tracks.set(1, sdh);
      tracks.set(2, auto);
      tracks.set(3, forced);

      const sourceLanguageTrack = findSourceLanguageTrack({
        tracks,
        sourceLanguage: 'en',
        sourceTrackType: 'forced',
      });

      expect(sourceLanguageTrack).toEqual({
        sourceTrack: forced,
        sourceLanguage: 'en',
      });
    });

    it('should return the subtitle track with the median amount of subtitles with 3 language tracks available', () => {
      const tracks: TracksMap = new Map();
      const sdh: Track = {
        subtitles: [
          { duration: 100, text: 'Hello', time: 100 },
          { duration: 200, text: '[Bangs drum]', time: 1000 },
          { duration: 300, text: 'How are you?', time: 2000 },
          { duration: 300, text: '[In Spanish] I am well.', time: 2000 },
        ],
      };
      const auto: Track = {
        subtitles: [
          { duration: 100, text: 'Hello', time: 100 },
          { duration: 300, text: 'How are you?', time: 2000 },
          { duration: 300, text: '[In Spanish] I am well.', time: 2000 },
        ],
      };
      const forced: Track = {
        subtitles: [{ duration: 300, text: 'I am well.', time: 2000 }],
      };
      tracks.set(1, sdh);
      tracks.set(2, auto);
      tracks.set(3, forced);

      const sourceLanguageTrack = findSourceLanguageTrack({
        tracks,
        sourceLanguage: 'en',
      });

      expect(sourceLanguageTrack).toEqual({
        sourceTrack: auto,
        sourceLanguage: 'en',
      });
    });

    it('should return the subtitle track with the max amount of subtitles with 2 language tracks available', () => {
      const tracks: TracksMap = new Map();
      const auto: Track = {
        subtitles: [
          { duration: 100, text: 'Hello', time: 100 },
          { duration: 300, text: 'How are you?', time: 2000 },
          { duration: 300, text: '[In Spanish] I am well.', time: 2000 },
        ],
      };
      const forced: Track = {
        subtitles: [{ duration: 300, text: 'I am well.', time: 2000 }],
      };
      tracks.set(1, auto);
      tracks.set(2, forced);

      const sourceLanguageTrack = findSourceLanguageTrack({
        tracks,
        sourceLanguage: 'en',
      });

      expect(sourceLanguageTrack).toEqual({
        sourceTrack: auto,
        sourceLanguage: 'en',
      });
    });

    it('should throw an error when no subtitle tracks are found', () => {
      const tracks: TracksMap = new Map();

      const fn = () =>
        findSourceLanguageTrack({ tracks, sourceLanguage: 'en' });

      expect(fn).toThrowError(NoSubtitleTracksError);
    });
  });
});
