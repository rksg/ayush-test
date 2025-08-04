import { useEffect, useState } from 'react'
import { createContext }       from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Tabs, Loader } from '@acx-ui/components'
import { Olt, OltCage } from '@acx-ui/olt/utils'

import { oltData, oltCageList } from '../mockdata'

import { OltDetailPageHeader } from './OltDetailPageHeader'
import { OltInfoWidget }       from './OltInfoWidget'
import { OltOLineCardTab }     from './OltOLineCardTab'
import { OltONetworkCardTab }  from './OltONetworkCardTab'
import { OltOverviewTab }      from './OltOverviewTab'

enum OverviewInfoType {
  OVERVIEW = 'Overview',
  NETWORK = 'Network',
  LINE = 'Line'
}

export const OltDetailsContext = createContext({} as {
  oltDetailsContextData: Olt
})

export const OltDetails = () => {
  const { $t } = useIntl()
  // const { oltId } = useParams()
  const { activeSubTab } = useParams()

  const oltDetails = oltData as Olt //TODO: temp, remove when api is ready
  const oltCages = oltCageList as OltCage[] //TODO: temp, remove when api is ready

  const [currentTab, setCurrentTab] = useState<string | undefined>(undefined)

  const handleTabChange = (val: string) => {
    setCurrentTab(val)
  }

  useEffect(() => {
    if (activeSubTab && Object.values(OverviewInfoType).includes(activeSubTab as OverviewInfoType))
      setCurrentTab(activeSubTab)
  }, [activeSubTab])

  const tabs = [{
    label: $t({ defaultMessage: 'Overview' }),
    value: OverviewInfoType.OVERVIEW,
    children: <OltOverviewTab />
  }, {
    label: $t({ defaultMessage: 'Network Card' }),
    value: OverviewInfoType.NETWORK,
    children: <OltONetworkCardTab />
  }, {
    label: $t({ defaultMessage: 'Line Card' }),
    value: OverviewInfoType.LINE,
    children: <OltOLineCardTab
      oltDetails={oltDetails}
      oltCages={oltCages}
      isLoading={false}
      isFetching={false}
    />
  }]

  return <OltDetailsContext.Provider value={{
    oltDetailsContextData: oltDetails
  }}>
    <OltDetailPageHeader
      oltDetails={oltDetails}
    />
    <OltInfoWidget
      oltDetails={oltDetails}
      oltCages={oltCages}
      isLoading={false}
      isFetching={false}
    />
    <Tabs type='card'
      activeKey={currentTab}
      defaultActiveKey={activeSubTab || tabs[0].value}
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
  </OltDetailsContext.Provider>
}