import { useIntl } from 'react-intl'

import { Tabs }                                  from '@acx-ui/components'
import { Features, useIsSplitOn }                from '@acx-ui/feature-toggle'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'


function WiredTabs (props: { profileCount: number, cliCount: number }) {
  const { $t } = useIntl()
  const params = useParams()
  const basePath = useTenantLink('/networks/wired/')
  const navigate = useNavigate()
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)

  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })

  const profileCount = props.profileCount
  const cliCount = props.cliCount

  return (
    <Tabs onChange={onTabChange}
      defaultActiveKey='profiles'
      activeKey={params.activeTab}
    >
      <Tabs.TabPane
        tab={isNavbarEnhanced
          ? $t({ defaultMessage: 'Configuration Profiles ({profileCount})' }, { profileCount })
          : $t({ defaultMessage: 'Configuration Profiles' })
        }
        key='profiles'
      />
      <Tabs.TabPane
        tab={isNavbarEnhanced
          ? $t({ defaultMessage: 'On-Demand CLI Configuration ({cliCount})' }, { cliCount })
          : $t({ defaultMessage: 'On-Demand CLI Configuration' })
        }
        key='onDemandCli'
      />
    </Tabs>
  )
}

export default WiredTabs
