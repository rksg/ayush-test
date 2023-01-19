import { useIntl } from 'react-intl'

import { Tabs }                                  from '@acx-ui/components'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

function WifiTabs (props: { clientCount: number }) {
  const { $t } = useIntl()
  const params = useParams()
  const basePath = useTenantLink('/users/wifi/')
  const navigate = useNavigate()
  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  const count = props.clientCount ?? 0

  return (
    <Tabs onChange={onTabChange} activeKey={params.activeTab}>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Clients ({count})' }, { count })}
        key='clients'
      />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Guest Pass Credentials' })}
        key='guests' />
    </Tabs>
  )
}

export default WifiTabs
