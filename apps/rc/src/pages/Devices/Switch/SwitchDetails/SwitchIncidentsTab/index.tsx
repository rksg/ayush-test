import { useIntl } from 'react-intl'

export function SwitchIncidentsTab () {
  const { $t } = useIntl()

  return (
    <>{ $t({ defaultMessage: 'Incidents' })}</>
  )
}