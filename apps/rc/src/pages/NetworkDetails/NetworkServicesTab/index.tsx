import { useIntl } from 'react-intl'

export function NetworkServicesTab () {
  const { $t } = useIntl()

  return (
    <>{$t({ defaultMessage: 'Services' })}</>
  )
}
