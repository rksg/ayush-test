import { useIntl } from 'react-intl'

export function SwitchOverviewPanel () {
  const { $t } = useIntl()
  return <>{
    $t({ defaultMessage: 'SwitchOverviewPanel' })
  }</>
}