import { useIntl } from 'react-intl'

export function ApReportsTab () {
  const { $t } = useIntl()
  return (
    <>{$t({ defaultMessage: 'Reports' })}</>
  )
}
