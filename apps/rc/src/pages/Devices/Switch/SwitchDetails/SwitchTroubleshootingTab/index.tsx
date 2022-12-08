import { useIntl } from 'react-intl'

export function SwitchTroubleshootingTab () {
  const { $t } = useIntl()

  return (
    <>{ $t({ defaultMessage: 'Troubleshooting' })}</>
  )
}