import * as fidan from '@fidanjs/runtime';

export const localizationDictionary: {
  [dict: string]: {
    [word: string]: string;
  };
} = {};

export let currentLang = '';
let targetLang = fidan.observable('');
export const localizeTo = (lng: string) => {
  if (currentLang === lng) {
    return;
  }
  targetLang(lng);
  currentLang = lng;
};

export const __l = (str: string) =>
  fidan.computed(() => {
    if (targetLang() === currentLang) {
      return str;
    }
    const dict = localizationDictionary[targetLang()];
    if (!dict) {
      return str;
    }
    return dict[str] || str;
  });
