import { useIntl } from 'react-intl'

import { Button, PageHeader }           from '@acx-ui/components'
import { usePathBasedOnConfigTemplate } from '@acx-ui/rc/components'
import { useConfigTemplateBreadcrumb }  from '@acx-ui/rc/utils'
import {
  useNavigate,
  useParams
} from '@acx-ui/react-router-dom'

import { useGetVenueInstance } from '../venueConfigTemplateApiSwitcher'

import VenueEditTabs from './VenueEditTabs'

function VenueEditPageHeader () {
  const { $t } = useIntl()
  const { venueId } = useParams()
  const { data } = useGetVenueInstance()

  const navigate = useNavigate()
  const detailsPath = usePathBasedOnConfigTemplate(
    `/venues/${venueId}/venue-details/overview`,
    `/venues/${venueId}/venue-details/services`
  )
  // eslint-disable-next-line max-len
  const breadcrumb = useConfigTemplateBreadcrumb([{ text: $t({ defaultMessage: 'Venues' }), link: '/venues' }])

  return (
    <PageHeader
      title={data?.name || ''}
      breadcrumb={breadcrumb}
      extra={[
        <Button
          type='primary'
          onClick={() => navigate(detailsPath)}
        >
          { $t({ defaultMessage: 'Back to venue details' }) }
        </Button>
      ]}
      footer={<VenueEditTabs />}
    />
  )
}

export default VenueEditPageHeader
