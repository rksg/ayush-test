import { useIntl } from 'react-intl'

export function NetworkOverviewTab () {
  const { $t } = useIntl()

  return (
    <>{ $t({id:'network.overview.title', defaultMessage: 'Overview'})}</>
  )
}
