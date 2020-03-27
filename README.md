# Hyphe Browser (HyBro)

Hyphe Browser is a desktop application to be downloaded which consists of a web browser based on Chrome's engine (using electron). It allows to browse the web while being connected to Hyphe at all times.
It permits to build a web corpus while visualizing the pages of the websites so that the user can curate and categorize them easily.

## Install

```sh
npm install
npm start
```

## Development

```sh
npm install
npm run dev
```

## Binary release

```sh
npm run release
```

## API notes

https://github.com/medialab/hyphe/blob/master/doc/api.md

### `create_corpus`

- it will answer positively after about 5 seconds if not too many instances are currently running on the server. The received result is not a complete corpus object, but rather something like `{ready: true, status: "ready", corpus_id: "foo"} `
- if too many instances are running, a negative message will be received right away.
