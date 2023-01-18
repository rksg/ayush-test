import { useIntl } from 'react-intl'

const Notifications = () => {
  const { $t } = useIntl()
  return <>{$t({ defaultMessage: 'Notifications' })}</>
}

export default Notifications