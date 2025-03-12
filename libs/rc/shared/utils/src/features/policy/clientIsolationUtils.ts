import { getIntl } from '@acx-ui/utils'

import { IsolatePacketsTypeEnum } from '../../models/ClientIsolationEnum'

export const getIsolatePacketsTypeOptions = ()
: Array<{ label: string, value: IsolatePacketsTypeEnum }> => {
  return Object.keys(IsolatePacketsTypeEnum)
    .map(key => ({
      label: getIsolatePacketsTypeString(key as IsolatePacketsTypeEnum),
      value: key as IsolatePacketsTypeEnum
    }))
}

export const getIsolatePacketsTypeString = (type?: IsolatePacketsTypeEnum) => {
  const { $t } = getIntl()
  switch (type) {
    case IsolatePacketsTypeEnum.UNICAST :
      return $t({ defaultMessage: 'Unicast' })
    case IsolatePacketsTypeEnum.MULTICAST:
      return $t({ defaultMessage: 'Multicast/broadcast' })
    case IsolatePacketsTypeEnum.UNICAST_MULTICAST:
      return $t({ defaultMessage: 'Unicast and multicast/broadcast' })
    default:
      return ''
  }
}