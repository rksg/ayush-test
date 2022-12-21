import { useIntl } from 'react-intl'

export function SwitchOverviewACLs () {
  const { $t } = useIntl()
  return <>{
    $t({ defaultMessage: 'SwitchOverviewACLs' })
  }</>
}