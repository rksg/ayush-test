import { useIntl } from 'react-intl'

export function VenueTimelineTab () {
  const { $t } = useIntl()
  return (
    <>{$t({ defaultMessage: 'Timeline' })}</>
  )
}
