import { useIntl } from 'react-intl'

export function SwitchClientsTab () {
  const { $t } = useIntl()

  return (
    <>{ $t({ defaultMessage: 'Clients' })}</>
  )
}