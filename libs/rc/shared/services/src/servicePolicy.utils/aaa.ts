import { AAARbacViewModalType, AAAViewModalType } from '@acx-ui/rc/utils'
import { TableResult }                            from '@acx-ui/utils'
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
