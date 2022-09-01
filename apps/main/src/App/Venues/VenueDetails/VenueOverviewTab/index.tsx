import { useIntl } from 'react-intl'

export function VenueOverviewTab () {
  const { $t } = useIntl()
  return (
    <>{$t({ defaultMessage: 'Overview' })}</>
  )
}
