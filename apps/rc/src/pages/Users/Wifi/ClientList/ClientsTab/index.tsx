import { ConnectedClientsTable, HistoricalClientsTable } from '@acx-ui/rc/components'

export function ClientsTab () {
  return <>
    <ConnectedClientsTable />
    {/* TODO: change string from search input */}
    {false && <HistoricalClientsTable searchString='' />}
  </>
}
