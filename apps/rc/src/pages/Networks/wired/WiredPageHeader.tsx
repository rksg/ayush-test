import { useIntl } from 'react-intl'

import { PageHeader }                                   from '@acx-ui/components'
import { Features, useIsSplitOn }                       from '@acx-ui/feature-toggle'
import { useGetCliTemplatesQuery, useGetProfilesQuery } from '@acx-ui/rc/services'
import { SwitchCliTemplateModel }                       from '@acx-ui/rc/utils'
import { useParams }                                    from '@acx-ui/react-router-dom'
import { usePollingTableQuery }                         from '@acx-ui/utils'

import WiredTabs from './WiredTabs'

function WiredPageHeader () {
  const { $t } = useIntl()
  const { tenantId, venueId, serialNumber } = useParams()
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)

  const defaultPayload = {
    filters: venueId ? { venueId: [venueId] } :
      serialNumber ? { serialNumber: [serialNumber] } : {}
  }

  const cli = usePollingTableQuery<SwitchCliTemplateModel>({
    useQuery: useGetCliTemplatesQuery,
    defaultPayload: {},
    enableRbac: isSwitchRbacEnabled
  })

  const profileList = useGetProfilesQuery({
    params: { tenantId },
    payload: defaultPayload,
    enableRbac: isSwitchRbacEnabled
  }, {
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
