import { message } from 'antd'

import { act, fireEvent, render, screen, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { CountdownNode, onActivityMessageReceived, showTxToast, showActivityToast, TxStatus } from './toastService'

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
  linkTemplate: '/t/@@tenantId/networks/wireless/@@entityId/network-details/overview',
  linkData: [
    { name: 'linkAlias', value: 'Download' },
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

describe('Toast Service: showActivityToast', () => {
  afterEach((done) => {
    const toast = screen.queryByRole('img')
    if (toast) {
      waitForElementToBeRemoved(toast).then(done)
      message.destroy()
    } else {
      done()
    }
  })

  it('renders onActivityMessageReceived successful content', async () => {
    act(() => {
      onActivityMessageReceived(tx, ['AddNetworkDeep'], ()=>{ showActivityToast(tx) })
    })
    /* eslint-disable max-len */
    await screen.findByText('Network "open-network" was added by FisrtName 1094 LastName 1094 (dog1094@email.com)')
    const link = await screen.findByText('Download')
    fireEvent.click(link)
  })

  it('renders onActivityMessageReceived failed content', async () => {
    const failedTx = {
      ...tx,
      status: TxStatus.FAIL,
      descriptionTemplate: 'Network "@@networkName" was not added',
      error: '{"errors":[{"code":"xxx-xxxxx","message":"Operation: ADD, Type: Network, Id: xxx, Err: xxxxxx"}],"requestId":"xxxxxxx"}'
    }
    act(() => {
      onActivityMessageReceived(failedTx, ['AddNetworkDeep'], ()=>{ showActivityToast(failedTx) })
    })
    await screen.findByText('Network "open-network" was not added')
    fireEvent.click(await screen.findByRole('button', { name: 'Technical Details' }))
    await screen.findByRole('dialog')
    await screen.findByText(/The following information was reported for the error you encountered/)
  })

  it('test skip toast', async () => {
    const failedTx = {
      ...tx,
      status: TxStatus.FAIL,
      useCase: 'ImportApsCsv',
      descriptionTemplate: 'APs were not imported',
      steps: [{
        endDatetime: '2023-12-14 05:06:16 +0000',
        id: 'PostProcessedImportAps',
        message: 'Post Processed Import APs',
        progressType: 'REQUEST',
        startDatetime: '2023-12-14 05:06:15 +0000',
        status: TxStatus.SUCCESS
      },
      {
        endDatetime: '2023-12-14 05:06:16 +0000',
        id: 'ImportAps',
        message: 'Import APs',
        progressType: 'REQUEST',
        startDatetime: '2023-12-14 05:06:15 +0000',
        status: TxStatus.FAIL
      }
      ] }
    act(() => {
      onActivityMessageReceived(failedTx, ['ImportApsCsv'], ()=>{ showActivityToast(failedTx) })
    })

    await waitFor(()=>{
      expect(screen.queryByText('APs were not imported')).toBeNull()
    })
  })
})
