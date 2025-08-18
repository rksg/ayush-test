import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Tabs, Loader }                          from '@acx-ui/components'
import { Olt, OltCage, OltMockdata }             from '@acx-ui/olt/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { OltInfoWidget } from '../OltInfoWidget'

import { OltLineCardTab }    from './OltLineCardTab'
import { OltNetworkCardTab } from './OltNetworkCardTab'
import { OltPanelTab }       from './OltPanelTab'

enum OverviewInfoType {
  PANEL = 'panel',
  NETWORK = 'network',
  LINE = 'line'
}

const { oltData, oltCageList } = OltMockdata

export function OltOverviewTab () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const { activeSubTab, oltId, venueId } = useParams()
  const basePath = useTenantLink(`/devices/optical/${venueId}/${oltId}/details/overview`)

  const oltDetails = oltData as Olt //TODO: temp, remove when api is ready
  const oltCages = oltCageList as OltCage[] //TODO: temp, remove when api is ready

  const [currentTab, setCurrentTab] = useState<string | undefined>(undefined)

  const handleTabChange = (tab: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }

  useEffect(() => {
    if (activeSubTab && Object.values(OverviewInfoType).includes(activeSubTab as OverviewInfoType))
      setCurrentTab(activeSubTab)
  }, [activeSubTab])

  const tabs = [{
    label: $t({ defaultMessage: 'Panel' }),
    value: OverviewInfoType.PANEL,
    children: <OltPanelTab />
  }, {
    label: $t({ defaultMessage: 'Network Card' }),
    value: OverviewInfoType.NETWORK,
    children: <OltNetworkCardTab />
  }, {
    label: $t({ defaultMessage: 'Line Card' }),
    value: OverviewInfoType.LINE,
    children: <OltLineCardTab
      oltDetails={oltDetails}
      oltCages={oltCages}
      isLoading={false}
      isFetching={false}
    />
  }]

  return <div>
    <OltInfoWidget
      oltDetails={oltDetails}
      oltCages={oltCages}
      isLoading={false}
      isFetching={false}
    />
    <Tabs type='card'
      activeKey={currentTab}
      defaultActiveKey={currentTab || tabs[0].value}
      onChange={handleTabChange}
    >
      {tabs.map((tab) => (
        <Tabs.TabPane
          tab={tab.label}
          key={tab.value}
        >
          <Loader
            // states={[{ isLoading: isCagesLoading, isFetching: isCagesFetching }]}
            style={{ minHeight: '100px' }}
          >
            {tab.children}
          </Loader>
        </Tabs.TabPane>
      ))}
    </Tabs>
  </div>
}