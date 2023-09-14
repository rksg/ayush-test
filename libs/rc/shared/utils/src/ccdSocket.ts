import { getIndependentSocket } from './initialSocket'

// eslint-disable-next-line max-len
export const initCcdSocket = (subscriptionId: string, handler: (msg: string) => void): SocketIOClient.Socket => {
  let socket = getIndependentSocket(`/ccd?subscriptionId=${subscriptionId}`)

  //socket.on('connect', () => {
  //  console.log('CCD websocket connection')
  //})
  socket.on('ccdEvent', handler)

  //socket.on('disconnect', (reason: string) => {
  //  console.log('CCD websocket disconnection - reason', reason)
  //})

  return socket
}

export const closeCcdSocket = (socket: SocketIOClient.Socket) => {
  if (socket.disconnected) return

  socket.off('ccdEvent')
  //socket.close()
}