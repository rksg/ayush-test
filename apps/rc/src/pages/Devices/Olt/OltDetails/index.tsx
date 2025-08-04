import { useEffect, useState } from 'react'
import { createContext }       from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Tabs, Loader }                                    from '@acx-ui/components'
import { Olt, OltCage, OltStatusEnum }                     from '@acx-ui/olt/utils'
import { useGetEdgeCageListQuery, useGetEdgeOltListQuery } from '@acx-ui/rc/services'

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
  const { oltId } = useParams()
  const { activeSubTab } = useParams()

  // temp
  const { data: oltDetails } = useGetEdgeOltListQuery({}, {
    selectFromResult: ({ data, ...rest }) => {
      const result = data as unknown as Olt[] //TODO: temp
      return {
        ...rest,
        data: result?.find(item => item.serialNumber === oltId) as Olt
      }
    }
  })

  const venueId = oltDetails?.venueId
  const edgeClusterId = oltDetails?.edgeClusterId
  const isOltOnline = oltDetails?.status === OltStatusEnum.ONLINE

  const [currentTab, setCurrentTab] = useState<string | undefined>(undefined)

  const {
    data: cagesList,
    isLoading: isCagesLoading,
    isFetching: isCagesFetching
  } = useGetEdgeCageListQuery({
    params: { venueId, edgeClusterId, oltId }
  }, { skip: !isOltOnline || !venueId || !edgeClusterId || !oltId })

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
      // oltData={oltDetails}
      // cagesList={cagesList}
      // isLoading={isCagesLoading}
      // isFetching={isCagesFetching}
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
      cagesList={cagesList as unknown as OltCage[]}
      isLoading={isCagesLoading}
      isFetching={isCagesFetching}
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
            states={[{ isLoading: isCagesLoading, isFetching: isCagesFetching }]}
            style={{ minHeight: '100px' }}
          >
            {tab.children}
          </Loader>
        </Tabs.TabPane>
      ))}
    </Tabs>
  </OltDetailsContext.Provider>
}