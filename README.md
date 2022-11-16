# amazon-translate-subtitles

[![npm package][npm-img]][npm-url]
[![Build Status][build-img]][build-url]
[![Downloads][downloads-img]][downloads-url]
[![Issues][issues-img]][issues-url]
[![Code Coverage][codecov-img]][codecov-url]
[![Commitizen Friendly][commitizen-img]][commitizen-url]
[![Semantic Release][semantic-release-img]][semantic-release-url]

> Translate subtitles embedded in video files using Amazon Translate

Currently supports mkv input and srt output.

## Install

```bash
npm install amazon-translate-subtitles
```

## Usage

```ts
import { translateSubtitles } from 'amazon-translate-subtitles';

const video = createReadStream('my-video.mkv');

const thaiSubs = await translateSubtitles({ video, targetLanguage: 'th' });
console.log(thaiSubs);
/*
"
1
00:00:03,549 --> 00:00:05,290
... ยักษ์ใหญ่แห่งโรดส์!

2
00:00:05,757 --> 00:00:06,678
ไม่!
"
*/
```

## API

### translateSubtitles(options)

#### options

Type: `object`

##### awsClientOverrides

Type: `object`

Default: `{}`

Configuration options passed to the AWS SDK Translate client as overrides.

##### showProgress

Type: `boolean`

Default: `false`

Turns the progress bar on or off.

##### sourceLanguage

Type: `string`

Default: `'en'`

Source language for translating the subtitles from.

##### targetLanguage

Type: `string`

Target language for translating the subtitles to.

##### video

Type: `ReadStream`

Read Stream of the video file you would like to translate subtitles for.

## Related

- [amazon-translate-subtitles-cli][cli-url] - CLI for this module

[build-img]:https://github.com/ryansonshine/amazon-translate-subtitles/actions/workflows/release.yml/badge.svg
[build-url]:https://github.com/ryansonshine/amazon-translate-subtitles/actions/workflows/release.yml
[downloads-img]:https://img.shields.io/npm/dt/amazon-translate-subtitles
[downloads-url]:https://www.npmtrends.com/amazon-translate-subtitles
[npm-img]:https://img.shields.io/npm/v/amazon-translate-subtitles
[npm-url]:https://www.npmjs.com/package/amazon-translate-subtitles
[issues-img]:https://img.shields.io/github/issues/ryansonshine/amazon-translate-subtitles
[issues-url]:https://github.com/ryansonshine/amazon-translate-subtitles/issues
[codecov-img]:https://codecov.io/gh/ryansonshine/amazon-translate-subtitles/branch/main/graph/badge.svg
[codecov-url]:https://codecov.io/gh/ryansonshine/amazon-translate-subtitles
[semantic-release-img]:https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]:https://github.com/semantic-release/semantic-release
[commitizen-img]:https://img.shields.io/badge/commitizen-friendly-brightgreen.svg
[commitizen-url]:http://commitizen.github.io/cz-cli/
[cli-url]:https://github.com/ryansonshine/amazon-translate-subtitles-cli
