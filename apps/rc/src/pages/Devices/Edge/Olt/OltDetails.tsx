import { useEffect, useState } from 'react'

import { Col }                    from 'antd'
import { useIntl }                from 'react-intl'
import { useLocation, useParams } from 'react-router-dom'

import { GridRow, Tabs }                 from '@acx-ui/components'
import { EdgeNokiaOltDetailsPageHeader } from '@acx-ui/edge/components'
import { EdgeNokiaOltData }              from '@acx-ui/rc/utils'

import { CagesTab }       from './CagesTab'
import { PerformanceTab } from './PerofrmanceTab'

enum OverviewInfoType {
    PERFORMANCE = 'peromance',
    CAGES = 'cages',
}
export const EdgeNokiaOltDetails = () => {
  const { $t } = useIntl()
  const { activeSubTab } = useParams()
  const oltDetails = useLocation().state as EdgeNokiaOltData
  // TODO: remove after API returns data
  if (oltDetails) {
    oltDetails.venueId = '2c5422d229924ce899ad26334699aeea'
    oltDetails.venueName = 'Raj-PoC-Venue1'
    oltDetails.edgeClusterId = 'aef88a46-c0d5-415b-8f6f-e2c1cc4edc60'
    oltDetails.edgeClusterName = 'Raj_PoC_1 SE-Standalone-2.1.0.971'
  }

  const [currentTab, setCurrentTab] = useState<string | undefined>(undefined)

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
    children: <CagesTab oltData={oltDetails} />
  }]

  return (
    <GridRow>
      <Col span={24}>
        <EdgeNokiaOltDetailsPageHeader
          currentOlt={oltDetails}
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