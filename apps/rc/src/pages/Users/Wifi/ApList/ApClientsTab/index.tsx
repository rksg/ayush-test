import { HistoricalClientsTable } from '@acx-ui/rc/components'

import ConnectedClientsTable from './ConnectedClientsTable'

export function ApClientsTab () {
  return <>
    <ConnectedClientsTable />
    {/* TODO: change string from search input */}
    <HistoricalClientsTable searchString='' />
  </>
}