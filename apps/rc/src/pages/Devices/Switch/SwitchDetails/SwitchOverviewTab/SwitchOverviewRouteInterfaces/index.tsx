import { useIntl } from 'react-intl'

export function SwitchOverviewRouteInterfaces () {
  const { $t } = useIntl()
  return <>{
    $t({ defaultMessage: 'SwitchOverviewRouteInterfaces' })
  }</>
}