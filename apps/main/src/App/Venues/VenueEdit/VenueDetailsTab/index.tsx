import { useIntl } from 'react-intl'

export function VenueDetailsTab () {
  const { $t } = useIntl()
  return (
    <>{$t({ defaultMessage: 'Venue Details' })}</>
  )
}