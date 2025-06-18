import { useIntl } from 'react-intl'

import { ResidentExperienceTab }                 from '@acx-ui/analytics/components'
import type { Mdu360TabProps }                   from '@acx-ui/analytics/components'
import { Tabs }                                  from '@acx-ui/components'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

const Mdu360Tabs: React.FC<Mdu360TabProps> = ({ startDate, endDate }) => {
  const { $t } = useIntl()
  const basePath = useTenantLink('/mdu360', 'v')
  const navigate = useNavigate()
  const { activeTab } = useParams()

  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })

  return (
    <Tabs
      onChange={onTabChange}
      activeKey={activeTab}
      defaultActiveKey='residentExperience'
    >
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Network Overview' })}
        key='networkOverview'
      />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Resident Experience' })}
        key='residentExperience'
        children={<ResidentExperienceTab startDate={startDate} endDate={endDate} />}
      />
    </Tabs>
  )
}

export default Mdu360Tabs