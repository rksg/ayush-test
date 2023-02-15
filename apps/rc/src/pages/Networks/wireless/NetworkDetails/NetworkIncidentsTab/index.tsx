import { useIntl } from 'react-intl'

export function NetworkIncidentsTab () {
  const { $t } = useIntl()
  return (
    <>{$t({ defaultMessage: 'Incidents' })}</>
  )
}
