import { useIntl } from 'react-intl'

export default function AdaptivePolicySetTable () {
  const { $t } = useIntl()
  return <>{$t({ defaultMessage: 'Adaptive Policy Set (In progress)' })}</>
}
