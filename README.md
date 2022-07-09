# Lisons!

A desktop e-book reader for language learners intended to help learning from reading by providing machine translations ([DeepL](https://www.deepl.com/translator), [Google](https://translate.google.com/)) as well as human-translated example sentences ([Tatoeba](https://tatoeba.org/), [Reverso Context](http://context.reverso.net)). For Linux, macOS and Windows.

![](website/resources/screenshot.png?raw=true)

## RETIREMENT NOTICE

**This project has been retired in 2018.** (It required a substantial rewrite due to the fundamentally flawed way in which it approached loading and rendering documents, and at the same time the author has lost use for it, having found an e-reader sufficient for his learning purposes and more comfortable to use).

**If you are looking for similar software**, please give [Coditra](https://github.com/fauu/Coditra) a look. It is intended for translation work, but it has similar functionality to Lisons! and can also be useful for learning through reading.

## Features

* Epub and plain text support
* Over 100 supported languages*
* Machine translations from DeepL and Google
* Human-translated example sentences from Tatoeba and Reverso Context
* Highly customizable reader interface

<sub>
* Most of language configurations have not yet been tested and may not work as intended.
</sub>

## Building

1. Clone the repository: ```git clone https://github.com/fauu/lisons.git```
2. Change to project root directory: ```cd lisons```
3. Install dependencies: ```yarn install```
4. Build: ``yarn build:prod``
5. Create distributable packages for selected platforms: ``yarn dist:<platform>`` (where ```<platform> = linux | macos | windows```)*

<sub>* Might require additional tools. Please consult [electron-builder documentation](https://www.electron.build/).</sub>

## License

See [COPYING](COPYING.md) and [LICENSE](LICENSE.md).
