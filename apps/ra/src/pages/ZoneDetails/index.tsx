import { omit } from 'lodash'

import { useParams }                                from '@acx-ui/react-router-dom'
import { AnalyticsFilter, PathNode, useDateFilter } from '@acx-ui/utils'

import { APList, QueryParamsForZone } from '../Wifi/ApsTable'
import { NetworkList }                from '../WifiNetworks/NetworksTable'

import { ZoneAnalyticsTab } from './ZoneAnalyticsTab'
import ZonePageHeader       from './ZonePageHeader'


const tabs = (args?: { queryParams: QueryParamsForZone } | undefined) => ({
  assurance: ZoneAnalyticsTab,
  clients: () => <div>clients tab</div>,
  devices: () => <APList queryParamsForZone={args?.queryParams} />,
  networks: () => <NetworkList queryParamsForZone={args?.queryParams}/>
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
  const Tab =
    tabs({
      queryParams: {
        searchString: zoneName,
        path: [[
          { type: 'system', name: systemName as string },
          { type: 'zone', name: zoneName as string }
        ]]
      }
    })[activeTab as keyof ReturnType<typeof tabs>] || ZoneAnalyticsTab
  return (
    <>
      <ZonePageHeader {...dateFilter} />
      {Tab && <Tab filters={filters} healthFilters={healthFilters} />}
    </>
  )
}
