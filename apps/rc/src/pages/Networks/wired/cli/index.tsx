import { useIntl } from 'react-intl'

export function CliTab () {
  const { $t } = useIntl()

  return (
    <>{$t({ defaultMessage: 'On-Demand CLI Configuration tab' })}</>
  )
}
