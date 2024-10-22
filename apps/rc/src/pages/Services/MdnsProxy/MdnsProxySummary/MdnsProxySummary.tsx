import { useContext } from 'react'

import { MdnsProxySummary as GeneralMdnsProxySummary } from '@acx-ui/rc/components'
import { MdnsProxyFeatureTypeEnum }                    from '@acx-ui/rc/utils'

import MdnsProxyFormContext from '../MdnsProxyForm/MdnsProxyFormContext'

export function MdnsProxySummary () {
  const { currentData } = useContext(MdnsProxyFormContext)

  return <GeneralMdnsProxySummary
    featureType={MdnsProxyFeatureTypeEnum.WIFI}
    name={currentData.name}
    rules={currentData.rules ?? []}
    scope={currentData.scope ?? []}
  />
}
