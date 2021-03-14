import * as fidan from '../src';

const dictionary = {
  tr: {
    'Hello World': 'Merhaba Dünya',
    Turkish: 'Türkçe',
    English: 'İngilizce',
  },
};

let currentLang = '';
let targetLang = fidan.observable('');
const localizeTo = (lng: string) => {
  if (currentLang === lng) {
    return;
  }
  targetLang(lng);
  window.requestAnimationFrame(() => {
    currentLang = lng;
  });
};

const __t = str =>
  fidan.computed(() => {
    if (targetLang() === currentLang) {
      return str;
    }
    const languageDictionary = dictionary[targetLang()];
    if (!languageDictionary) {
      return str;
    }
    return languageDictionary[str] || str;
  });

const LocalizationAPP = fidan.html`<div>
    ${__t('Hello World')}
    <hr/>
    <button onclick="${() => localizeTo('tr')}">
        ${__t('Turkish')}
    </button>
    <button onclick="${() => localizeTo('en')}">
        ${__t('English')}
    </button>
</div>`;

document.getElementById('main').appendChild(LocalizationAPP);
