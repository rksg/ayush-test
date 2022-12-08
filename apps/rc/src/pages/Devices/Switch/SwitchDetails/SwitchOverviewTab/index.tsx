import { useIntl } from 'react-intl'

export function SwitchOverviewTab () {
  const { $t } = useIntl()

  return (
    <>{ $t({ defaultMessage: 'Overview' })}</>
  )
}
