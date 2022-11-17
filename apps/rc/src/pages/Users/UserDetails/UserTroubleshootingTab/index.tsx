import { useIntl } from 'react-intl'

export function UserTroubleshootingTab () {
  const { $t } = useIntl()
  return <>
    { $t({ defaultMessage: 'UserTroubleshootingTab' })}
  </>
}