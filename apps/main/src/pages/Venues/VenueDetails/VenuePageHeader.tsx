import { useIntl } from 'react-intl'

import { Button, PageHeader }         from '@acx-ui/components'
import { ClockOutlined }              from '@acx-ui/icons'
import { useVenueDetailsHeaderQuery } from '@acx-ui/rc/services'
import {
  useNavigate,
  useTenantLink,
  useParams
}                  from '@acx-ui/react-router-dom'

import VenueTabs from './VenueTabs'

function VenuePageHeader () {
  const { $t } = useIntl()
  const { tenantId, venueId } = useParams()
  const { data } = useVenueDetailsHeaderQuery({ params: { tenantId, venueId } })

  const navigate = useNavigate()
  const basePath = useTenantLink(`/venues/${venueId}`)

  return (
    <PageHeader
      title={data?.venue?.name || ''}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Venues' }), link: '/venues' }
      ]}
      extra={[
        <Button key='date-filter' icon={<ClockOutlined />}>
          {$t({ defaultMessage: 'Last 24 Hours' })}
        </Button>,
        <Button
          key='configure'
          type='primary'
          onClick={() => 
            navigate({
              ...basePath,
              pathname: `${basePath.pathname}/edit/details`
            })
          }          
        >{$t({ defaultMessage: 'Configure' })}</Button> 
      ]}
      footer={<VenueTabs />}
    />
  )
}

export default VenuePageHeader
