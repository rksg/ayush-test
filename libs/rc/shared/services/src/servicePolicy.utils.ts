import { AAAPolicyNetwork, AAAPolicyType, AAARbacViewModalType, AAAViewModalType, TableResult, WifiNetwork } from '@acx-ui/rc/utils'

// eslint-disable-next-line max-len
export function combineAAAPolicyWithRbacData (target: AAAPolicyType, other: TableResult<AAARbacViewModalType>): AAAPolicyType {
  return {
    ...target,
    networkIds: other.data[0]?.wifiNetworkIds ?? []
  }
}
// eslint-disable-next-line max-len
export function convertRbacToAAAViewModelPolicyList (input: TableResult<AAARbacViewModalType>): TableResult<AAAViewModalType> {
  const resolvedData = input.data.map(aaaRbacPolicy => {
    const { wifiNetworkIds, ...rest } = aaaRbacPolicy
    return { ...rest, networkIds: wifiNetworkIds }
  })
  return {
    ...input,
    data: resolvedData
  }
}

// eslint-disable-next-line max-len
export const aaaPolicyNetworkFieldMapping: Record<keyof AAAPolicyNetwork, keyof WifiNetwork> = {
  networkId: 'id',
  networkName: 'name',
  networkType: 'nwSubType',
  guestNetworkType: 'captiveType'
}

// eslint-disable-next-line max-len
export function convertRbacToAAAPolicyNetworkList (input: TableResult<WifiNetwork>): TableResult<AAAPolicyNetwork> {
  const resolvedData = input.data.map(wifiNetwork => {
    const { id, name, nwSubType, captiveType } = wifiNetwork
    return {
      networkId: id,
      networkName: name,
      networkType: nwSubType,
      guestNetworkType: captiveType
    }
  })
  return {
    ...input,
    data: resolvedData
  }
}
