import { useState } from 'react'

import { defineMessage, useIntl } from 'react-intl'

import { useGetUsersQuery }                    from '@acx-ui/analytics/services'
import { Button, Loader, PageHeader, Tooltip } from '@acx-ui/components'

import { ImportSSOFileDrawer } from './ImportSSOFileDrawer'
import { UsersTable }          from './Table'

const CsvSize = {
  '1MB': 1024*1*1024,
  '2MB': 1024*2*1024,
  '5MB': 1024*5*1024,
  '20MB': 1024*20*1024
}

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

const ssoDisclaimer = defineMessage({
  defaultMessage: 'At this time, only Azure AD is officially supported'
})

export default function Users () {
  const { $t } = useIntl()
  const usersQuery = useGetUsersQuery()
  const usersCount = usersQuery.data?.length || 0
  const [visible, setVisible] = useState(false)
  // TODO: fetch sso from tenantSettings in rbac
  return <Loader states={[usersQuery]}>
    <PageHeader
      title={<>
        {$t(title,{ usersCount })} ({usersCount})
        <Tooltip.Info
          data-html
          title={$t(info, { br: <br/> })} />
      </>}
      extra={[<Tooltip
        title={$t(ssoDisclaimer)}
        placement='left'>
        <Button
          type='default'
          onClick={() => setVisible(true)}>
          {$t({ defaultMessage: 'Setup SSO' })}
        </Button>
      </Tooltip>]}
    />
    <UsersTable data={usersQuery.data} />
    {visible && <ImportSSOFileDrawer
      title={$t({ defaultMessage: 'Set Up SSO with 3rd Party Provider' })}
      visible={visible}
      setVisible={setVisible}
      maxSize={CsvSize['5MB']}
    />}
  </Loader>
}
