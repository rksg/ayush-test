import { useIntl } from 'react-intl'

import { Tabs }                                  from '@acx-ui/components'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

function WifiTabs (props: { networkCount: number }) {
  const { $t } = useIntl()
  const params = useParams()
  const basePath = useTenantLink('/networks/')
  const navigate = useNavigate()
  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  const count = props.networkCount ?? 0

  return (
    <Tabs onChange={onTabChange} activeKey={params.activeTab}>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Network List ({count})' }, { count })}
        key='wireless'
      />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'WLAN Report' })}
        key='wlan'
      />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Applications Report' })}
        key='application'
      />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Wireless Report' })}
        key='wifi'
      />
    </Tabs>
  )
}

export default WifiTabs
