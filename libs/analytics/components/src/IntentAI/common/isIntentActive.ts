import { Statuses } from '../states'
import { Intent }   from '../useIntentDetailsQuery'

export const isIntentActive = (intent: Intent) => [
  Statuses.new,
  Statuses.scheduled,
  Statuses.paused,
  Statuses.na
].includes(intent.status as Statuses) === false