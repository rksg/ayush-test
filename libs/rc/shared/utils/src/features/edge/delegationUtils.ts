import { EDGE_DELEGATION_WLAN_ID_START } from './constants'

export const isEdgeWlanTemplate = (wlanId: string | undefined) => {
  return Number(wlanId ?? 0) >= EDGE_DELEGATION_WLAN_ID_START
}