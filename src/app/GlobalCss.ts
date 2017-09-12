import { injectGlobal } from "styled-components"

import * as lato700 from "~/res/fonts/lato/lato-v13-latin-ext_latin-700.woff2"
import * as lato400Italic from "~/res/fonts/lato/lato-v13-latin-ext_latin-italic.woff2"
import * as lato400 from "~/res/fonts/lato/lato-v13-latin-ext_latin-regular.woff2"
import * as ptSerif700 from "~/res/fonts/pt-serif/pt-serif-v8-cyrillic-ext_cyrillic_latin-ext_latin-700.woff2"
import * as ptSerif700Italic from "~/res/fonts/pt-serif/pt-serif-v8-cyrillic-ext_cyrillic_latin-ext_latin-700italic.woff2"
import * as ptSerif400 from "~/res/fonts/pt-serif/pt-serif-v8-cyrillic-ext_cyrillic_latin-ext_latin-regular.woff2"

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
    src: url('${lato400}') format('woff2');
  }
  @font-face {
    font-family: 'Lato';
    font-style: italic;
    font-weight: 400;
    src: url('${lato400Italic}') format('woff2');
  }
  @font-face {
    font-family: 'Lato';
    font-style: normal;
    font-weight: 700;
    src: url('${lato700}') format('woff2');
  }
  @font-face {
    font-family: 'PT Serif';
    font-style: normal;
    font-weight: 400;
    src: url('${ptSerif400}') format('woff2');
  }
  @font-face {
    font-family: 'PT Serif';
    font-style: normal;
    font-weight: 700;
    src: url('${ptSerif700}') format('woff2');
  }
  @font-face {
    font-family: 'PT Serif';
    font-style: italic;
    font-weight: 700;
    src: url('${ptSerif700Italic}') format('woff2');
  }
`
