import { useIntl } from 'react-intl'

export function NetworkOverviewTab () {
  const { $t } = useIntl()

  return (
    <>{ $t({ defaultMessage: 'Overview' })}</>
  )
}
