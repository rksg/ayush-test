import { useIntl } from 'react-intl'

export function VenueNetworksTab () {
  const { $t } = useIntl()
  return (
    <>{$t({ defaultMessage: 'Networks' })}</>
  )
}
