import { useIntl } from 'react-intl'

export function SwitchDhcpTab () {
  const { $t } = useIntl()

  return (
    <>{ $t({ defaultMessage: 'DHCP' })}</>
  )
}