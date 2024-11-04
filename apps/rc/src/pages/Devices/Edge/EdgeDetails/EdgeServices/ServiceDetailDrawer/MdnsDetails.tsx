import { useIntl } from 'react-intl'

import { Loader, Subtitle }                      from '@acx-ui/components'
import { MdnsProxyForwardingRulesTable }         from '@acx-ui/rc/components'
import { useGetEdgeMdnsProxyViewDataListQuery }  from '@acx-ui/rc/services'
import { EdgeService, MdnsProxyFeatureTypeEnum } from '@acx-ui/rc/utils'

interface MdnsDetailsProps {
  serviceData: EdgeService
}
export const MdnsDetails = (props: MdnsDetailsProps) => {
  const { serviceData } = props
  const { $t } = useIntl()

  const { data, isLoading } = useGetEdgeMdnsProxyViewDataListQuery({
    payload: {
      fields: ['forwardingRules'],
      filters: { id: [serviceData?.serviceId] }
    }
  }, {
    skip: !serviceData?.serviceId,
    selectFromResult: ({ data, isLoading }) => ({
      data: data?.data[0],
      isLoading
    })
  })

  return <Loader states={[{
    isLoading: false,
    isFetching: isLoading
  }]}>
    <Subtitle level={3}>
      { $t({ defaultMessage: 'mDNS Settings' }) }
    </Subtitle>
    <MdnsProxyForwardingRulesTable
      featureType={MdnsProxyFeatureTypeEnum.EDGE}
      readonly={true}
      rules={data?.forwardingRules}
    />
  </Loader>
}