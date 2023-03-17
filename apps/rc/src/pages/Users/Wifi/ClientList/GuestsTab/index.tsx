import { GuestDateFilter } from '../PageHeader'

import { GuestsTable } from './GuestsTable'

export function GuestsTab (props: { dateFilter: GuestDateFilter }) {
  return <GuestsTable dateFilter={props.dateFilter} />
}
