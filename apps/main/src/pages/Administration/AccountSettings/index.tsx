import { useIntl } from 'react-intl'

const AccountSettings = () => {
  const { $t } = useIntl()
  return <>{$t({ defaultMessage: 'Account Settings' })}</>
}

export default AccountSettings