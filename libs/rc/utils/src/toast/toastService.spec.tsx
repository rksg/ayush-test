import { message } from 'antd'

import { act, fireEvent, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { CountdownNode, showActivityMessage, showTxToast, TxStatus } from './toastService'

const tx = { 
  requestId: '6470931c-c9ce-42f4-b9a3-48324f109bd5',
  tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
  admin: { name: 'FisrtName 1094 LastName 1094',email: 'dog1094@email.com' },
  product: 'WIFI',
  status: TxStatus.SUCCESS,
  descriptionTemplate: 'Network "@@networkName" was added by @@adminName (@@adminEmail)',
  descriptionData: [
    { name: 'count',value: '1' },
    { name: 'adminName',value: 'FisrtName 1094 LastName 1094' },
    { name: 'networkName',value: 'open-network' },
    { name: 'networkName',value: 'open-network' },
    { name: 'admin-name',value: 'FisrtName 1094 LastName 1094' },
    { name: 'ssid',value: 'open-network' },
    { name: 'adminEmail',value: 'dog1094@email.com' }
  ],
  steps: [{ 
    id: 'AddNetworkDeep',
    status: TxStatus.SUCCESS,
    progressType: 'REQUEST',
    message: 'AddNetworkDeep',
    startDatetime: '2022-07-04 07:10:46 +0000',
    endDatetime: '2022-07-04 07:10:47 +0000' 
  }],
  notifications: [{ type: 'EMAIL' }],
  startDatetime: '2022-07-04 07:10:46 +0000',
  endDatetime: '2022-07-04 07:10:47 +0000',
  useCase: 'AddNetworkDeep',
  linkTemplate: '/t/@@tenantId/networks/@@entityId/network-details/overview',
  linkData: [
    { name: 'tenantId',value: 'ecc2d7cf9d2342fdb31ae0e24958fcac' },
    { name: 'entityId',value: '65f6a2f6ec5843be9d9b5b3255a26b04' },
    { name: 'serialNumber',value: '65f6a2f6ec5843be9d9b5b3255a26b04' 
    }] 
}
describe('Toast Service: basic', () => {
  it('should render CountdownNode correctly', async () => {
    const { asFragment } = render(<CountdownNode n={20} />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('Invalid transaction status', async () => {
    const invalidTx = {
      ...tx,
      status: TxStatus.IN_PROGRESS
    }
    const error = jest.spyOn(console, 'error').mockImplementation(() => {})
    act(() => {
      showTxToast(invalidTx)
    })
    expect(error).toHaveBeenCalled()
  })
})

describe('Toast Service: showTxToast', () => {
  afterEach((done) => {
    const toast = screen.queryByRole('img')
    if (toast) {
      waitForElementToBeRemoved(toast).then(done)
      message.destroy()
    } else {
      done()
    }
  })

  it('renders showActivityMessage successful content', async () => {
    act(() => {
      showActivityMessage(tx, ['AddNetworkDeep'])
    })
    /* eslint-disable max-len */
    await screen.findByText('Network "open-network" was added by FisrtName 1094 LastName 1094 (dog1094@email.com)')
    const link = await screen.findByText('View')
    fireEvent.click(link)
  })

  it('renders showActivityMessage failed content', async () => {
    const failedTx = {
      ...tx,
      status: TxStatus.FAIL,
      descriptionTemplate: 'Network "@@networkName" was not added'
    }
    act(() => {
      showActivityMessage(failedTx, ['AddNetworkDeep'])
    })
    await screen.findByText('Network "open-network" was not added')
  })

})