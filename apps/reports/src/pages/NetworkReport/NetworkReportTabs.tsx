import { useIntl } from 'react-intl'

import { Tabs }                                  from '@acx-ui/components'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

function NetworkReportTabs () {
  const { $t } = useIntl()
  const params = useParams()
  const basePath = useTenantLink('/reports/network/')
  const navigate = useNavigate()
  const onTabChange = (tab: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }

  return (
    <Tabs onChange={onTabChange} activeKey={params.activeTab}>
      <Tabs.TabPane tab={$t({ defaultMessage: 'Wireless' })} key='wireless' />
      <Tabs.TabPane tab={$t({ defaultMessage: 'Wired' })} key='wired' />
    </Tabs>
  )
}

export default NetworkReportTabs
