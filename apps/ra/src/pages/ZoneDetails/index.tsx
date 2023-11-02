import { omit } from 'lodash'

import { useParams }                                from '@acx-ui/react-router-dom'
import { AnalyticsFilter, PathNode, useDateFilter } from '@acx-ui/utils'

import { ZoneAnalyticsTab } from './ZoneAnalyticsTab'
import ZonePageHeader       from './ZonePageHeader'

const tabs = {
  assurance: ZoneAnalyticsTab,
  clients: () => <div>clients tab</div>,
  devices: () => <div>devices tab</div>,
  networks: () => <div>network tab</div>
}

export default function ZoneDetails () {
  const dateFilter = useDateFilter()
  const { systemName, zoneName, activeTab } = useParams()
  const path = [
    { name: systemName, type: 'system' },
    { name: zoneName, type: 'zone' }
  ] as PathNode[]
  const filters = {
    filter: {
      networkNodes: [path],
      switchNodes: [path]
    },
    ...omit(dateFilter, 'setDateFilter')
  } as unknown as AnalyticsFilter
  const healthFilters = {
    filter: {
      networkNodes: [path]
    },
    ...omit(dateFilter, 'setDateFilter')
  } as unknown as AnalyticsFilter
  const Tab = tabs[activeTab as keyof typeof tabs]
  return <>
    <ZonePageHeader {...dateFilter}/>
    { Tab && <Tab filters={filters} healthFilters={healthFilters} /> }
  </>
}

