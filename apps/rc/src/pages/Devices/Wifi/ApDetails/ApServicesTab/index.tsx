import { useIntl } from 'react-intl'

export function ApServicesTab () {
  const { $t } = useIntl()
  return (
    <>{$t({ defaultMessage: 'Services' })}</>
  )
}
