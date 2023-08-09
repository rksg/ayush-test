import { GuestDateFilter } from '../index'

import { GuestsTable } from './GuestsTable'

export function GuestsTab (props: { dateFilter: GuestDateFilter }) {
  return <GuestsTable dateFilter={props.dateFilter} />
}
