import { useState } from 'react'

import {  useIntl } from 'react-intl'

import { useUpdateInvitationMutation }                                           from '@acx-ui/analytics/services'
import { defaultSort, sortProp, Tenant, Invitation, UserProfile }                from '@acx-ui/analytics/utils'
import { LayoutUI as UI, Drawer, Table, TableProps, ColorPill, showActionModal } from '@acx-ui/components'
import { CaretDownSolid, HomeSolid }                                             from '@acx-ui/icons'
import { Link, useTenantLink }                                                   from '@acx-ui/react-router-dom'

import { Invitation as InviteUI } from './styledComponents'

const showResponseModal = (title: string, content: string, isSuccess: boolean) => {
  showActionModal({
    type: isSuccess ? 'info' : 'error',
    title,
    content,
    onOk: () => {
      isSuccess && window.location.reload()
    }
  })
}

const ActionLink = (
  { type, invitation, userId } : { type: string, invitation: Invitation, userId: string }
) => {
  const { $t } = useIntl()
  const [updateInvitation] = useUpdateInvitationMutation()

  return <InviteUI.ActionBtn
    onClick={() => showActionModal({
      type: 'confirm',
      title: $t({ defaultMessage: 'Invitation' }),
      content: type === 'accept'
        ? $t(/* eslint-disable max-len */
          { defaultMessage: 'Do you really want to accept the invitation from {first} {last}, {account}?' },
          { first: invitation.firstName, last: invitation.lastName, account: invitation.accountName }
        )
        : $t(
          { defaultMessage: 'Do you really want to reject the invitation from {first} {last}, {account}?' },
          { first: invitation.firstName, last: invitation.lastName, account: invitation.accountName }
        ),
      /* eslint-disable max-len */
      onOk: async () => {
        await updateInvitation({
          resourceGroupId: invitation.resourceGroupId as string,
          state: type === 'accept' ? 'accepted' : 'rejected',
          userId: userId
        })
          .unwrap()
          .then(() => {
            showResponseModal(
              $t({ defaultMessage: 'Success' }),
              type === 'accept'
                ? $t({ defaultMessage: `Accepted invitation succesfully.
               Page will reload to update the user profile` })
                : $t({ defaultMessage: `Rejected invitation succesfully.
               Page will reload to update the user profile` }),
              true
            )
          })
          .catch(error => {
            showResponseModal(
              $t({ defaultMessage: 'Error' }),
              error.data,
              false
            )
          })
      }
    })
    }
  >{$t({ defaultMessage: '{type}' }, { type })}</InviteUI.ActionBtn>
}

export function AccountsDrawer ({ user }: { user: UserProfile }) {
  const { accountId, selectedTenant, tenants, invitations, userId } = user
  const { $t } = useIntl()
  const brandLink = (invitations as Invitation[])
    .some(invitation => invitation.type === 'super-tenant')
    ? $t(
      { defaultMessage: 'You have pending {invitation}' },
      {
        invitation: <a href='/analytics/profile/tenants' target='_blank'>
          {$t({ defaultMessage: 'brand invitation(s)' })}
        </a>
      })
    : ''
  const varInvitations = (invitations as Invitation[])
    .filter(invitation => invitation.type !== 'super-tenant')
  const roles = {
    'admin': $t({ defaultMessage: 'Admin' }),
    'network-admin': $t({ defaultMessage: 'Network Admin' }),
    'report-only': $t({ defaultMessage: 'Report Only' })
  }
  const [visible, setVisible] = useState(false)
  const basePath = useTenantLink('')
  const columns: TableProps<Tenant>['columns'] = [
    {
      width: 200,
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      key: 'name',
      searchable: true,
      defaultSortOrder: 'ascend',
      sorter: { compare: sortProp('name', defaultSort) },
      render: (_, { name, id }) => <>
        {accountId === id ? <HomeSolid height={16} viewBox='0 -4 24 24' /> : ''}
        <Link
          onClick={() => setVisible(false)}
          to={{ ...basePath, search: `?selectedTenants=${window.btoa(JSON.stringify([id]))}` }}
          children={name}
        />
      </>
    },
    {
      title: $t({ defaultMessage: 'Role' }),
      sorter: { compare: sortProp('role', defaultSort) },
      render: (_, { role }) => roles[role],
      searchable: true,
      dataIndex: 'role',
      key: 'role'
    }
  ]
  return <UI.CompanyNameDropdown>
    <UI.CompanyName onClick={()=>setVisible(!visible)}>{selectedTenant.name}</UI.CompanyName>
    <UI.DropdownCaretIcon
      data-testid='tenant-dropdown'
      onClick={()=>setVisible(!visible)}
      children={<CaretDownSolid />}
    />
    {invitations.length > 0 && <InviteUI.Count
      data-testid='invitation-count'
      onClick={()=>setVisible(!visible)}
      title={$t(
        // eslint-disable-next-line max-len
        { defaultMessage: 'You have {count} {count, plural, one {invitation} other {invitations}}' },
        { count: invitations.length }
      )}
    >
      <ColorPill
        color='var(--acx-accents-orange-50)'
        value={invitations.length as unknown as string}
      />
    </InviteUI.Count>}
    <Drawer
      width={500}
      title={$t({ defaultMessage: 'Accounts' })}
      visible={visible}
      onClose={() => setVisible(false)}
    >
      <InviteUI.Wrapper>
        <InviteUI.Title>{$t({ defaultMessage: 'Invitations' })}</InviteUI.Title>
        { brandLink && <InviteUI.BrandLink>{brandLink}</InviteUI.BrandLink> }
        {varInvitations.map(
          (invitation : Invitation, ind) => <InviteUI.ListItem key={`${invitation.accountName}-${ind}`}>
            {$t({
              defaultMessage: `You have been invited by {first} {last} to {accountName} as {role}.
            Please {accept} or {reject} the invitation`
            }, {
              accountName: <InviteUI.Highlight>{invitation.accountName}</InviteUI.Highlight>,
              first: invitation.firstName,
              last: invitation.lastName,
              role: <InviteUI.Highlight>
                {roles[invitation.role as keyof typeof roles]}
              </InviteUI.Highlight>,
              accept: <ActionLink type='accept' invitation={invitation} userId={userId} />,
              reject: <ActionLink type='reject' invitation={invitation} userId={userId} />
            })}
          </InviteUI.ListItem>
        )}
        {invitations.length === 0 && <InviteUI.ListItem>
          {$t({ defaultMessage: 'No pending invitations' })}
        </InviteUI.ListItem>}
      </InviteUI.Wrapper>
      <Table<Tenant>
        settingsId='rai-tenant-table'
        columns={columns}
        dataSource={tenants}
        rowKey='id'
        rowClassName={({ id }) => selectedTenant.id === id ? 'ant-table-row-selected' : ''}
      />
    </Drawer>
  </UI.CompanyNameDropdown>
}
