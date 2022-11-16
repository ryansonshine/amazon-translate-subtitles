const mockTick = jest.fn();

jest.mock('progress', () => {
  return jest.fn().mockImplementation(() => {
    return { tick: mockTick };
  });
});

import {
  TranslateClient,
  TranslateTextCommand,
} from '@aws-sdk/client-translate';
import { createReadStream, promises } from 'fs';
import { resolve } from 'path';
import { translateSubtitles } from '../src/translate';
import { mockClient } from 'aws-sdk-client-mock';
import { NoSubtitleTracksError, UnsupportedFileTypeError } from '../src/errors';

const translateMock = mockClient(TranslateClient);

const doublesDirectory = resolve(__dirname, './doubles/');
const videoWithSubs = `${doublesDirectory}/test-with-subs.mkv`;
const videoWithoutSubs = `${doublesDirectory}/test-without-subs.mkv`;
const unsupportedVideo = `${doublesDirectory}/test-unsupported-file.mp4`;

describe('translate', () => {
  describe('translateSubtitles', () => {
    beforeEach(() => {
      translateMock.reset();
      mockTick.mockClear();
    });

    it('should return the expected translated subtitles with an mkv containing subs', async () => {
      const video = createReadStream(videoWithSubs);
      const expected = await promises.readFile(
        `${doublesDirectory}/test-with-subs.th_TH.srt`
      );
      translateMock
        .on(TranslateTextCommand)
        .resolvesOnce({ TranslatedText: '... ยักษ์ใหญ่แห่งโรดส์!' })
        .resolvesOnce({ TranslatedText: 'ไม่!' })
        .resolvesOnce({
          TranslatedText:
            'ยักษ์ใหญ่แห่งโรดส์\nและมันก็เป็นที่นี่เพียงสำหรับคุณ Proog.',
        })
        .resolvesOnce({ TranslatedText: 'มันอยู่ที่นั่น...' })
        .resolvesOnce({ TranslatedText: 'ผมกำลังบอกคุณ\nอีโม...\n' });

      const result = await translateSubtitles({ video, targetLanguage: 'th' });

      expect(result).toEqual(expected.toString());
    });

    it('should throw an error if the provided video does not have any subtitles', async () => {
      const video = createReadStream(videoWithoutSubs);

      const fn = () => translateSubtitles({ video, targetLanguage: 'th' });

      await expect(fn).rejects.toThrowError(NoSubtitleTracksError);
    });

    it('should throw an error if the provided video format is not supported', async () => {
      const video = createReadStream(unsupportedVideo);

      const fn = () => translateSubtitles({ video, targetLanguage: 'th' });

      await expect(fn).rejects.toThrowError(UnsupportedFileTypeError);
    });

    it('should show a progress bar when showProgress is true', async () => {
      const video = createReadStream(videoWithSubs);
      translateMock.on(TranslateTextCommand).resolves({ TranslatedText: '' });

      await translateSubtitles({
        video,
        targetLanguage: 'th',
        showProgress: true,
      });

      expect(mockTick).toHaveBeenCalled();
    });

    it('should not show a progress bar when showProgress is not set to true', async () => {
      const video = createReadStream(videoWithSubs);
      translateMock.on(TranslateTextCommand).resolves({ TranslatedText: '' });

      await translateSubtitles({
        video,
        targetLanguage: 'th',
      });

      expect(mockTick).not.toHaveBeenCalled();
    });
  });
});
