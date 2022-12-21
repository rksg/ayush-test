import { useIntl } from 'react-intl'

export function SwitchOverviewVLANs () {
  const { $t } = useIntl()
  return <>{
    $t({ defaultMessage: 'SwitchOverviewVLANs' })
  }</>
}