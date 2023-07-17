import io, { Socket } from 'socket.io-client'

import { websocketServerUrl } from '.'

let socket: typeof Socket

export const initialSocket = (url: string) => {
  if(!socket){
    socket = io.connect(url, {
      path: websocketServerUrl,
      secure: true,
      reconnection: true,
      transports: ['websocket'],
      rejectUnauthorized: false
    })
  }

  return socket
}