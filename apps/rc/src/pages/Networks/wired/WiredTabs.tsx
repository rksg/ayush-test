import { useIntl } from 'react-intl'

import { Tabs }                                  from '@acx-ui/components'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

function WiredTabs () {
  const { $t } = useIntl()
  const params = useParams()
  const basePath = useTenantLink('/networks/wired/')
  const navigate = useNavigate()
  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })


  return (
    <Tabs onChange={onTabChange}
      defaultActiveKey='profiles'
      activeKey={params.activeTab}
    >
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Configuration Profiles' })}
        key='profiles'
      />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'On-Demand CLI Configuration' })}
        key='onDemandCli'
      />
    </Tabs>
  )
}

export default WiredTabs
