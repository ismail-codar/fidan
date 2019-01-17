import { Main } from './views/Main';

const mainView = Main();
const appMainDom = document.getElementById('app_main');
if (appMainDom.firstElementChild) appMainDom.firstElementChild.remove();
appMainDom.appendChild(mainView as any);
