import { useIntl }     from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { Tabs }                from '@acx-ui/components'
import { ApGroupDetailHeader } from '@acx-ui/rc/utils'
import { useTenantLink }       from '@acx-ui/react-router-dom'

import { useApGroupContext } from './ApGroupContextProvider'

function ApGroupTabs (props: { apGroupDetail: ApGroupDetailHeader }) {
  const { $t } = useIntl()
  const params = useApGroupContext()
  const basePath = useTenantLink(`devices/apgroups/${params.apGroupId}/details/`)
  const navigate = useNavigate()
  const { apGroupDetail } = props


  const onTabChange = (tab: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }

  return (
    <Tabs onChange={onTabChange} activeKey={params.activeTab}>
      <Tabs.TabPane key='members'
        tab={$t({
          defaultMessage: 'APs ({apCount})' },
        { apCount: apGroupDetail?.headers?.members || 0 } )}
      />
      <Tabs.TabPane key='networks'
        tab={$t({
          defaultMessage: 'Networks ({networksCount})' },
        { networksCount: apGroupDetail?.headers?.networks || 0 })}
      />
      <Tabs.TabPane key='incidents'
        tab={$t({ defaultMessage: 'Incidents' })}
      />
    </Tabs>
  )
}

export default ApGroupTabs