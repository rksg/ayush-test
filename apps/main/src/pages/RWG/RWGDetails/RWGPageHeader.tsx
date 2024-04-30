import { useEffect, useState } from 'react'

import { Badge }   from 'antd'
import { useIntl } from 'react-intl'

import { Button, PageHeader } from '@acx-ui/components'
import { useGetRwgQuery }     from '@acx-ui/rc/services'
import { RWG }                from '@acx-ui/rc/utils'
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
  const [gatewayStatus, setGatewayStatus] = useState<string>()
  const { tenantId, gatewayId, venueId } = useParams()

  const { data: gatewayData } = useGetRwgQuery({ params: { tenantId, gatewayId, venueId } })

  useEffect(() => {
    if (gatewayData) {
      setGatewayStatus(gatewayData?.status)
    }
  })

  const navigate = useNavigate()
  const location = useLocation()
  const basePath = useTenantLink(`/ruckus-wan-gateway/${gatewayId}`)
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
      title={gatewayData?.name || ''}
      titleExtra={
        <span>
          <Badge
            color={`var(${gatewayStatus === 'Operational'
              ? '--acx-semantics-green-50'
              : '--acx-neutrals-50'})`}
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
        >{$t({ defaultMessage: 'Delete Gateway' })}</Button>,
        <Button
          type='primary'
          onClick={() =>
            navigate({
              ...basePath,
              pathname: `${basePath.pathname}/edit`
            }, {
              state: {
                from: location
              }
            })
          }
        >{$t({ defaultMessage: 'Configure' })}</Button>])
      ]}
      footer={<RWGTabs gatewayDetail={gatewayData as RWG} />}
    />
  )
}

export default RWGPageHeader
