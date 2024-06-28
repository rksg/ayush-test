import { AAARbacViewModalType, AAAViewModalType, Radius, TableResult } from '@acx-ui/rc/utils'
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

export function covertAAAViewModalTypeToRadius (data: AAAViewModalType): Radius {
  const { id, name, primary, secondary = '', type } = data
  const splitPrimary = primary.split(':')
  const splitSecondary = secondary.split(':')

  return { id, name, type,
    primary: {
      ip: splitPrimary[0],
      port: Number(splitPrimary[1])
    },
    ...(splitSecondary.length > 1 ? {
      secondary: {
        ip: splitSecondary[0],
        port: Number(splitSecondary[1])
      }
    } : {})
  }
}
