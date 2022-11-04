import { useIntl } from 'react-intl'

export function ApClientsTab () {
  const { $t } = useIntl()
  return (
    <>{$t({ defaultMessage: 'Clients' })}</>
  )
}
