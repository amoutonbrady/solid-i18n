import '@testing-library/jest-dom/extend-expect';
import { render } from 'solid-testing-library';
import { I18nProvider, useI18n } from '../solid-i18n';

test('translate correctly without locale specified', () => {
  const App = () => {
    const [t] = useI18n();
    return <h1>{t('title')}</h1>;
  };

  const dict = {
    fr: {
      title: 'Bonjour',
    },
    en: {
      title: 'Hello',
    },
  };

  const { getByText } = render(() => <I18nProvider dict={dict} children={<App />} />);

  expect(getByText(dict.fr.title)).toBeInTheDocument();
});

test('translate correctly with locale specified', () => {
  const App = () => {
    const [t] = useI18n();
    return <h1>{t('title')}</h1>;
  };

  const dict = {
    fr: {
      title: 'Bonjour',
    },
    en: {
      title: 'Hello',
    },
  };

  const { getByText } = render(() => <I18nProvider locale="en" dict={dict} children={<App />} />);

  expect(getByText(dict.en.title)).toBeInTheDocument();
});

test('can switch language', () => {
  const App = () => {
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

  const { getByText, baseElement } = render(() => (
    <I18nProvider locale="fr" dict={dict} children={<App />} />
  ));

  expect(getByText(dict.fr.title)).toBeInTheDocument();
  baseElement.querySelector('button').click();
  expect(getByText(dict.en.title)).toBeInTheDocument();
});
