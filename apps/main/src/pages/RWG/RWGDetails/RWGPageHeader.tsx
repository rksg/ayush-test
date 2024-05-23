import { useEffect, useState } from 'react'

import { Badge }   from 'antd'
import { useIntl } from 'react-intl'

import { Button, cssStr, PageHeader }                       from '@acx-ui/components'
import { useGetRwgQuery }                                   from '@acx-ui/rc/services'
import { getRwgStatus, RWG, RWGClusterNode, RWGStatusEnum } from '@acx-ui/rc/utils'
import {
  useLocation,
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'
import { filterByAccess } from '@acx-ui/user'

import { useRwgActions } from '../useRwgActions'

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
    }
  }, [_gatewayData])

  const navigate = useNavigate()
  const location = useLocation()
  const rwgListBasePath = useTenantLink('/ruckus-wan-gateway/')
  const rwgActions = useRwgActions()

  const redirectToList = function () {
    navigate({
      ...rwgListBasePath
    }, {
      state: {
        from: location
      }
    })}

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
        ...filterByAccess([<Button
          type='default'
          onClick={() =>
            rwgActions.deleteGateways([gatewayData as RWG], tenantId, redirectToList)
          }
          disabled={!!clusterNodeId}
        >{$t({ defaultMessage: 'Delete Gateway' })}</Button>,
        <Button
          type='primary'
          onClick={() =>
            window.open('https://' + (gatewayData?.hostname)?.toString(),
              '_blank')
          }
        >{$t({ defaultMessage: 'Configure' })}</Button>])
      ]}
      footer={<RWGTabs gatewayDetail={gatewayData as RWG} />}
    />
  )
}

export default RWGPageHeader
