import { useIntl } from 'react-intl'

export default function AdaptivePolicyTable () {
  const { $t } = useIntl()
  return <>{$t({ defaultMessage: 'Adaptive Policy (In progress)' })}</>
}
