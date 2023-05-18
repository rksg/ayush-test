import { useIntl } from 'react-intl'

import { Tabs }                                  from '@acx-ui/components'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

function WifiTabs (props: { apCount: number }) {
  const { $t } = useIntl()
  const params = useParams()
  const basePath = useTenantLink('/devices/wifi/')
  const navigate = useNavigate()
  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  const count = props.apCount ?? 0

  return (
    <Tabs onChange={onTabChange} activeKey={params.activeTab}>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'AP List ({count})' }, { count })}
        key='list'
      />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'AP Report' })}
        key='report'
      />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Air Time Utilization Report' })}
        key='airtime'
      />
    </Tabs>
  )
}

export default WifiTabs
