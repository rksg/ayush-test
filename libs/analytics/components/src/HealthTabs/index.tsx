import { useEffect, useState } from 'react'

import { useIntl, FormattedMessage } from 'react-intl'

import { useLazySwitchListQuery }                             from '@acx-ui/analytics/services'
import { Tabs, Tooltip }                                      from '@acx-ui/components'
import { get }                                                from '@acx-ui/config'
import { useLazyGetSwitchListQuery }                          from '@acx-ui/rc/services'
import { useLocation, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { useDateFilter }                                      from '@acx-ui/utils'

import { HealthPage }       from '..'
import { useNetworkFilter } from '../Header'

import { OverviewTab }   from './OverviewTab'
import { FilterWrapper } from './styledComponents'

export function HealthTabs () {
  const { $t } = useIntl()
  const location = useLocation()
  const navigate = useNavigate()
  const { activeSubTab } = useParams()
  const basePath = useTenantLink('/analytics/health/')

  const isMlisa = get('IS_MLISA_SA')

  const [switchCount, setSwitchCount] = useState(0)
  const { tenantId } = useParams()
  const [getSwitchList] = useLazyGetSwitchListQuery()
  const [switchList] = useLazySwitchListQuery()
  const { startDate, endDate } = useDateFilter()

  const noSwitchMsg = `Switches have not been on boarded in your SmartZone
    or there is <b>no RUCKUS switch</b> in your network`

  const fetchSwitchData = () => {
    if(isMlisa) {
      switchList({
        start: startDate,
        end: endDate,
        limit: 100,
        query: '',
        metric: 'totalTraffic'
      }).then(result => {
        if (result.data) {
          setSwitchCount(result.data.switches.length || 0)
        }
      })
    } else {
      getSwitchList({
        params: { tenantId },
        payload: { filters: {} }
      }).then(result => {
        if (result.data) {
          setSwitchCount(result.data.totalCount || 0)
        }
      })
    }
  }

  useEffect(() => {
    fetchSwitchData()
    if (switchCount === 0 && activeSubTab === 'wired') {
      onTabChange('overview')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[switchCount, startDate, endDate])

  const onTabChange = (tab: string) => {
    navigate({
      ...location,
      pathname: `${basePath.pathname}/${tab}`
    })
  }
  return <Tabs
    onChange={onTabChange}
    destroyInactiveTabPane
    activeKey={activeSubTab}
    defaultActiveKey='overview'
    type='card'
  >
    <Tabs.TabPane tab={$t({ defaultMessage: 'Overview' })} key='overview'>
      <>
        <FilterWrapper>
          {useNetworkFilter({
            shouldQuerySwitch: true,
            shouldShowOnlyDomains: true
          })}
        </FilterWrapper>
        <OverviewTab/>
      </>
    </Tabs.TabPane>
    <Tabs.TabPane tab={$t({ defaultMessage: 'Wireless' })} key='wireless'>
      <>
        <FilterWrapper>
          {useNetworkFilter({})}
        </FilterWrapper>
        <HealthPage />
      </>
    </Tabs.TabPane>
    <Tabs.TabPane
      tab={switchCount === 0
        ? <Tooltip
          title={<FormattedMessage
            defaultMessage={noSwitchMsg}
            values={{
              b: (content: string) => <b>{content}</b>
            }}
          />}
          placement='bottom'>
          {$t({ defaultMessage: 'Wired' })}
        </Tooltip>
        : $t({ defaultMessage: 'Wired' })}
      key='wired'
      disabled={switchCount === 0}>
      <>
        <FilterWrapper>
          {useNetworkFilter({
            shouldQueryAp: false,
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
