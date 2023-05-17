import { useIntl } from 'react-intl'

import { Features, useIsSplitOn }                from '@acx-ui/feature-toggle'
import { Tabs }                                  from '@acx-ui/components'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

function WifiTabs (props: { clientCount: number, guestPassCount: number }) {
  const { $t } = useIntl()
  const params = useParams()
  const basePath = useTenantLink('/users/wifi/')
  const navigate = useNavigate()
  const navbarEnhancement = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)
  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  const clientCount = props.clientCount ?? 0
  const guestPassCount = props.guestPassCount ?? 0

  return (
    <Tabs onChange={onTabChange} activeKey={params.activeTab}>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Clients List ({clientCount})' }, { clientCount })}
        key='clients'
      />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Guest Pass Credentials ({guestPassCount})' }, { guestPassCount })}
        key='guests'
      />
      {!navbarEnhancement && <Tabs.TabPane
        tab={$t({ defaultMessage: 'Wireless Clients Report' })}
        key='reports'
      />}
    </Tabs>
  )
}

export default WifiTabs
