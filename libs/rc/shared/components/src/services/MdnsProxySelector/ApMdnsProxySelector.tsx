import { Features, useIsSplitOn }   from '@acx-ui/feature-toggle'
import { useGetMdnsProxyListQuery } from '@acx-ui/rc/services'
import { MdnsProxyFeatureTypeEnum } from '@acx-ui/rc/utils'

import { MdnsProxySelector, MdnsProxySelectorProps } from './MdnsProxySelector'

// eslint-disable-next-line max-len
export function ApMdnsProxySelector (props: Pick<MdnsProxySelectorProps, 'placeholder' | 'formItemProps'>) {
  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)

  const { data: mdnsProxyList } = useGetMdnsProxyListQuery({ enableRbac })

  return <MdnsProxySelector
    mdnsProxyList={mdnsProxyList}
    featureType={MdnsProxyFeatureTypeEnum.WIFI}
    {...props}
  />
}