import { useIntl } from 'react-intl'

import { PageHeader }                                   from '@acx-ui/components'
import { useGetCliTemplatesQuery, useGetProfilesQuery } from '@acx-ui/rc/services'
import { SwitchCliTemplateModel, usePollingTableQuery } from '@acx-ui/rc/utils'
import { useParams }                                    from '@acx-ui/react-router-dom'

import WiredTabs from './WiredTabs'

function WiredPageHeader () {
  const { $t } = useIntl()
  const { tenantId, venueId, serialNumber } = useParams()

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
      title={$t({ defaultMessage: 'Wired Network Profiles' })}
      breadcrumb={[{ text: $t({ defaultMessage: 'Wired' }) }]}
      footer={<WiredTabs
        profileCount={profileList?.data?.totalCount ? profileList?.data.totalCount : 0}
        cliCount={cli?.data?.totalCount ? cli?.data.totalCount : 0}
      />}
    />
  )
}

export default WiredPageHeader
