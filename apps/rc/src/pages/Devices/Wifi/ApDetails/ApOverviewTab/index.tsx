import { useIntl } from 'react-intl'

export function ApOverviewTab () {
  const { $t } = useIntl()

  return (
    <>{ $t({ defaultMessage: 'Overview' })}</>
  )
}
