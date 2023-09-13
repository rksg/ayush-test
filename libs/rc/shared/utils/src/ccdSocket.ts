import { getIndependentSocket } from './initialSocket'

// eslint-disable-next-line max-len
export const initCcdSocket = (subscriptionId: string, handler: (msg: string) => void): SocketIOClient.Socket => {
  let socket = getIndependentSocket(`/ccd?subscriptionId=${subscriptionId}`)

  socket.on('ccdEvent', handler)

  return socket
}


export const closeCcdSocket = (socket: SocketIOClient.Socket) => {
  if (socket.disconnected) return

  socket.off('ccdEvent')
  socket.close()
}