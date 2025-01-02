import type { DisplayUser }        from '@acx-ui/analytics/services'
import type { ManagedUser, Roles } from '@acx-ui/analytics/utils'

export const mockManagedUsers: ManagedUser[] = [
  {
    id: '1',
    firstName: 'firstName dog1',
    lastName: 'lastName dog1',
    email: 'dog1@ruckuswireless.com.uat',
    accountId: '12345',
    accountName: 'RUCKUS NETWORKS, INC',
    role: 'admin' as Roles,
    tenantId: '0015000000GlI7SAAV',
    resourceGroupId: '087b6de8-953f-405e-b2c2-000000000000',
    resourceGroupName: 'default',
    updatedAt: '2023-09-22T07:31:11.844Z',
    type: null,
    invitation: null,
    isSupport: false
  },
  {
    id: '0032h00000LUqTmAAL',
    firstName: 'FisrtName 1062',
    lastName: 'LastName 1062',
    email: 'dog1062@email.com',
    accountId: '0012h00000NrlBdAAJ',
    accountName: 'Dog Company 1062',
    role: 'network-admin' as Roles,
    tenantId: '0015000000GlI7SAAV',
    resourceGroupId: '1aac20e7-c7db-4bab-a9d4-28b26995c691',
    resourceGroupName: 'bugbash-12',
    type: 'tenant',
    invitation: {
      state: 'accepted',
      inviterUser: {
        firstName: 'userFirst',
        lastName: 'userSecond'
      }
    },
    isSupport: true
  },
  {
    id: '0032h00000LUqYCAA1',
    firstName: 'FisrtName 12',
    lastName: 'LastName 12',
    email: 'dog12@email.com',
    accountId: '0012h00000NrlKrAAJ',
    accountName: 'Dog Company 12',
    role: 'report-only' as Roles,
    tenantId: '0015000000GlI7SAAV',
    resourceGroupId: '087b6de8-953f-405e-b2c2-000000000000',
    resourceGroupName: 'default',
    type: 'super-tenant',
    invitation: {
      state: 'pending',
      inviterUser: {
        firstName: 'userThird',
        lastName: 'userFourth'
      }
    },
    isSupport: false
  },
  {
    id: 'rejected user',
    firstName: 'FisrtName rej',
    lastName: 'LastName rej',
    email: 'dog12@email.com',
    accountId: '0012h00000NrlKrAAJ',
    accountName: 'Dog Company 12',
    role: 'report-only' as Roles,
    tenantId: '0015000000GlI7SAAV',
    resourceGroupId: '087b6de8-953f-405e-b2c2-000000000000',
    resourceGroupName: 'default',
    type: 'super-tenant',
    invitation: {
      state: 'rejected',
      inviterUser: {
        firstName: 'userRej',
        lastName: 'userRej'
      }
    },
    isSupport: false
  },
  {
    id: '111',
    firstName: 'firstName dog111',
    lastName: 'lastName dog111',
    email: 'dog111@ruckuswireless.com.uat',
    accountId: '0015000000GlI7SAAV',
    accountName: 'RUCKUS NETWORKS, INC',
    role: 'admin' as Roles,
    tenantId: '0015000000GlI7SAAV',
    resourceGroupId: '087b6de8-953f-405e-b2c2-000000000000',
    resourceGroupName: 'default',
    updatedAt: '2023-09-22T07:31:11.844Z',
    type: null,
    invitation: null,
    isSupport: false
  }
]

const mockPartialDisplayUsers: Partial<DisplayUser>[] = [
  {
    displayType: 'Internal',
    displayInvitationState: '--',
    displayInvitor: '--'
  },
  {
    displayType: '3rd Party',
    displayInvitationState: 'Accepted',
    displayInvitor: 'userFirst userSecond'
  },
  {
    displayType: 'Brand 360',
    displayInvitationState: 'Pending',
    displayInvitor: 'userThird userFourth'
  },
  {
    displayType: 'Brand 360',
    displayInvitationState: 'Rejected',
    displayInvitor: 'userRej userRej'
  },
  {
    displayType: 'Internal',
    displayInvitationState: '--',
    displayInvitor: '--'
  }
]

export const mockDisplayUsers = mockManagedUsers.map((user, i) => ({
  ...user,
  ...mockPartialDisplayUsers[i]
})) as DisplayUser[]
