import { useEffect, useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Tabs, Loader }                                    from '@acx-ui/components'
import { useGetEdgeCageListQuery, useGetEdgeOltListQuery } from '@acx-ui/rc/services'
import { EdgeNokiaOltData, EdgeNokiaOltStatusEnum }        from '@acx-ui/rc/utils'

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

export const OltDetails = () => {
  const { $t } = useIntl()
  const { oltId } = useParams()
  const { activeSubTab } = useParams()
  // const oltDetails = useLocation().state as EdgeNokiaOltData

  // temp
  const { data: oltDetails } = useGetEdgeOltListQuery({}, {
    selectFromResult: ({ data, ...rest }) => {
      return {
        ...rest,
        data: data?.find(item => item.serialNumber === oltId) as EdgeNokiaOltData
      }
    }
  })

  const venueId = oltDetails?.venueId
  const edgeClusterId = oltDetails?.edgeClusterId
  // const oltId = oltDetails?.serialNumber
  const isOltOnline = oltDetails?.status === EdgeNokiaOltStatusEnum.ONLINE

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
      oltData={oltDetails}
      cagesList={cagesList}
      isLoading={isCagesLoading}
      isFetching={isCagesFetching}
    />
  }]

  return <>
    <OltDetailPageHeader
      oltDetails={oltDetails}
    />
    <OltInfoWidget
      oltDetails={oltDetails}
      cagesList={cagesList}
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
  </>
}