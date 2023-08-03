import { getJwtToken, getTenantId } from '@acx-ui/utils'

import { getIndependentSocket } from './initialSocket'

export const getPokeSocket = (requestId: string): SocketIOClient.Socket => {
  const token = getJwtToken()
  const tenantId = getTenantId()

  if (token) {
    // eslint-disable-next-line max-len
    return getIndependentSocket(`/poke?token=${token}&tenantId=${tenantId}&subscriptionId=${requestId}`)
  }

  return getIndependentSocket(`/poke?tenantId=${tenantId}&subscriptionId=${requestId}`)
}
