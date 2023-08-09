
import { Space, Typography } from 'antd'
import { saveAs }            from 'file-saver'
import JSZip                 from 'jszip'
import { useIntl }           from 'react-intl'

import { Alert, Button, Card, PageHeader }                                     from '@acx-ui/components'
import { Features, useIsSplitOn }                                              from '@acx-ui/feature-toggle'
import { NetworkSegmentationDetailTableGroup, NetworkSegmentationServiceInfo } from '@acx-ui/rc/components'
import {
  useGetEdgeDhcpServiceQuery,
  useGetNetworkSegmentationViewDataListQuery
} from '@acx-ui/rc/services'
import {
  ServiceOperation, ServiceType,
  genDhcpConfigByNsgSetting,
  getServiceDetailsLink,
  getServiceListRoutePath,
  getServiceRoutePath
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
    selectFromResult: ({ data }) => {
      return {
        nsgViewData: data?.data[0]
      }
    }
  })
  const { dhcpRelay, dhcpPools } = useGetEdgeDhcpServiceQuery(
    { params: { id: nsgViewData?.edgeInfos[0].dhcpInfoId } },{
      skip: !!!nsgViewData?.edgeInfos[0],
      selectFromResult: ({ data }) => {
        return {
          dhcpRelay: data?.dhcpRelay,
          dhcpPools: data?.dhcpPools
        }
      }
    })

  const handleDownloadConfigs = () => {
    const edgeInfo = nsgViewData?.edgeInfos[0]
    const targetPool = dhcpPools?.find(item => item.id === edgeInfo?.dhcpPoolId)
    if(!edgeInfo || !targetPool) return
    const dhcpConfigs = genDhcpConfigByNsgSetting(
      targetPool.poolStartIp,
      targetPool.poolEndIp,
      edgeInfo.segments,
      edgeInfo.devices
    )
    const keaConfig = new File(
      [dhcpConfigs.keaDhcpConfig],
      'kea-dhcp4.conf',
      { type: 'text/plain;charset=utf-8' }
    )
    const iscConfig = new File(
      [dhcpConfigs.iscDhcpConfig],
      'dhcpd.conf',
      { type: 'text/plain;charset=utf-8' }
    )
    const zip = new JSZip()
    zip.file('kea-dhcp4.conf', keaConfig)
    zip.file('dhcpd.conf', iscConfig)
    zip.generateAsync({ type: 'blob' })
      .then((content) => {
        saveAs(content, 'externalDhcp.zip')
      })
  }

  const warningMsg = <>
    {$t({ defaultMessage: 'Requires additional configuration in external DHCP server' })}
    &nbsp;
    <Button type='link' size='small' onClick={handleDownloadConfigs}>
      {$t({ defaultMessage: 'Download configs' })}
    </Button>
  </>

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
        extra={[...(dhcpRelay ? [
          <Alert style={{ margin: 'auto' }} message={warningMsg} type='info' showIcon />
        ] : []),
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
