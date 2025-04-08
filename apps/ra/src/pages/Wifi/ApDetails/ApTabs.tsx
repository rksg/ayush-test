/* eslint-disable max-len */
import { useIntl } from 'react-intl'

import { Tabs }                                  from '@acx-ui/components'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

function ApTabs () {
  const { $t } = useIntl()
  const { apId, activeTab } = useParams()
  const basePath = useTenantLink(`/devices/wifi/${apId}/details/`)
  const navigate = useNavigate()
  const onTabChange = (tab: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }
  return (
    <Tabs onChange={onTabChange} activeKey={activeTab}>
      <Tabs.TabPane tab={$t({ defaultMessage: 'AI Analytics' })} key='ai' />
      <Tabs.TabPane tab={$t({ defaultMessage: 'Reports' })}
        key='reports'
      />
    </Tabs>
  )
}

export default ApTabs
