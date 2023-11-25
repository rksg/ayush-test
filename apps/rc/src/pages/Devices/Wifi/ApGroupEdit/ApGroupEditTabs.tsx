import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { Tabs }          from '@acx-ui/components'
import { useTenantLink } from '@acx-ui/react-router-dom'

export function ApGroupEditTabs () {
  const { $t } = useIntl()
  const params = useParams()
  //const location = useLocation()
  const navigate = useNavigate()
  const basePath = useTenantLink(`/devices/apgroups/${params.apGroupId}/edit/`)

  const onTabChange = (tab: string) => {

    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }

  return (
    <Tabs onChange={onTabChange} activeKey={params.activeTab}>
      <Tabs.TabPane tab={$t({ defaultMessage: 'General' })} key='general' />
      <Tabs.TabPane tab={$t({ defaultMessage: 'VLAN & Radio' })} key='vlanRadio' />
    </Tabs>
  )
}