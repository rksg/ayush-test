import { useIntl } from 'react-intl'

import { Tabs }                                  from '@acx-ui/components'
import { Features, useIsSplitOn }                from '@acx-ui/feature-toggle'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

function WifiTabs (props: { clientCount: number, guestCount: number }) {
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
  const clientCount = props.clientCount
  const guestCount = props.guestCount

  return (
    <Tabs onChange={onTabChange} activeKey={params.activeTab}>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Clients List ({clientCount})' }, { clientCount })}
        key='clients'
      />
      <Tabs.TabPane
        tab={navbarEnhancement
          ? $t({ defaultMessage: 'Guest Pass Credentials ({guestCount})' }, { guestCount })
          : $t({ defaultMessage: 'Guest Pass Credentials' })
        }
        key='guests'
      />
      {navbarEnhancement && <Tabs.TabPane
        tab={$t({ defaultMessage: 'Wireless Clients Report' })}
        key='reports'
      />}
    </Tabs>
  )
}

export default WifiTabs
