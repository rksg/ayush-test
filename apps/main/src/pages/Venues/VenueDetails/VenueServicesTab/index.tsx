import { useIntl } from 'react-intl'

export function VenueServicesTab () {
  const { $t } = useIntl()
  return (
    <>{$t({ defaultMessage: 'Services' })}</>
  )
}
