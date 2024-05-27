import { AAAPolicyType, AAARbacViewModalType, AAAViewModalType, TableResult } from '@acx-ui/rc/utils'

// eslint-disable-next-line max-len
export function combineAAAPolicyWithRbacData (target: AAAPolicyType, other: TableResult<AAARbacViewModalType>): AAAPolicyType {
  return {
    ...target,
    networkIds: other.data[0]?.wifiNetworkIds ?? []
  }
}
// eslint-disable-next-line max-len
export function convertRbacDataToAAAViewModelPolicyList (input: TableResult<AAARbacViewModalType>): TableResult<AAAViewModalType> {
  const resolvedData = input.data.map(aaaRbacPolicy => {
    const { wifiNetworkIds, ...rest } = aaaRbacPolicy
    return { ...rest, networkIds: wifiNetworkIds }
  })
  return {
    ...input,
    data: resolvedData
  }
}
