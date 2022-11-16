import {
  TranslateClient,
  TranslateClientConfig,
} from '@aws-sdk/client-translate';
import defaultsDeep from 'lodash.defaultsdeep';

export const DEFAULT_CONFIG: TranslateClientConfig = {
  region: process.env.AWS_REGION,
  // Recommended 10 retry attempts to avoid failures as a result of throttling
  maxAttempts: +(process.env.AWS_MAX_ATTEMPTS || 0) || 10,
};

export const getTranslateClient = (
  awsClientOverrides: TranslateClientConfig
): TranslateClient => {
  return new TranslateClient(defaultsDeep(awsClientOverrides, DEFAULT_CONFIG));
};
