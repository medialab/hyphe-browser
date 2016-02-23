# hyphe-browser

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
