import { getJwtToken, getTenantId } from '@acx-ui/utils'

import { getIndependentSocket } from './initialSocket'

// eslint-disable-next-line max-len
export const initPokeSocket = (requestId: string, handler: (msg: string) => void): SocketIOClient.Socket => {
  const token = getJwtToken()
  const tenantId = getTenantId()
  let socket

  if (token) {
    // eslint-disable-next-line max-len
    socket = getIndependentSocket(`/poke?token=${token}&tenantId=${tenantId}&subscriptionId=${requestId}`)
  } else {
    socket = getIndependentSocket(`/poke?tenantId=${tenantId}&subscriptionId=${requestId}`)
  }

  socket.on('pokeEvent', handler)

  return socket
}


export const closePokeSocket = (socket: SocketIOClient.Socket) => {
  if (socket.disconnected) return

  socket.off('pokeEvent')
  socket.disconnect()
}
