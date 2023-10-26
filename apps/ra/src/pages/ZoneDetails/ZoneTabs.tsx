import { useIntl } from 'react-intl'

import { Tabs }                                  from '@acx-ui/components'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

function VenueTabs () {
  const { $t } = useIntl()
  const { systemName, zoneName, activeTab } = useParams()
  const basePath = useTenantLink(`/zones/${systemName}/${zoneName}/`)
  const navigate = useNavigate()

  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })

  return (
    <Tabs onChange={onTabChange} activeKey={activeTab} defaultActiveKey='analytics'>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'AI Analytics' })}
        key='analytics'
      />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Networks' })}
        key='networks'
      />
    </Tabs>
  )
}

export default VenueTabs

