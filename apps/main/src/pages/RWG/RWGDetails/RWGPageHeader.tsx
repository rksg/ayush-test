import { useEffect, useState } from 'react'

import { Badge, Menu, MenuProps } from 'antd'
import { useIntl }                from 'react-intl'

import { Button, cssStr, Dropdown, PageHeader }                                 from '@acx-ui/components'
import { CaretDownOutlined }                                                    from '@acx-ui/icons'
import { useRwgActions }                                                        from '@acx-ui/rc/components'
import { useGetRwgQuery }                                                       from '@acx-ui/rc/services'
import { CommonRbacUrlsInfo, getRwgStatus, RWG, RWGClusterNode, RWGStatusEnum } from '@acx-ui/rc/utils'
import {
  useLocation,
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'
import { filterByAccess, useUserProfileContext } from '@acx-ui/user'
import { getOpsApi }                             from '@acx-ui/utils'

import RWGTabs from './RWGTabs'


function RWGPageHeader () {
  const { $t } = useIntl()
  const [gatewayStatus, setGatewayStatus] = useState<RWGStatusEnum>()
  const [gatewayData, setGatewayData] = useState<RWG>()
  const { tenantId, gatewayId, venueId, clusterNodeId } = useParams()

  const { data: _gatewayData } = useGetRwgQuery({ params:
    { tenantId, gatewayId, venueId } })

  useEffect(() => {
    if (clusterNodeId && _gatewayData?.clusterNodes && _gatewayData?.clusterNodes?.length) {
      const _gateway: RWGClusterNode =
        _gatewayData?.clusterNodes?.filter(gateway => gateway.id === clusterNodeId)[0]
      const rwg: RWG = {
        name: _gateway.name,
        status: _gatewayData.status,
        venueId: _gatewayData.venueId,
        venueName: _gatewayData.venueName,
        hostname: _gatewayData.hostname,
        apiKey: _gatewayData.apiKey,
        rwgId: _gatewayData.rwgId,
        isCluster: false
      }
      setGatewayData(rwg)
      setGatewayStatus(rwg.status)
    } else {
      setGatewayData(_gatewayData)
      setGatewayStatus(_gatewayData?.status)
    }
  }, [_gatewayData])

  const navigate = useNavigate()
  const location = useLocation()
  const rwgListBasePath = useTenantLink('/ruckus-wan-gateway/')
  const rwgActions = useRwgActions()
  const { isCustomRole } = useUserProfileContext()

  const redirectToList = function () {
    navigate({
      ...rwgListBasePath
    }, {
      state: {
        from: location
      }
    })}


  const handleMenuClick: MenuProps['onClick'] = (e) => {

    if (e.key === 'configure-rwg') {
      window.open('https://' + (gatewayData?.hostname)?.toString() + '/admin',
        '_blank')
    } else {
      window.open('https://' + (gatewayData?.hostname)?.toString() + '/conferences',
        '_blank')
    }

  }

  const menu = (
    <Menu
      onClick={handleMenuClick}
      items={
        [{
          key: 'configure-rwg',
          label: $t({ defaultMessage: 'Configure RWG' })
        }, {
          key: 'configure-conference',
          label: $t({ defaultMessage: 'Configure Conferences' })
        }]
      }
    />
  )

  return (
    <PageHeader
      title={gatewayData?.name}
      titleExtra={
        <span>
          <Badge
            color={gatewayStatus ? cssStr(getRwgStatus(gatewayStatus).color)
              : cssStr('--acx-neutrals-50')}
          />
        </span>
      }
      breadcrumb={[
        { text: $t({ defaultMessage: 'RUCKUS WAN Gateways' }), link: '/ruckus-wan-gateway' }
      ]}
      extra={[
        ...filterByAccess([
          <Button
            type='default'
            onClick={() =>
              rwgActions.refreshGateway()
            }
          >{$t({ defaultMessage: 'Refresh' })}</Button>,
          ...(isCustomRole ? []
            : [<Button
              type='default'
              rbacOpsIds={[getOpsApi(CommonRbacUrlsInfo.deleteGateway)]}
              onClick={() =>
                rwgActions.deleteGateways([gatewayData as RWG], tenantId, redirectToList)
              }
              disabled={!!clusterNodeId}
            >{$t({ defaultMessage: 'Delete Gateway' })}</Button>,
            <Dropdown
              overlay={menu}
              rbacOpsIds={[getOpsApi(CommonRbacUrlsInfo.updateGateway)]}
            >
              { () => <Button
                type='primary'
              >{$t({ defaultMessage: 'Configure' })} <CaretDownOutlined /></Button> }
            </Dropdown>])])
      ]}
      footer={<RWGTabs gatewayDetail={gatewayData as RWG} />}
    />
  )
}

export default RWGPageHeader
