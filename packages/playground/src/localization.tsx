import { localizationDictionary, localizeTo, __l } from '@fidanjs/localization';

localizationDictionary['en'] = {
  'Merhaba Dünya': 'Hello World',
  Türkçe: 'Turkish',
  İngilizce: 'English',
};

const LocalizationApp = () => {
  return (
    <div>
      <strong>{__l('Merhaba Dünya')}</strong>
      <hr />
      <button onClick={() => localizeTo('tr')}>{__l('Türkçe')}</button>
      <button onClick={() => localizeTo('en')}>{__l('İngilizce')}</button>
    </div>
  );
};

document.getElementById('main').appendChild(LocalizationApp() as any);
