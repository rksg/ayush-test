import { useIntl } from 'react-intl'
import ConnectedClientsTable from './ConnectedClientsTable'

export function ApClientsTab () {
  const { $t } = useIntl()
  return <>
    <ConnectedClientsTable />
  </>
}