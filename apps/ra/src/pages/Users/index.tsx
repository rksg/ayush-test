import { defineMessage, useIntl } from 'react-intl'

import { useGetUsersQuery }   from '@acx-ui/analytics/services'
import { Loader, PageHeader } from '@acx-ui/components'

import { UsersTable } from './Table'

const title = defineMessage({
  defaultMessage: '{usersCount, plural, one {User} other {Users}}'
})

export default function Users () {
  const { $t } = useIntl()
  const usersQuery = useGetUsersQuery()
  const usersCount = usersQuery.data?.length || 0
  return <Loader states={[usersQuery]}>
    <PageHeader
      title={<>{$t(title,{ usersCount })} ({usersCount})</>}
    />
    <UsersTable data={usersQuery.data} />
  </Loader>
}
