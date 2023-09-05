import { getJwtToken, getTenantId } from '@acx-ui/utils'

import { getIndependentSocket } from './initialSocket'

// eslint-disable-next-line max-len
export const initPokeSocket = (subscriptionId: string, handler: (msg: string) => void): SocketIOClient.Socket => {
  const token = getJwtToken()
  const tenantId = getTenantId()
  let socket

  if (token) {
    // eslint-disable-next-line max-len
    socket = getIndependentSocket(`/poke?token=${token}&tenantId=${tenantId}&subscriptionId=${subscriptionId}`)
  } else {
    socket = getIndependentSocket(`/poke?tenantId=${tenantId}&subscriptionId=${subscriptionId}`)
  }

  socket.on('pokeEvent', handler)

  return socket
}


export const closePokeSocket = (socket: SocketIOClient.Socket) => {
  if (socket.disconnected) return

  socket.off('pokeEvent')
  socket.close()
}
