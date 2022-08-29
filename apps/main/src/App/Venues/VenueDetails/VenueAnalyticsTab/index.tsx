import { useIntl } from 'react-intl'

export function VenueAnalyticsTab () {
  const { $t } = useIntl()
  return (
    <>{$t({ defaultMessage: 'AI Analytics' })}</>
  )
}
