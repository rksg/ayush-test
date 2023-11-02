import { omit } from 'lodash'

import { useParams }                                from '@acx-ui/react-router-dom'
import { AnalyticsFilter, PathNode, useDateFilter } from '@acx-ui/utils'

import { APList } from '../Wifi/ApsTable'

import { ZoneAnalyticsTab } from './ZoneAnalyticsTab'
import ZonePageHeader       from './ZonePageHeader'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tabs = (args?: { shouldQueryZoneWiseApList: any } | undefined) => ({
  assurance: ZoneAnalyticsTab,
  clients: () => <div>clients tab</div>,
  devices: () => <APList shouldQueryZoneWiseApList={args?.shouldQueryZoneWiseApList} />,
  networks: () => <div>network tab</div>
})

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
  const Tab = tabs({
    shouldQueryZoneWiseApList: {
      searchString: zoneName,
      path: [{ type: 'system', name: systemName }, { type: 'zone', name: zoneName }]
    }
  })[activeTab as keyof ReturnType<typeof tabs>] || ZoneAnalyticsTab
  return <>
    <ZonePageHeader {...dateFilter}/>
    { Tab && <Tab filters={filters} healthFilters={healthFilters} /> }
  </>
}
