import { injectGlobal } from "styled-components"

import * as lato700 from "~/res/fonts/lato/Lato-Bold.woff2"
import * as lato700Italic from "~/res/fonts/lato/Lato-BoldItalic.woff2"
import * as lato400 from "~/res/fonts/lato/Lato-Regular.woff2"
import * as ptSerif700Italic from "~/res/fonts/pt-serif/pt-serif-v8-latin-700italic.woff2"
import * as ptSerif400 from "~/res/fonts/pt-serif/pt-serif-v8-latin-regular.woff2"

// tslint:disable-next-line:no-unused-expression
injectGlobal`
  html, body {
    margin: 0;
    padding: 0;

    @media (min-width: 1920px) {
      font-size: 1.1em;
    }
    @media (min-width: 2560px) {
      font-size: 1.2em;
    }
  }

  @font-face {
    font-family: 'Lato';
    font-style: normal;
    font-weight: 400;
    src: local('Lato Regular'), local('Lato-Regular'),
        url('${lato400}') format('woff2');
  }
  @font-face {
    font-family: 'Lato';
    font-style: normal;
    font-weight: 700;
    src: local('Lato Bold'), local('Lato-Bold'),
        url('${lato700}') format('woff2');
  }
  @font-face {
    font-family: 'Lato';
    font-style: italic;
    font-weight: 700;
    src: local('Lato Bold Italic'), local('Lato-BoldItalic'),
        url('${lato700Italic}') format('woff2');
  }
  @font-face {
    font-family: 'PT Serif';
    font-style: normal;
    font-weight: 400;
    src: local('PT Serif'), local('PTSerif-Regular'),
        url('${ptSerif400}') format('woff2');
  }
  @font-face {
    font-family: 'PT Serif';
    font-style: italic;
    font-weight: 700;
    src: local('PT Serif Bold Italic'), local('PTSerif-BoldItalic'),
        url('${ptSerif700Italic}') format('woff2');
  }
`
