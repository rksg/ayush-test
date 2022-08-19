import { useIntl } from 'react-intl'

export function VenueDevicesTab () {
  const { $t } = useIntl()
  return (
    <>{$t({ defaultMessage: 'Devices' })}</>
  )
}
