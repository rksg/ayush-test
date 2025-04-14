import { useIntl }     from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { Tabs }                                   from '@acx-ui/components'
import { ApGroupDetailHeader, useConfigTemplate } from '@acx-ui/rc/utils'
import { getUserProfile, isCoreTier }             from '@acx-ui/user'

import { usePathBasedOnConfigTemplate } from '../configTemplates'

import { useApGroupContext } from './ApGroupContextProvider'

function ApGroupTabs (props: { apGroupDetail: ApGroupDetailHeader }) {
  const { $t } = useIntl()
  const { isTemplate } = useConfigTemplate()
  const params = useApGroupContext()
  const basePath = usePathBasedOnConfigTemplate(`devices/apgroups/${params.apGroupId}/details/`)
  const navigate = useNavigate()
  const { apGroupDetail } = props
  const { accountTier } = getUserProfile()
  const isCore = isCoreTier(accountTier)


  const onTabChange = (tab: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }

  return (
    <Tabs onChange={onTabChange} activeKey={params.activeTab}>
      {!isTemplate && <Tabs.TabPane key='members'
        tab={$t({
          defaultMessage: 'APs ({apCount})' },
        { apCount: apGroupDetail?.headers?.members || 0 } )}
      />}
      <Tabs.TabPane key='networks'
        tab={$t({
          defaultMessage: 'Networks ({networksCount})' },
        { networksCount: apGroupDetail?.headers?.networks || 0 })}
      />
      {(!isTemplate && !isCore) && <Tabs.TabPane key='incidents'
        tab={$t({ defaultMessage: 'Incidents' })}
      />}
    </Tabs>
  )
}

export default ApGroupTabs
