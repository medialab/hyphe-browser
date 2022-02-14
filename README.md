# Hyphe Browser (HyBro)

[![DOI](https://zenodo.org/badge/46920414.svg)](https://zenodo.org/badge/latestdoi/46920414)


Hyphe Browser is a desktop application to be downloaded which consists of a web browser based on Chrome's engine (using [electronJs](https://www.electronjs.org)) connected at all times to médialab's web crawler [Hyphe](http://hyphe.medialab.sciences-po.fr).

It allows to build, curate and annotate a corpus of web entities (websites, parts of websites or agregates) and crawl links between them while browsing their web pages at the same time, so that the user can curate and categorize them easily, in same ways as the [Navicrawler](https://medialab.sciencespo.fr/outils/navicrawler/) used to let one do.


## Simple install

Download the latest release corresponding to your OS from the following page: [https://github.com/medialab/hyphe-browser/releases](https://github.com/medialab/hyphe-browser/releases).
Unzip the archive, then open the folder and start the executable:
- for Linux: `HypheBrowser`
- for MacOS: `HypheBrowser.app` (you might require to allow its execution in your MacOS settings)
- for Windows: `HypheBrowser.exe`


## Development

Just clone the repository, install the dependencies and start the app in development mode by doing:

```sh
git clone https://github.com/medialab/hyphe-browser.git
npm install
npm run dev
```

You can test the build version by running:

```sh
npm run build
```

And you can build releases for different OS (Linux, MacOS & Windows 32/64bit) with the following command:

```sh
npm run release
```

## Credits & License

Hyphe-Browser is a free open source software released under [AGPL 3.0 license](LICENSE).

Conceived by [Benjamin Ooghe-Tabanou](https://github.com/boogheta), [Mathieu Jacomy](https://github.com/jacomyma) and [Thomas Tari](https://medialab.sciencespo.fr/equipe/thomas-tari/) at [médialab Sciences Po](https://medialab.sciencespo.fr/).

First designed by [Agata Brill](https://github.com/agatabr) and implemented by [Bruno Heridet](https://github.com/Delapouite) and [Nicolas Chambrier](https://github.com/naholyr) from ByteClub.

Redesigned by [Robin de Mourat](https://github.com/robindemourat/) and rebuilt by [Mengying Du](https://github.com/mydu) and [Arnaud Pichon](https://github.com/ArnaudMolo) from médialab.

Cloud functionalities were added by [Alexis Jacomy](https://github.com/jacomyal), [Paul Girard](https://github.com/paulgirard) and [Benoît Simard](https://github.com/sim51) from [Ouestware](https://www.ouestware.com/).

This work has been possible thanks to the support of DIME-Web, part of the [DIME-SHS](https://dime-shs.sciencespo.fr/) research equipment financed by the EQUIPEX program (ANR-10-EQPX-19-01) and of the [FORCCAST](http://controverses.org/) pedagogical innovation project financed by the IDEFI program.

Discover more of our projects at [médialab tools](http://tools.medialab.sciences-po.fr/).
