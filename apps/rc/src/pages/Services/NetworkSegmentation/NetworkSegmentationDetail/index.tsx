
import { Space, Typography } from 'antd'
import { useIntl }           from 'react-intl'

import { Button, Card, PageHeader }                                            from '@acx-ui/components'
import { Features, useIsSplitOn }                                              from '@acx-ui/feature-toggle'
import { NetworkSegmentationDetailTableGroup, NetworkSegmentationServiceInfo } from '@acx-ui/rc/components'
import {
  useGetNetworkSegmentationViewDataListQuery
} from '@acx-ui/rc/services'
import {
  getServiceDetailsLink,
  getServiceListRoutePath,
  getServiceRoutePath,
  ServiceOperation, ServiceType
} from '@acx-ui/rc/utils'
import { TenantLink, useLocation, useParams } from '@acx-ui/react-router-dom'


import * as UI from './styledComponents'

const NetworkSegmentationDetail = () => {

  const { $t } = useIntl()
  const params = useParams()
  const location = useLocation()
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)

  const {
    nsgViewData
  } = useGetNetworkSegmentationViewDataListQuery({
    payload: {
      filters: { id: [params.serviceId] }
    }
  }, {
    selectFromResult: ({ data, isLoading }) => {
      return {
        nsgViewData: data?.data[0],
        isNsgViewDataLoading: isLoading
      }
    }
  })

  return (
    <>
      <PageHeader
        title={nsgViewData && nsgViewData.name}
        breadcrumb={isNavbarEnhanced ? [
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) },
          {
            text: $t({ defaultMessage: 'Network Segmentation' }),
            link: getServiceRoutePath({
              type: ServiceType.NETWORK_SEGMENTATION,
              oper: ServiceOperation.LIST
            })
          }
        ] : [
          {
            text: $t({ defaultMessage: 'Network Segmentation' }),
            link: getServiceRoutePath({
              type: ServiceType.NETWORK_SEGMENTATION,
              oper: ServiceOperation.LIST
            })
          }
        ]}
        extra={[
          <TenantLink state={{ from: location }}
            to={getServiceDetailsLink({
              type: ServiceType.NETWORK_SEGMENTATION,
              oper: ServiceOperation.EDIT,
              serviceId: params.serviceId! })}
            key='edit'>
            <Button type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
          </TenantLink>
        ]}
      />
      <Space direction='vertical' size={30}>
        <NetworkSegmentationServiceInfo nsgId={params.serviceId || ''} />
        <Card>
          <UI.InstancesMargin>
            <Typography.Title level={2}>
              {$t({ defaultMessage: 'Instances' })}
            </Typography.Title>
            <NetworkSegmentationDetailTableGroup nsgId={params.serviceId || ''} />
          </UI.InstancesMargin>
        </Card>
      </Space>
    </>
  )
}

export default NetworkSegmentationDetail
