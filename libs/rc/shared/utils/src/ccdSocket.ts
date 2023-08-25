//import { getJwtToken, getTenantId } from '@acx-ui/utils'

import { getIndependentSocket } from './initialSocket'

// eslint-disable-next-line max-len
export const initCcdSocket = (requestId: string, handler: (msg: string) => void): SocketIOClient.Socket => {
  //const token = getJwtToken()
  //const tenantId = getTenantId()
  let socket = getIndependentSocket(`/ccd?subscriptionId=${requestId}`)

  /*
  if (token) {
    // eslint-disable-next-line max-len
    socket = getIndependentSocket(`/ccd?token=${token}&tenantId=${tenantId}&subscriptionId=${requestId}`)
  } else {
    socket = getIndependentSocket(`/ccd?subscriptionId=${requestId}`)
  }
  */

  socket.on('ccdEvent', handler)

  return socket
}


export const closeCcdSocket = (socket: SocketIOClient.Socket) => {
  if (socket.disconnected) return

  socket.off('ccdEvent')
  socket.disconnect()
}