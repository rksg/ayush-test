import io, { Socket } from 'socket.io-client'

import { getJwtToken, websocketServerUrl } from '@acx-ui/config'

import { getTenantId } from './getTenantId'

let socket: typeof Socket

let callbacks: ((...data: string[]) => void)[] = []

export const initialSocket = (url: string) => {

  const token = getJwtToken()

  const tenantId = getTenantId()

  socket = initialSocket(url)
  socket.on('jwtRefresh', () => {

    const url1 = token ? `/activity?token=${token}&tenantId=${tenantId}`
      : `/activity?tenantId=${tenantId}`
    socket.off('jwtRefresh')
    socket.off('activityChangedEvent')
    initialSocket(url1)
  })


  socket.on('activityChangedEvent', (...messages: string[]) => {
    callbacks.forEach((callback) => callback(...messages))
  })


  if(!socket){
    socket = getIndependentSocket(url)
  }

  return socket
}

export const onActivity = (callback: ((...data: string[]) => void)) => {
  callbacks.push(callback)
}

export const offActivity = (callback: ((...data: string[]) => void)) => {
  callbacks = callbacks.filter(fn => fn !== callback)
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

export function reConnectSocket (url: string) {
  if (socket) {
    // Properly disconnect the existing socket
    socket.off('activityChangedEvent')
    socket.close()
    socket.disconnect()
    socket = getIndependentSocket(url)
  }
}

export function getSocket () {
  return socket
}
