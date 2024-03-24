import { getJwtToken, getTenantId } from '@acx-ui/utils'

import { getIndependentSocket } from './initialSocket'

export const initActivitySocket = (handler: (msg: string) => void): SocketIOClient.Socket => {
  const token = getJwtToken()
  const tenantId = getTenantId()
  let socket

  if (token) {
    socket = getIndependentSocket(`/activity?token=${token}&tenantId=${tenantId}`)
  } else {
    socket = getIndependentSocket(`/activity?tenantId=${tenantId}`)
  }

  socket.on('activityChangedEvent', handler)
  return socket
}


export const closeActivitySocket = (socket: SocketIOClient.Socket) => {
  if (socket.disconnected) return

  socket.off('activityChangedEvent')
  socket.close()
}
