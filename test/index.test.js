'use strict'
const test = require('brittle')
const b4a = require('b4a')
const sodium = require('sodium-native')
const IPC = require('pear-ipc')
const Iambus = require('iambus')
const { isWindows } = require('which-runtime')
const stage = require('..')

function pipeId (s) {
  const buf = b4a.allocUnsafe(32)
  sodium.crypto_generichash(buf, b4a.from(s))
  return b4a.toString(buf, 'hex')
}

test('throws if not Pear', (t) => {
  t.exception(() => stage('pear://pear'))
})

test('stage(link, opts)', async (t) => {
  t.plan(1)
  const kIPC = Symbol('test.ipc')
  const socketPath = isWindows ? `\\\\.\\pipe\\test-${pipeId(__dirname)}` : __dirname + '/test.sock' // eslint-disable-line
  const bus = new Iambus()
  const srv = new IPC.Server({
    socketPath,
    handlers: {
      stage (params) {
        const sub = bus.sub({ params })
        bus.pub({ some: 'info', params })
        setImmediate(() => sub.end())
        return sub
      }
    }
  })
  t.teardown(() => srv.close())
  await srv.ready()
  const ipc = new IPC.Client({ socketPath })
  t.teardown(() => ipc.close())
  await ipc.ready()
  class API {
    static IPC = kIPC
    get [kIPC] () { return ipc }
  }
  global.Pear = new API()
  const opts = { dir: 'some/path' }
  const link = 'pear://pear'
  const stream = stage(link, opts)
  stream.on('data', (msg) => {
    t.alike({ some: 'info', params: { link, ...opts } }, msg)
  })
})
