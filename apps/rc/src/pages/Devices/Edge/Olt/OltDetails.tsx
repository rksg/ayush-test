import { useEffect, useState } from 'react'

import { useIntl }                from 'react-intl'
import { useLocation, useParams } from 'react-router-dom'

import { Tabs, Loader }                             from '@acx-ui/components'
import { EdgeNokiaOltDetailsPageHeader }            from '@acx-ui/edge/components'
import { useGetEdgeCageListQuery }                  from '@acx-ui/rc/services'
import { EdgeNokiaOltData, EdgeNokiaOltStatusEnum } from '@acx-ui/rc/utils'

import { CagesTab }       from './CagesTab'
import { PerformanceTab } from './PerformanceTab'
import { UplinkTab }      from './UplinkTab'

enum OverviewInfoType {
    PERFORMANCE = 'peromance',
    CAGES = 'cages',
    UPLINK = 'uplink'
}

export const EdgeNokiaOltDetails = () => {
  const { $t } = useIntl()
  const { activeSubTab } = useParams()
  const oltDetails = useLocation().state as EdgeNokiaOltData

  const venueId = oltDetails?.venueId
  const edgeClusterId = oltDetails?.edgeClusterId
  const oltId = oltDetails?.serialNumber
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
    label: $t({ defaultMessage: 'Performance' }),
    value: OverviewInfoType.PERFORMANCE,
    children: <PerformanceTab
      isOltOnline={isOltOnline}
      cagesList={cagesList}
      isLoading={isCagesLoading}
      isFetching={isCagesFetching}
    />
  }, {
    label: $t({ defaultMessage: 'Cages' }),
    value: OverviewInfoType.CAGES,
    children: <CagesTab
      oltData={oltDetails}
      cagesList={cagesList}
      isLoading={isCagesLoading}
      isFetching={isCagesFetching}
    />
  }, {
    label: $t({ defaultMessage: 'Uplink' }),
    value: OverviewInfoType.UPLINK,
    children: <UplinkTab />
  }]

  return <>
    <EdgeNokiaOltDetailsPageHeader
      currentOlt={oltDetails}
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