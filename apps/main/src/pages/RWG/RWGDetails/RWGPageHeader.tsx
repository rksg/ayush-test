import { useEffect, useState } from 'react'

import { Badge }   from 'antd'
import { useIntl } from 'react-intl'

import { Button, PageHeader }                    from '@acx-ui/components'
import { useGetDNSRecordsQuery, useGetRwgQuery } from '@acx-ui/rc/services'
import { RWG }                                   from '@acx-ui/rc/utils'
import {
  useLocation,
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'
import { filterByAccess } from '@acx-ui/user'

import RWGTabs from './RWGTabs'


function RWGPageHeader () {
  const { $t } = useIntl()
  const [gatewayStatus, setGatewayStatus] = useState<string>()
  const [DNSRecordCount, setDNSRecordCount] = useState<number>()
  const { tenantId, gatewayId } = useParams()

  const { data: gatewayData } = useGetRwgQuery({ params: { tenantId, gatewayId } })
  const { data: dnsRecordsData } = useGetDNSRecordsQuery({ params: { tenantId, gatewayId } })

  useEffect(() => {
    if (gatewayData) {
      setGatewayStatus(gatewayData?.status)
    }

    if (dnsRecordsData) {
      setDNSRecordCount(dnsRecordsData.totalCount)
    }
  })

  const navigate = useNavigate()
  const location = useLocation()
  const basePath = useTenantLink(`/ruckus-wan-gateway/${gatewayId}`)

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
      footer={<RWGTabs gatewayDetail={gatewayData as RWG} dnsRecordsCount={DNSRecordCount || 0} />}
    />
  )
}

export default RWGPageHeader
