import { useIntl } from 'react-intl'

import { Tabs }                                from '@acx-ui/components'
import { useLocation, useNavigate, useParams } from '@acx-ui/react-router-dom'

import { HealthPage }       from '..'
import { useNetworkFilter } from '../Header'

import { FilterWrapper } from './styledComponents'

export function HealthTabs () {
  const { $t } = useIntl()
  const location = useLocation()
  const navigate = useNavigate()
  const { activeSubTab } = useParams()
  const onTabChange = (tab: string) => {
    navigate({
      ...location,
      pathname: activeSubTab
        ? location.pathname.replace(activeSubTab as string, tab)
        : `${location.pathname}/${tab}`
    })
  }
  return <Tabs
    onChange={onTabChange}
    activeKey={activeSubTab}
    defaultActiveKey='overview'
    type='card'
  >
    <Tabs.TabPane tab={$t({ defaultMessage: 'Overview' })} key='overview'>
      <>
        <FilterWrapper>
          {useNetworkFilter({
            shouldQueryAp: true,
            shouldQuerySwitch: true
          })}
        </FilterWrapper>
        <div>
        Health Overview Page
        </div>
      </>
    </Tabs.TabPane>
    <Tabs.TabPane tab={$t({ defaultMessage: 'Wireless' })} key='wireless'>
      <>
        <FilterWrapper>
          {useNetworkFilter({
            shouldQueryAp: true
          })}
        </FilterWrapper>
        <HealthPage />
      </>
    </Tabs.TabPane>
    <Tabs.TabPane tab={$t({ defaultMessage: 'Wired' })} key='wired'>
      <>
        <FilterWrapper>
          {useNetworkFilter({
            shouldQuerySwitch: true
          })}
        </FilterWrapper>
        <div>
        Health Wired Page
        </div>
      </>
    </Tabs.TabPane>
  </Tabs>
}
