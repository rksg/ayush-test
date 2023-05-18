import { useIntl } from 'react-intl'

import { Tabs }                                  from '@acx-ui/components'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

function SwitchTabs (props: { switchCount: number }) {
  const { $t } = useIntl()
  const params = useParams()
  const basePath = useTenantLink('/devices/switch')
  const navigate = useNavigate()
  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  const count = props.switchCount ?? 0

  return (
    <Tabs onChange={onTabChange} activeKey={params.activeTab}>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Switch List ({count})' }, { count })}
        key='list'
      />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Wired Report' })}
        key='report'
      />
    </Tabs>
  )
}

export default SwitchTabs
