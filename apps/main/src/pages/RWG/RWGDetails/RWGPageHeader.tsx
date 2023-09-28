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

import RWGTabs from './RWGTabs'


function RWGPageHeader () {
  const { $t } = useIntl()
  const { tenantId, gatewayId } = useParams()

  const { data } = useGetRwgQuery({ params: { tenantId, gatewayId } })

  const navigate = useNavigate()
  const location = useLocation()
  const basePath = useTenantLink(`/ruckus-wan-gateway/${gatewayId}`)

  return (
    <PageHeader
      title={data?.name || ''}
      titleExtra={
        <span>
          <Badge
            color={`var(${data?.status === 'Operational'
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
      footer={<RWGTabs gatewayDetail={data as RWG} />}
    />
  )
}

export default RWGPageHeader
