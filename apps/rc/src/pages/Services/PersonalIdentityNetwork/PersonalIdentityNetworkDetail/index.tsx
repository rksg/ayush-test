
import { Space, Typography, Row, Col } from 'antd'
import { saveAs }                      from 'file-saver'
import JSZip                           from 'jszip'
import { useIntl }                     from 'react-intl'

import { Alert, Button, Card, PageHeader }                                             from '@acx-ui/components'
import { PersonalIdentityNetworkDetailTableGroup, PersonalIdentityNetworkServiceInfo } from '@acx-ui/rc/components'
import {
  useGetEdgeDhcpServiceQuery,
  useGetEdgePinViewDataListQuery
} from '@acx-ui/rc/services'
import {
  ServiceOperation, ServiceType,
  edgePinDefaultPayloadFields,
  filterByAccessForServicePolicyMutation,
  genDhcpConfigByPinSetting,
  getScopeKeyByService,
  getServiceAllowedOperation,
  getServiceDetailsLink,
  getServiceListRoutePath,
  getServiceRoutePath,
  MAX_DEVICE_PER_SEGMENT
} from '@acx-ui/rc/utils'
import { TenantLink, useLocation, useParams } from '@acx-ui/react-router-dom'

import { CompatibilityCheck } from './CompatibilityCheck'
import * as UI                from './styledComponents'

const PersonalIdentityNetworkDetail = () => {

  const { $t } = useIntl()
  const params = useParams()
  const location = useLocation()

  const {
    pinViewData
  } = useGetEdgePinViewDataListQuery({
    payload: {
      fields: edgePinDefaultPayloadFields,
      filters: { id: [params.serviceId] }
    }
  }, {
    selectFromResult: ({ data }) => {
      return {
        pinViewData: data?.data[0]
      }
    }
  })

  const { dhcpRelay, dhcpPools } = useGetEdgeDhcpServiceQuery(
    { params: { id: pinViewData?.edgeClusterInfo?.dhcpInfoId } },{
      skip: !pinViewData?.edgeClusterInfo?.dhcpInfoId,
      selectFromResult: ({ data }) => {
        return {
          dhcpRelay: data?.dhcpRelay,
          dhcpPools: data?.dhcpPools
        }
      }
    })

  const handleDownloadConfigs = () => {
    const edgeClusterInfo = pinViewData?.edgeClusterInfo
    const targetPool = dhcpPools?.find(item => item.id === edgeClusterInfo?.dhcpPoolId)
    if(!edgeClusterInfo || !targetPool) return

    try {
      const dhcpConfigs = genDhcpConfigByPinSetting(
        targetPool.poolStartIp,
        targetPool.poolEndIp,
        edgeClusterInfo.segments,
        MAX_DEVICE_PER_SEGMENT
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
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e)
    }
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
        title={pinViewData && pinViewData.name}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) },
          {
            text: $t({ defaultMessage: 'Personal Identity Network' }),
            link: getServiceRoutePath({
              type: ServiceType.PIN,
              oper: ServiceOperation.LIST
            })
          }
        ]}
        extra={[...(dhcpRelay ? [
          <Alert style={{ margin: 'auto' }} message={warningMsg} type='info' showIcon />
        ] : []),
        ...filterByAccessForServicePolicyMutation([
          <TenantLink state={{ from: location }}
            to={getServiceDetailsLink({
              type: ServiceType.PIN,
              oper: ServiceOperation.EDIT,
              serviceId: params.serviceId! })}
            scopeKey={getScopeKeyByService(ServiceType.PIN, ServiceOperation.EDIT)}
            rbacOpsIds={getServiceAllowedOperation(ServiceType.PIN, ServiceOperation.EDIT)}
          >
            <Button type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
          </TenantLink>
        ])
        ]}
      />
      <Space direction='vertical' size={30}>
        {(!!params.serviceId) && <Row>
          <Col span={24}>
            <CompatibilityCheck
              serviceId={params.serviceId}
            />
          </Col>
        </Row>}
        <PersonalIdentityNetworkServiceInfo pinId={params.serviceId || ''} />
        <Card>
          <UI.InstancesMargin>
            <Typography.Title level={2}>
              {$t({ defaultMessage: 'Instances' })}
            </Typography.Title>
            <PersonalIdentityNetworkDetailTableGroup pinId={params.serviceId || ''} />
          </UI.InstancesMargin>
        </Card>
      </Space>
    </>
  )
}

export default PersonalIdentityNetworkDetail
