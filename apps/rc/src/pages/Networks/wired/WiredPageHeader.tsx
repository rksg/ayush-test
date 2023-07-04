import { useIntl } from 'react-intl'

import { PageHeader }                                   from '@acx-ui/components'
import { Features, useIsSplitOn }                       from '@acx-ui/feature-toggle'
import { useGetCliTemplatesQuery, useGetProfilesQuery } from '@acx-ui/rc/services'
import { SwitchCliTemplateModel, usePollingTableQuery } from '@acx-ui/rc/utils'
import { useParams }                                    from '@acx-ui/react-router-dom'

import WiredTabs from './WiredTabs'

function WiredPageHeader () {
  const { $t } = useIntl()
  const { tenantId, venueId, serialNumber } = useParams()
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)

  const defaultPayload = {
    filters: venueId ? { venueId: [venueId] } :
      serialNumber ? { serialNumber: [serialNumber] } : {}
  }

  const cli = usePollingTableQuery<SwitchCliTemplateModel>({
    useQuery: useGetCliTemplatesQuery,
    defaultPayload: {}
  })

  const profileList = useGetProfilesQuery({ params: { tenantId }, payload: defaultPayload }, {
    pollingInterval: 30_000
  })

  return (
    <PageHeader
      title={isNavbarEnhanced
        ? $t({ defaultMessage: 'Wired Network Profiles' })
        : $t({ defaultMessage: 'Wired Networks' })
      }
      breadcrumb={isNavbarEnhanced ? [
        { text: $t({ defaultMessage: 'Wired' }) }
      ] : undefined}
      footer={<WiredTabs
        profileCount={profileList?.data?.totalCount ? profileList?.data.totalCount : 0}
        cliCount={cli?.data?.totalCount ? cli?.data.totalCount : 0}
      />}
    />
  )
}

export default WiredPageHeader
