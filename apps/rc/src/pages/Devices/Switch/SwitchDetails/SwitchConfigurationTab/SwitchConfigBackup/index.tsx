import { useIntl } from 'react-intl'

export function SwitchConfigBackup () {
  const { $t } = useIntl()
  return <>{
    $t({ defaultMessage: 'SwitchConfigBackup' })
  }</>
}