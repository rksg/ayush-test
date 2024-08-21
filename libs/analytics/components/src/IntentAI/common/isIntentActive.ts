import { statuses } from '../states'
import { Intent }   from '../useIntentDetailsQuery'

export const isIntentActive = (intent: Intent) => [
  statuses.new,
  statuses.scheduled,
  statuses.paused,
  statuses.na
].includes(intent.status as statuses) === false
