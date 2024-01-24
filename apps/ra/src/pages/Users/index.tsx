import { useState } from 'react'

import { defineMessage, useIntl } from 'react-intl'

import { useGetTenantSettingsQuery, useGetUsersQuery } from '@acx-ui/analytics/services'
import type { Settings }                               from '@acx-ui/analytics/utils'
import { Button, Loader, PageHeader, Tooltip }         from '@acx-ui/components'

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

const isValidSSO = (settings: Partial<Settings> | undefined) => {
  if (!settings || !settings.sso) return false
  try {
    const ssoConfig = JSON.parse(settings.sso)
    return Boolean(ssoConfig?.metadata)
  } catch (e) {
    return false
  }
}

export default function Users () {
  const { $t } = useIntl()
  const usersQuery = useGetUsersQuery()
  const usersCount = usersQuery.data?.length || 0
  const [visible, setVisible] = useState(false)
  const settingsQuery = useGetTenantSettingsQuery()
  const isEditMode = isValidSSO(settingsQuery.data)
  return <Loader states={[usersQuery, settingsQuery]}>
    <PageHeader
      title={<>
        {$t(title,{ usersCount })} ({usersCount})
        <Tooltip.Info
          data-html
          title={$t(info, { br: <br/> })} />
      </>}
      extra={[
        <Loader states={[settingsQuery]}><Tooltip
          title={$t(ssoDisclaimer)}
          placement='left'>
          <Button
            type={isEditMode ? 'primary' : 'default'}
            onClick={() => setVisible(true)}>
            {isEditMode
              ? $t({ defaultMessage: 'Update SSO' })
              : $t({ defaultMessage: 'Setup SSO' })}
          </Button>
        </Tooltip></Loader>]}
    />
    <UsersTable data={usersQuery.data} />
    {visible && <ImportSSOFileDrawer
      title={isEditMode
        ? $t({ defaultMessage: 'Update SSO with 3rd Party Provider' })
        : $t({ defaultMessage: 'Set Up SSO with 3rd Party Provider' })}
      visible={visible}
      isEditMode={isEditMode}
      setVisible={setVisible}
      maxSize={CsvSize['5MB']}
    />}
  </Loader>
}
