import { injectGlobal } from "styled-components"

// tslint:disable-next-line:no-unused-expression
injectGlobal`
  html, body {
    margin: 0;
    padding: 0;
  }

  @font-face {
    font-family: 'Lato';
    font-style: normal;
    font-weight: 100;
    src: local('Lato Hairline'), local('Lato-Hairline'),
        url('../res/fonts/lato-v13-latin-100.woff2') format('woff2');
  }
  @font-face {
    font-family: 'Lato';
    font-style: italic;
    font-weight: 100;
    src: local('Lato Hairline Italic'), local('Lato-HairlineItalic'),
        url('../res/fonts/lato-v13-latin-100italic.woff2') format('woff2');
  }
  @font-face {
    font-family: 'Lato';
    font-style: normal;
    font-weight: 300;
    src: local('Lato Light'), local('Lato-Light'),
        url('../res/fonts/lato-v13-latin-300.woff2') format('woff2');
  }
  @font-face {
    font-family: 'Lato';
    font-style: italic;
    font-weight: 300;
    src: local('Lato Light Italic'), local('Lato-LightItalic'),
        url('../res/fonts/lato-v13-latin-300italic.woff2') format('woff2');
  }
  @font-face {
    font-family: 'Lato';
    font-style: normal;
    font-weight: 400;
    src: local('Lato Regular'), local('Lato-Regular'),
        url('../res/fonts/lato-v13-latin-regular.woff2') format('woff2');
  }
  @font-face {
    font-family: 'Lato';
    font-style: italic;
    font-weight: 400;
    src: local('Lato Italic'), local('Lato-Italic'),
        url('../res/fonts/lato-v13-latin-italic.woff2') format('woff2');
  }
  @font-face {
    font-family: 'Lato';
    font-style: normal;
    font-weight: 700;
    src: local('Lato Bold'), local('Lato-Bold'),
        url('../res/fonts/lato-v13-latin-700.woff2') format('woff2');
  }

  @font-face {
    font-family: 'Lato';
    font-style: italic;
    font-weight: 700;
    src: local('Lato Bold Italic'), local('Lato-BoldItalic'),
        url('../res/fonts/lato-v13-latin-700italic.woff2') format('woff2');
  }
  @font-face {
    font-family: 'Lato';
    font-style: normal;
    font-weight: 900;
    src: local('Lato Black'), local('Lato-Black'),
        url('../res/fonts/lato-v13-latin-900.woff2') format('woff2');
  }
  @font-face {
    font-family: 'Lato';
    font-style: italic;
    font-weight: 900;
    src: local('Lato Black Italic'), local('Lato-BlackItalic'),
        url('../res/fonts/lato-v13-latin-900italic.woff2') format('woff2');
  }
  @font-face {
    font-family: 'PT Serif';
    font-style: normal;
    font-weight: 400;
    src: local('PT Serif'), local('PTSerif-Regular'),
        url('../res/fonts/pt-serif-v8-latin-regular.woff2') format('woff2');
  }
  @font-face {
    font-family: 'PT Serif';
    font-style: italic;
    font-weight: 700;
    src: local('PT Serif Bold Italic'), local('PTSerif-BoldItalic'),
        url('../res/fonts/pt-serif-v8-latin-700italic.woff2') format('woff2');
  }
`
