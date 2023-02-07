import { useIntl } from 'react-intl'

export function OnDemandCliTab () {
  const { $t } = useIntl()

  return (
    <>{$t({ defaultMessage: 'On-Demand CLI Configuration tab' })}</>
  )
}
