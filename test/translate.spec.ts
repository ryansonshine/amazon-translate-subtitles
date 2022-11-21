const mockTick = jest.fn();

const mockSend = jest.fn();

jest.mock('progress', () => {
  return jest.fn().mockImplementation(() => {
    return { tick: mockTick };
  });
});

jest.mock('@aws-sdk/client-translate', () => {
  return {
    TranslateClient: jest.fn().mockImplementation(() => {
      return { send: mockSend };
    }),
    TranslateTextCommand: jest.fn().mockImplementation(() => {
      return {};
    }),
  };
});

import { createReadStream, promises } from 'fs';
import { resolve } from 'path';
import { translateSubtitles } from '../src/translate';
import { NoSubtitleTracksError, UnsupportedFileTypeError } from '../src/errors';

const doublesDirectory = resolve(__dirname, './doubles/');
const videoWithSubs = `${doublesDirectory}/test-with-subs.mkv`;
const videoWithoutSubs = `${doublesDirectory}/test-without-subs.mkv`;
const unsupportedVideo = `${doublesDirectory}/test-unsupported-file.mp4`;

describe('translate', () => {
  beforeEach(() => {
    mockSend.mockResolvedValue({ TranslatedText: '' });
    jest.clearAllMocks();
  });

  it('should return the expected translated subtitles with an mkv containing subs', async () => {
    mockSend
      .mockResolvedValueOnce({ TranslatedText: '... ยักษ์ใหญ่แห่งโรดส์!' })
      .mockResolvedValueOnce({ TranslatedText: 'ไม่!' })
      .mockResolvedValueOnce({
        TranslatedText:
          'ยักษ์ใหญ่แห่งโรดส์\nและมันก็เป็นที่นี่เพียงสำหรับคุณ Proog.',
      })
      .mockResolvedValueOnce({ TranslatedText: 'มันอยู่ที่นั่น...' })
      .mockResolvedValueOnce({ TranslatedText: 'ผมกำลังบอกคุณ\nอีโม...' });
    const video = createReadStream(videoWithSubs);
    const expected = await promises.readFile(
      `${doublesDirectory}/test-with-subs.th.srt`
    );

    const result = await translateSubtitles({ video, targetLanguage: 'th' });

    expect(result.trim()).toEqual(expected.toString().trim());
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

    await translateSubtitles({
      video,
      targetLanguage: 'th',
      showProgress: true,
    });

    expect(mockTick).toHaveBeenCalled();
  });

  it('should not show a progress bar when showProgress is not set to true', async () => {
    const video = createReadStream(videoWithSubs);

    await translateSubtitles({
      video,
      targetLanguage: 'th',
    });

    expect(mockTick).not.toHaveBeenCalled();
  });
});
