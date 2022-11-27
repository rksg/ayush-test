import { useIntl } from 'react-intl'
import GuestsTable from './GuestsTable'

export function ApGuestsTab () {
  const { $t } = useIntl()
  return <GuestsTable />
}