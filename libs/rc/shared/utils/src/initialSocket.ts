import io, { Socket } from 'socket.io-client'

import { websocketServerUrl } from '.'

let socket: typeof Socket

export const initialSocket = (url: string) => {
  if(!socket){
    socket = getIndependentSocket(url)
  }

  return socket
}

export function getIndependentSocket (url: string): SocketIOClient.Socket {
  return io.connect(url, {
    path: websocketServerUrl,
    secure: true,
    transports: ['websocket'],
    rejectUnauthorized: false,
    reconnection: true,
    reconnectionDelay: 1500,
    reconnectionAttempts: 5,
    reconnectionDelayMax: 5000
  })
}
