# solid-i18n

Tiny translation library for [solid-js]() inspired by [rosetta](https://github.com/lukeed/rosetta)

## Quick start

Install it:

```bash
yarn add @amoutonbrady/solid-i18n
```

Use it:

```tsx
import { render } from 'solid-js/dom';
import { Component, createSignal } from 'solid-js';
import { I18nProvider, useI18n } from '@amoutonbrady/solid-i18n';

const App: Component = () => {
  const [t, { add, locale, dict }] = useI18n();
  const [name, setName] = createSignal('Greg');

  const addLanguage = () => {
    add('sw', { hello: 'hej {{ name }}, hur mar du?' });
    locale('sw');
  };

  return (
    <>
      <button onClick={() => locale('fr')}>fr</button>
      <button onClick={() => locale('en')}>en</button>
      <button onClick={() => locale('unknownLanguage')}>unknown language</button>
      <button onClick={addLanguage}>add and set swedish</button>
      <input value={name()} onInput={(e) => setName(e.target.value)} />

      <hr />

      <h1>{t('hello', { name: name() }, 'Hello {{ name }}!')}!</h1>
      <p>{locale()}</p>
      <pre>
        <code>{JSON.stringify(dict('sw'), null, 4)}</code>
      </pre>
    </>
  );
};

const dict = {
  fr: {
    hello: 'bonjour {{ name }}, comment vas-tu ?',
  },
  en: {
    hello: 'hello {{ name }}, how are you?',
  },
};

render(
  () => (
    <I18nProvider dict={dict} locale="fr">
      <App />
    </I18nProvider>
  ),
  document.getElementById('app'),
);
```
