import {
  ListLanguagesCommand,
  TranslateClient,
} from '@aws-sdk/client-translate';
import { InvalidLanguageError, NoSubtitleTracksError } from './errors';
import { SourceTrackType, SupportedLanguage, Track, TracksMap } from './types';

/**
 * ISO 639-1 to ISO 639-2 map.
 */
export const iso6391To6392: Record<string, string> = {
  aa: 'aar',
  ab: 'abk',
  af: 'afr',
  ak: 'aka',
  sq: 'alb',
  am: 'amh',
  ar: 'ara',
  an: 'arg',
  hy: 'arm',
  as: 'asm',
  av: 'ava',
  ae: 'ave',
  ay: 'aym',
  az: 'aze',
  ba: 'bak',
  bm: 'bam',
  eu: 'baq',
  be: 'bel',
  bn: 'ben',
  bh: 'bih',
  bi: 'bis',
  bs: 'bos',
  br: 'bre',
  bg: 'bul',
  my: 'bur',
  ca: 'cat',
  ch: 'cha',
  ce: 'che',
  zh: 'chi',
  cu: 'chu',
  cv: 'chv',
  kw: 'cor',
  co: 'cos',
  cr: 'cre',
  cs: 'cze',
  da: 'dan',
  dv: 'div',
  nl: 'dut',
  dz: 'dzo',
  en: 'eng',
  eo: 'epo',
  et: 'est',
  ee: 'ewe',
  fo: 'fao',
  fj: 'fij',
  fi: 'fin',
  fr: 'fre',
  fy: 'fry',
  ff: 'ful',
  ka: 'geo',
  de: 'ger',
  gd: 'gla',
  ga: 'gle',
  gl: 'glg',
  gv: 'glv',
  el: 'gre',
  gn: 'grn',
  gu: 'guj',
  ht: 'hat',
  ha: 'hau',
  he: 'heb',
  hz: 'her',
  hi: 'hin',
  ho: 'hmo',
  hr: 'hrv',
  hu: 'hun',
  ig: 'ibo',
  is: 'ice',
  io: 'ido',
  ii: 'iii',
  iu: 'iku',
  ie: 'ile',
  ia: 'ina',
  id: 'ind',
  ik: 'ipk',
  it: 'ita',
  jv: 'jav',
  ja: 'jpn',
  kl: 'kal',
  kn: 'kan',
  ks: 'kas',
  kr: 'kau',
  kk: 'kaz',
  km: 'khm',
  ki: 'kik',
  rw: 'kin',
  ky: 'kir',
  kv: 'kom',
  kg: 'kon',
  ko: 'kor',
  kj: 'kua',
  ku: 'kur',
  lo: 'lao',
  la: 'lat',
  lv: 'lav',
  li: 'lim',
  ln: 'lin',
  lt: 'lit',
  lb: 'ltz',
  lu: 'lub',
  lg: 'lug',
  mk: 'mac',
  mh: 'mah',
  ml: 'mal',
  mi: 'mao',
  mr: 'mar',
  ms: 'may',
  mg: 'mlg',
  mt: 'mlt',
  mn: 'mon',
  na: 'nau',
  nv: 'nav',
  nr: 'nbl',
  nd: 'nde',
  ng: 'ndo',
  ne: 'nep',
  nn: 'nno',
  nb: 'nob',
  no: 'nor',
  ny: 'nya',
  oc: 'oci',
  oj: 'oji',
  or: 'ori',
  om: 'orm',
  os: 'oss',
  pa: 'pan',
  fa: 'per',
  pi: 'pli',
  pl: 'pol',
  pt: 'por',
  ps: 'pus',
  qu: 'que',
  rm: 'roh',
  ro: 'rum',
  rn: 'run',
  ru: 'rus',
  sg: 'sag',
  sa: 'san',
  si: 'sin',
  sk: 'slo',
  sl: 'slv',
  se: 'sme',
  sm: 'smo',
  sn: 'sna',
  sd: 'snd',
  so: 'som',
  st: 'sot',
  es: 'spa',
  sc: 'srd',
  sr: 'srp',
  ss: 'ssw',
  su: 'sun',
  sw: 'swa',
  sv: 'swe',
  ty: 'tah',
  ta: 'tam',
  tt: 'tat',
  te: 'tel',
  tg: 'tgk',
  tl: 'tgl',
  th: 'tha',
  bo: 'tib',
  ti: 'tir',
  to: 'ton',
  tn: 'tsn',
  ts: 'tso',
  tk: 'tuk',
  tr: 'tur',
  tw: 'twi',
  ug: 'uig',
  uk: 'ukr',
  ur: 'urd',
  uz: 'uzb',
  ve: 'ven',
  vi: 'vie',
  vo: 'vol',
  cy: 'wel',
  wa: 'wln',
  wo: 'wol',
  xh: 'xho',
  yi: 'yid',
  yo: 'yor',
  za: 'zha',
  zu: 'zul',
};

export interface ValidateLanguagesInput {
  translate: TranslateClient;
  languages: SupportedLanguage[];
}

export const validateLanguages = async ({
  translate,
  languages,
}: ValidateLanguagesInput): Promise<void> => {
  const listLanguagesResponse = await translate.send(
    new ListLanguagesCommand({})
  );
  for (const language of languages) {
    const match = listLanguagesResponse.Languages?.find(
      supportedLanguage => supportedLanguage.LanguageCode === language
    );
    if (!match) {
      throw new InvalidLanguageError();
    }
  }
};

export interface FindSourceLanguageTrackInput {
  tracks: TracksMap;
  sourceLanguage: SupportedLanguage;
  sourceTrackType?: SourceTrackType;
}

export const findSourceLanguageTrack = ({
  sourceLanguage,
  sourceTrackType = 'auto',
  tracks,
}: FindSourceLanguageTrackInput): {
  sourceTrack: Track;
  sourceLanguage: SupportedLanguage;
} => {
  const iso6391 = iso6391To6392[sourceLanguage];

  let trackMatches = [...tracks.values()]
    .filter(track => track.language === iso6391)
    .sort((a, b) => a.subtitles.length - b.subtitles.length);

  if (!trackMatches.length && iso6391 === 'eng') {
    trackMatches = [...tracks.values()]
      .filter(
        // English is sometimes represented as undefined
        track => track.language === undefined
      )
      .sort((a, b) => a.subtitles.length - b.subtitles.length);
  }

  let sourceTrack: Track | undefined;

  if (trackMatches.length >= 3) {
    sourceTrack =
      sourceTrackType === 'auto'
        ? trackMatches[1]
        : sourceTrackType === 'forced'
        ? trackMatches[0]
        : sourceTrackType === 'sdh'
        ? trackMatches[trackMatches.length - 1]
        : undefined;
  } else if (trackMatches.length === 2) {
    sourceTrack =
      sourceTrackType === 'auto' || sourceTrackType === 'sdh'
        ? trackMatches[1]
        : sourceTrackType === 'forced'
        ? trackMatches[0]
        : undefined;
  } else if (trackMatches.length === 1) {
    sourceTrack = trackMatches[0];
  } else {
    sourceTrack = tracks.get(1);
    sourceLanguage = 'auto';
  }

  if (!sourceTrack) {
    throw new NoSubtitleTracksError();
  }

  return { sourceTrack, sourceLanguage };
};
