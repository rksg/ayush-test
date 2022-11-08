import { useIntl } from 'react-intl'

export function ApTroubleshootingTab () {
  const { $t } = useIntl()
  return (
    <>{$t({ defaultMessage: 'Troubleshooting' })}</>
  )
}
