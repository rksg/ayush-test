import { useIntl } from 'react-intl'

import {
  UserConnectionForm
} from '../../../NetworkMoreSettings/UserConnectionForm'

const UserConnectionOfMoreSettingsForm = () => {
  const { $t } = useIntl()

  return (
    <>
      {$t({ defaultMessage: 'User Connection Settings(Time limited)' })}
      <UserConnectionForm />
    </>

  )
}

export default UserConnectionOfMoreSettingsForm