import { createState, createSignal, createContext, Component, useContext } from 'solid-js';

/**
 * Safely access deep values in an object via a string path seperated by `.`
 *
 * This util is largely inspired by [dlv](https://github.com/developit/dlv/blob/master/index.js) and passes all its tests
 *
 *
 * @param obj {Record<string, unknown>} - The object to parse
 * @param path {string} - The path to search in the object
 * @param [defaultValue] {unknown} -  A default value if the path doesn't exist in the object
 *
 * @returns {any} - The value if found, the default provided value if set and not found, undefined otherwise
 *
 * @example
 *
 * ```js
 * const obj = { a: { b : { c: 'hello' } } };
 *
 * const value = deepReadObject(obj, 'a.b.c');
 * // => 'hello'
 * const notFound = deepReadObject(obj, 'a.b.d');
 * // => undefined
 * const notFound = deepReadObject(obj, 'a.b.d', 'not found');
 * // => 'not found'
 * ```
 */
function deepReadObject<T = any>(
  obj: Record<string, unknown>,
  path: string,
  defaultValue?: unknown,
): T {
  const value = path
    .trim()
    .split('.')
    .reduce<any>((a, b) => (a ? a[b] : undefined), obj);

  return value !== undefined ? value : defaultValue;
}

/**
 * Provided a string template it will replace dynamics parts in place of variables.
 *
 * This util is largely inspired by [templite](https://github.com/lukeed/templite/blob/master/src/index.js)
 *
 * @param str {string} - The string you wish to use as template
 * @param params {Record<string, string>} - The params to inject into the template
 * @param [reg=/{{(.*?)}}/g] {RegExp} - The RegExp used to find and replace
 *
 * @returns {string} - The fully injected template
 *
 * @example
 * ```js
 * const txt = templat('Hello {{ name }}', { name: 'Tom' });
 * // => 'Hello Tom'
 * ```
 */
function template(str: string, params: Record<string, string>, reg: RegExp = /{{(.*?)}}/g): string {
  return str.replace(reg, (_, key) => deepReadObject(params, key, ''));
}

/**
 * This creates a I18nContext. It's extracted into a function to be able to type the Context
 * before it's even initialized.
 *
 * @param [init={}] {Record<string, Record<string, any>>} - Initial dictionary of languages
 * @param [lang=navigator.language] {string} - The default language fallback to browser language if not set
 */
function createI18nContext(
  init: Record<string, Record<string, any>> = {},
  lang: string = navigator.language,
): readonly [
  (key: string, params?: Record<string, string>, defaultValue?: string) => string,
  {
    add(lang: string, table: Record<string, any>): void;
    locale: (lang?: string) => string;
    dict: (lang: string) => Record<string, Record<string, any>>;
  },
] {
  const [locale, setLocale] = createSignal(lang);
  const [dict, setDict] = createState(init);

  /**
   * The main translation function of the library, given a key, it will look into its
   * dictionnaries to find th right translationb for that key and fallback to the default
   * translation provided in last argument (if provided).
   *
   * You can additionally give as a second arguments dynamic parameters to inject into the
   * the translation.
   *
   * @param key {string} - The key to look translation for
   * @param [params] {Record<string, string>} - Parameters to pass into the translation template
   * @param [defaultValue] {string} - Default value if the translation isn't found
   *
   * @returns {strig} - The translated string
   *
   * @example
   * ```tsx
   * const [t] = useI18n();
   *
   * const dict = { fr: 'Bonjour {{ name }} !' }
   *
   * t('hello', { name: 'John' }, 'Hello, {{ name }}!');
   * locale('fr')
   * // => 'Bonjour John !'
   * locale('unknown')
   * // => 'Hello, John!'
   * ```
   */
  const translate = (
    key: string,
    params?: Record<string, string>,
    defaultValue?: string,
  ): string => {
    const val = deepReadObject(dict[locale()], key, defaultValue || '');
    if (typeof val === 'function') return val(params);
    if (typeof val === 'string') return template(val, params || {});
    return val;
  };

  const actions = {
    /**
     * Add (or edit an existing) locale
     *
     * @param lang {string} - The locale to add or edit
     * @param table {Record<string, any>} - The dictionary
     *
     * @example
     * ```js
     * const [_, { add }] = useI18n();
     *
     * const addSwedish = () => add('sw', { hello: 'Hej {{ name }}' })
     * ```
     */
    add(lang: string, table: Record<string, any>) {
      setDict(lang, (t) => Object.assign(t || {}, table));
    },

    /**
     * Switch to the language in the parameters.
     * Retrieve the current locale if no params
     *
     * @param [lang] {string} - The locale to switch to
     *
     * * @example
     * ```js
     * const [_, { locale }] = useI18n();
     *
     * locale()
     * // => 'fr'
     * locale('sw')
     * locale()
     * // => 'sw'
     *
     * ```
     */
    locale: (lang?: string) => (lang ? setLocale(lang) : locale()),

    /**
     * Retrieve the dictionary of a language
     *
     * @param lang {string} - The language to retrieve from
     */
    dict: (lang: string) => deepReadObject(dict, lang),
  };

  return [translate, actions] as const;
}

// The context
const I18nContext = createContext<ReturnType<typeof createI18nContext>>();

/**
 * Instanciate a translation provider.
 *
 * @param props {{ dict?: Record<string, Record<string, any>>; locale?: string }} - Where dict is the dictionarry of languages & locale is the default languages you want
 *
 * @example
 * ```tsx
 * import { Component } from 'solid-js';
 * import { render } from 'solid-js/dom';
 * import { I18nProvider, useI18n } from '@amoutonbrady/solid-i18n';
 *
 * const App: Component = () => {
 *  const [t] = useI18n();
 *
 *  return <p>{ t('hello', { name: 'Tom' }) }</p>;
 * }
 *
 * const dict = {
 *  fr: { hello: "bonjour {{ name }}, comment vas-tu ?" },
 *  en: { hello: "hello {{ name }}, how are you?" },
 * };
 *
 * render(() => <I18nProvider dict={dict} locale="en"><App /></I18nProvider>, document.getElementById('app'))
 * // => <p>Hello Tom</p>
 * ```
 */
export const I18nProvider: Component<{
  dict?: Record<string, Record<string, any>>;
  locale?: string;
}> = (props) => {
  const value = createI18nContext(props.dict, props.locale);

  return <I18nContext.Provider value={value}>{props.children}</I18nContext.Provider>;
};

export const useI18n = () => useContext(I18nContext);
