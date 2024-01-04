// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { Transaction, TxStatus } from '@acx-ui/rc/utils'

export const mockdata: Transaction = {
  requestId: '41fe99be-764d-455f-9df6-e27a40fe73d0',
  tenantId: 'fc47323e64bc4f69aceee96df92bf68f',
  admin: {
    name: 'FisrtName 1094 LastName 1094',
    email: 'dog1094@email.com'
  },
  product: 'WIFI',
  status: TxStatus.SUCCESS,
  descriptionTemplate: 'Network "@@networkName" was added',
  descriptionData: [
    {
      name: 'count',
      value: '1'
    },
    {
      name: 'networkName',
      value: '001'
    },
    {
      name: 'networkName',
      value: '001'
    },
    {
      name: 'admin-name',
      value: 'FisrtName 1094 LastName 1094'
    },
    {
      name: 'ssid',
      value: '001'
    }
  ],
  steps: [
    {
      id: 'AddNetworkDeep',
      status: TxStatus.SUCCESS,
      progressType: 'REQUEST',
      message: 'AddNetworkDeep',
      startDatetime: '2022-04-18 10:44:44 +0000',
      endDatetime: '2022-04-18 10:44:45 +0000'
    }
  ],
  notifications: [
    {
      type: 'EMAIL'
    }
  ],
  startDatetime: '2022-04-18 10:44:44 +0000',
  endDatetime: '2022-04-18 10:44:45 +0000',
  useCase: 'AddNetworkDeep',
  linkTemplate: '/t/@@tenantId/networks/@@entityId/network-details/overview',
  linkData: [
    {
      name: 'tenantId',
      value: 'fc47323e64bc4f69aceee96df92bf68f'
    },
    {
      name: 'entityId',
      value: '86f53d78e2924bdeafb855fba57efd4b'
    },
    {
      name: 'serialNumber',
      value: '86f53d78e2924bdeafb855fba57efd4b'
    }
  ]
}
