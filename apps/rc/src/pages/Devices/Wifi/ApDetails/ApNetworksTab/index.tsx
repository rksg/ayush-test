import { useIntl } from 'react-intl'

export function ApNetworksTab () {
  const { $t } = useIntl()
  return (
    <>{$t({ defaultMessage: 'Networks' })}</>
  )
}
