import { useIntl } from 'react-intl'

import { PageHeader } from '@acx-ui/components'

import UsersTabs from './UsersTabs'

function UsersPageHeader () {
  const { $t } = useIntl()
  return (
    <PageHeader
      title={$t({ defaultMessage: 'WiFi' })}
      footer={<UsersTabs />}
    />
  )
}

export default UsersPageHeader