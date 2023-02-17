import { useIntl } from 'react-intl'

const Subscriptions = () => {
  const { $t } = useIntl()
  return <>{$t({ defaultMessage: 'Subscriptions' })}</>
}

export default Subscriptions