import { useIntl } from 'react-intl'

export function VenueClientsTab () {
  const { $t } = useIntl()
  return (
    <>{$t({ defaultMessage: 'Clients' })}</>
  )
}
