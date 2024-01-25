import { defineMessage, useIntl } from 'react-intl'

import { useGetUsersQuery }            from '@acx-ui/analytics/services'
import { Loader, PageHeader, Tooltip } from '@acx-ui/components'

import { UsersTable } from './Table'

const title = defineMessage({
  defaultMessage: '{usersCount, plural, one {User} other {Users}}'
})

const info = defineMessage({
  defaultMessage: `"Invite 3rd Party" allows you to invite a user who does not
  belong to your organisation into this RUCKUS AI account.
  {br}
  {br}
  "Add Internal User" allows you to include a user who belongs to your
  organisation into this RUCKUS AI account.
  {br}
  {br}
  In all cases, please note that the invitee needs to have an existing
  Ruckus Support account.`
})

export default function Users () {
  const { $t } = useIntl()
  const usersQuery = useGetUsersQuery()
  const usersCount = usersQuery.data?.length || 0
  return <Loader states={[usersQuery]}>
    <PageHeader
      title={<>
        {$t(title,{ usersCount })} ({usersCount})
        <Tooltip.Info
          data-html
          title={$t(info, { br: <br/> })} />
      </>}
    />
    <UsersTable data={usersQuery.data} />
  </Loader>
}
