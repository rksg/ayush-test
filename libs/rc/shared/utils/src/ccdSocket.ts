import { getJwtToken, getTenantId } from '@acx-ui/utils'

import { getIndependentSocket } from './initialSocket'


// eslint-disable-next-line max-len
export const initCcdSocket = (subscriptionId: string, handler: (msg: string) => void): SocketIOClient.Socket => {
  const token = getJwtToken()
  const tenantId = getTenantId()
  let url
  if (token) {
    url = `/ccd?token=${token}&tenantId=${tenantId}&subscriptionId=${subscriptionId}`
  } else {
    url = `/ccd?tenantId=${tenantId}&subscriptionId=${subscriptionId}`
  }

  const socket = getIndependentSocket(url)

  socket.on('ccdEvent', handler)

  return socket
}

export const closeCcdSocket = (socket: SocketIOClient.Socket) => {
  if (socket.disconnected) return

  socket.off('ccdEvent')
  socket.close()
}