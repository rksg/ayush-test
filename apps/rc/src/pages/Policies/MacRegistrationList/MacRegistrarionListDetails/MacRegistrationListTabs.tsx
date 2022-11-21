import { Tabs }    from 'antd'
import { useIntl } from 'react-intl'

import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

function MacRegistrationListTabs () {
  const { $t } = useIntl()
  const params = useParams()
  // eslint-disable-next-line max-len
  const basePath = useTenantLink(`/policies/mac-registration-lists/${params.macRegistrationListId}/mac-registration-lists-details/`)
  const navigate = useNavigate()
  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })

  return (
    <Tabs onChange={onTabChange} activeKey={params.activeTab}>
      <Tabs.TabPane tab={$t({ defaultMessage: 'Overview' })} key='overview' />
      <Tabs.TabPane tab={$t({ defaultMessage: 'MAC Registrations' })} key='mac_registrations' />
    </Tabs>
  )
}

export default MacRegistrationListTabs
