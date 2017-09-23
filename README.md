# Lisons!
<p align="center">
<a href="https://travis-ci.org/fauu/lisons"><img src="https://api.travis-ci.org/fauu/lisons.svg?branch=master" alt="Build Status"></a>
<a href="https://david-dm.org/fauu/lisons"><img src="https://david-dm.org/fauu/lisons.svg" alt="Dependency Status"></a>
<a href="https://david-dm.org/fauu/lisons/?type=dev"><img src="https://david-dm.org/fauu/lisons/dev-status.svg" alt="devDependency Status"></a>

A desktop e-book reader for language learners, which facilitates learning from reading by providing machine translations ([DeepL](https://www.deepl.com/translator), [Google](https://translate.google.com/)) as well as human-translated example sentences ([Tatoeba](https://tatoeba.org/), [Reverso Context](http://context.reverso.net)).

Supports Linux, macOS and Windows.

[Current release is available to download on the webiste.](http://fauu.github.io/lisons)

![](website/resources/screenshot.png?raw=true)

Note: This is BETA software, and as such is largely untested and may contain bugs.

## Features

* Epub and plain text support
* Over 100 supported languages*
* Machine translations from DeepL and Google
* Human-translated example sentences from Tatoeba and Reverso Context
* Highly customizable reader interface

<sub>
* Most of language configurations have not yet been tested and may not work as intended.
</sub>

## Roadmap

...

## Building

1. Clone the repository: ```git clone https://github.com/fauu/lisons.git```
2. Change to project root directory: ```cd lisons```
3. Install dependencies: ```yarn install```
4. Build: ``yarn build:prod``
5. Create distributable packages for selected platforms: ``yarn dist:<platform>`` (where ```<platform> = linux | macos | windows```)*

<sub>* Might require additional tools. Please consult [electron-builder documentation](https://www.electron.build/).</sub>

## License

See [COPYING](COPYING.md) and [LICENSE](LICENSE.md).
