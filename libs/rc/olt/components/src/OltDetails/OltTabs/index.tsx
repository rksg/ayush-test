import { useIntl } from 'react-intl'

import { Tabs }                                  from '@acx-ui/components'
import { Olt }                                   from '@acx-ui/olt/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function OltTabs (props: {
  oltDetails: Olt
}) {
  const { $t } = useIntl()
  const params = useParams()
  const basePath = useTenantLink(`/devices/optical/${params.venueId}/${params.oltId}/details/`)
  const navigate = useNavigate()
  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })

  return (
    <Tabs onChange={onTabChange} activeKey={params.activeTab}>
      <Tabs.TabPane tab={$t({ defaultMessage: 'Overview' })} key='overview' />
      <Tabs.TabPane tab={$t({ defaultMessage: 'ONU/Ts ({count})' }, { count: 50 })} key='onts' />
      <Tabs.TabPane tab={$t({ defaultMessage: 'Configuration History' })} key='configuration' />
    </Tabs>
  )
}
