# pear-stage

> Synchronize from-disk to app drive peer-to-peer

## Usage

```js
import stage from 'pear-stage'
```

```js
function status (info) { console.log(info) }
const link = 'pear://....'
const stream = stage(link, opts)
stream.on('data', status)
```

## License

Apache-2.0