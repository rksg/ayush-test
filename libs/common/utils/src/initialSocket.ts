import io, { Socket } from 'socket.io-client'

import { getJwtToken } from '@acx-ui/config'

import { getTenantId } from './getTenantId'

let socket: typeof Socket

let callbacks: ((...data: string[]) => void)[] = []

export const websocketServerUrl = '/api/websocket/socket.io'

export const initialSocket = () => {


  const tenantId = getTenantId()
  const jwtToken = getJwtToken()
  const url = jwtToken ? `/activity?token=${jwtToken}&tenantId=${tenantId}`
    : `/activity?tenantId=${tenantId}`

  socket = getIndependentSocket(url)

  socket.on('activityChangedEvent', (...messages: string[]) => {
    callbacks.forEach((callback) => callback(...messages))
  })


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
    reconnectionDelayMax: 5000,
    forceNew: true
  })
}
