import { useIntl } from 'react-intl'

export function SwitchReportsTab () {
  const { $t } = useIntl()

  return (
    <>{ $t({ defaultMessage: 'Reports' })}</>
  )
}