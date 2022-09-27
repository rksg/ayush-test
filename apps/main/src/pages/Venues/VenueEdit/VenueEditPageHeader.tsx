import { useIntl } from 'react-intl'

import { Button, PageHeader } from '@acx-ui/components'
import { useGetVenueQuery }   from '@acx-ui/rc/services'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'

import VenueEditTabs from './VenueEditTabs'

function VenueEditPageHeader () {
  const { $t } = useIntl()
  const { tenantId, venueId } = useParams()
  const { data } = useGetVenueQuery({ params: { tenantId, venueId } })

  console.log(data)
  const navigate = useNavigate()
  const basePath = useTenantLink(`/venues/${venueId}/venue-details/`)

  return (
    <PageHeader
      title={data?.name || ''}
      breadcrumb={[
        { text: 'Venues', link: '/venues' }
      ]}
      extra={[
        <Button
          key='back'
          type='primary'
          onClick={() => 
            navigate({
              ...basePath,
              pathname: `${basePath.pathname}/overview`
            })
          }>{ $t({ defaultMessage: 'Back to venue details' }) }</Button>
      ]}
      footer={<VenueEditTabs />}
    />
  )
}

export default VenueEditPageHeader