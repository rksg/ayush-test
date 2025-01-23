import { useEffect, useState } from 'react'

import { Col }       from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { GridRow, Tabs } from '@acx-ui/components'
// import {
// } from '@acx-ui/rc/services'

import { CagesTab }       from './CagesTab'
import { PerformanceTab } from './PerformanceTab'

enum OverviewInfoType {
    PERFORMANCE = 'peromance',
    CAGES = 'cages',
}
export const EdgeOverview = () => {
  const { $t } = useIntl()
  const { serialNumber, activeSubTab } = useParams()
  const [currentTab, setCurrentTab] = useState<string | undefined>(undefined)
  // const {
  //   currentEdgeStatus: currentEdge,
  //   isEdgeStatusLoading: isLoadingEdgeStatus,
  //   currentCluster
  // } = useContext(EdgeDetailsDataContext)

  const handleTabChange = (val: string) => {
    setCurrentTab(val)
  }

  useEffect(() => {
    if (activeSubTab && Object.values(OverviewInfoType).includes(activeSubTab as OverviewInfoType))
      setCurrentTab(activeSubTab)
  }, [activeSubTab])

  const tabs = [{
    label: $t({ defaultMessage: 'Performance' }),
    value: 'performance',
    children: <PerformanceTab />
  }, {
    label: $t({ defaultMessage: 'Cages' }),
    value: 'cages',
    children: <CagesTab />
  }]

  return (
    <GridRow>
      <Col span={24}>
        <OltDetailsPageHeader
          serialNumber={serialNumber}
        />
      </Col>
      <Col span={24}>
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
              {tab.children}
            </Tabs.TabPane>
          ))}
        </Tabs>
      </Col>
    </GridRow>
  )
}