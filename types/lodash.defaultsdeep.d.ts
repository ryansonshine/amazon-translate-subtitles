declare module 'lodash.defaultsdeep' {
  declare function defaultsDeep<T = any>(object: T, ...sources: T[]): T;

  export = defaultsDeep;
}
