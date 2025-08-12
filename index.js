'use strict'
const ref = require('pear-ref')
module.exports = function stage (link, opts) {
  const ipc = global.Pear?.[global.Pear?.constructor.IPC]
  if (!ipc) throw new Error('pear-stage is designed for Pear - IPC missing')
  ref.ref()
  const stream = ipc.stage({ ...opts, link })
  stream.on('close', () => ref.unref())
  return stream
}
