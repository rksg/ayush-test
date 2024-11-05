import { useGetEdgeMdnsProxyViewDataListQuery } from '@acx-ui/rc/services'
import { MdnsProxyFeatureTypeEnum }             from '@acx-ui/rc/utils'

import { MdnsProxySelector, MdnsProxySelectorProps } from './MdnsProxySelector'

// eslint-disable-next-line max-len
export function EdgeMdnsProxySelector (props: Pick<MdnsProxySelectorProps, 'placeholder' | 'formItemProps'>) {
  const { data: mdnsProxyList } = useGetEdgeMdnsProxyViewDataListQuery({
    payload: {
      fields: ['id', 'name', 'forwardingRules', 'activations'],
      pageSize: 10000
    }
  })

  return <MdnsProxySelector
    mdnsProxyList={mdnsProxyList?.data}
    featureType={MdnsProxyFeatureTypeEnum.EDGE}
    {...props}
  />
}