import { Component } from 'solid-js';
import { render } from 'solid-js/web';
import { useI18n, I18nProvider } from '@amoutonbrady/solid-i18n';

const App: Component = () => {
  const [t, { locale }] = useI18n();

  return (
    <>
      <h1>{t('title')}</h1>
      <button onClick={() => locale('en')}>en</button>
    </>
  );
};

const dict = {
  fr: {
    title: 'Bonjour',
  },
  en: {
    title: 'Hello',
  },
};

render(
  () => (
    <I18nProvider dict={dict}>
      <App />
    </I18nProvider>
  ),
  document.getElementById('app'),
);
