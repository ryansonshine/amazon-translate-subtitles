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

      const sourceLanguageTrack = findSourceLanguageTrack(tracks, 'en');

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

      const sourceLanguageTrack = findSourceLanguageTrack(tracks, 'en');

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

      const sourceLanguageTrack = findSourceLanguageTrack(tracks, 'de');

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

      const sourceLanguageTrack = findSourceLanguageTrack(tracks, 'am');

      expect(sourceLanguageTrack).toEqual({
        sourceTrack: frenchTrack,
        sourceLanguage: 'auto',
      });
    });

    it('should throw an error when no subtitle tracks are found', () => {
      const tracks: TracksMap = new Map();

      const fn = () => findSourceLanguageTrack(tracks, 'en');

      expect(fn).toThrowError(NoSubtitleTracksError);
    });
  });
});
