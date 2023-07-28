/* eslint-disable max-len */
import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { SwitchUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within
} from '@acx-ui/test-utils'

import { SwitchDetailsContext } from '../..'

import { SwitchConfigBackupTable } from '.'

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  handleBlobDownloadFile: jest.fn()
}))

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  CodeMirrorWidget: () => <div data-testid='CodeMirrorWidget' />
}))

const list = {
  data: [
    {
      id: '93999bfb05d34a438ff5ff40b8648967',
      createdDate: '2023-01-11T10:12:48.880+00:00',
      name: 'Manual_20230111181247',
      backupType: 'MANUAL',
      backupName: 'c0:c5:20:aa:32:79-1673431968878',
      status: 'SUCCESS',
      config: 'ver 09.0.10eT213\n!\nstack unit 1',
      switchId: 'c0:c5:20:aa:32:79'
    },
    {
      id: 'f89fee4468d2405cbfc7fb012d0632c8',
      createdDate: '2023-01-10T05:00:00.408+00:00',
      name: 'SCHEDULED_1',
      backupType: 'SCHEDULED',
      backupName: 'c0:c5:20:aa:32:79-1673326800403',
      status: 'SUCCESS',
      restoreStatus: 'SUCCESS',
      config: 'ver 09.0.10eT213\n!\nstack unit 2',
      switchId: 'c0:c5:20:aa:32:79'
    }
  ],
  page: 1,
  totalCount: 2,
  totalPages: 1
}

const params = {
  tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
  switchId: 'switchId',
  serialNumber: 'serialNumber',
  activeTab: 'configuration',
  activeSubTab: 'backup'
}

describe('SwitchConfigBackupTable', () => {
  afterEach(() => jest.restoreAllMocks())

  beforeEach(() => {
    mockServer.use(
      rest.get(
        SwitchUrlsInfo.downloadSwitchConfig.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        SwitchUrlsInfo.addBackup.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.put(
        SwitchUrlsInfo.restoreBackup.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.delete(
        SwitchUrlsInfo.deleteBackups.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        SwitchUrlsInfo.getSwitchConfigBackupList.url,
        (req, res, ctx) => res(ctx.json(list))
      )
    )
  })

  it('should render correctly: Backup, Restore, Download and Delete', async () => {
    render(<Provider>
      <SwitchDetailsContext.Provider value={{
        switchDetailsContextData: {
          currentSwitchOperational: true,
          switchName: 'FEK3224R0AG'
        },
        setSwitchDetailsContextData: jest.fn()
      }}>
        <SwitchConfigBackupTable />
      </SwitchDetailsContext.Provider>
    </Provider>, {
      route: { params, path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab/:activeSubTab' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = (await screen.findByRole('table')).querySelector('tbody')!
    expect(tbody).toBeVisible()
    const rows = await within(tbody).findAllByRole('row')
    expect(rows).toHaveLength(list.totalCount)

    await userEvent.click(await screen.findByText(/Backup Now/i))
    const backupDialog = await screen.findByRole('dialog')
    await userEvent.click(await within(backupDialog).findByRole('button', { name: 'Create' }))
    await waitFor(async () => expect(backupDialog).not.toBeVisible())

    const row1 = await screen.findByRole('row', { name: /Manual_20230111181247/i })
    await userEvent.click(row1)

    await userEvent.click(await screen.findByRole('button', { name: 'Download' }))

    await userEvent.click(await screen.findByRole('button', { name: 'Restore' }))
    const restoreDialog = await screen.findByRole('dialog')
    await userEvent.click(await within(restoreDialog).findByRole('button', { name: 'Restore' }))
    await waitFor(async () => expect(restoreDialog).not.toBeVisible())

    const row2 = await screen.findByRole('row', { name: /SCHEDULED_1/i })
    await userEvent.click(row1)
    await userEvent.click(row2)

    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))
    const deleteDialog = await screen.findByRole('dialog')
    await userEvent.click(await within(deleteDialog).findByRole('button', { name: 'Delete' }))
    await waitFor(async () => expect(deleteDialog).not.toBeVisible())
  })

  it('should render correctly: View Backup and actions: Download', async () => {
    render(<Provider>
      <SwitchDetailsContext.Provider value={{
        switchDetailsContextData: {
          currentSwitchOperational: true,
          switchName: 'FEK3224R0AG'
        },
        setSwitchDetailsContextData: jest.fn()
      }}>
        <SwitchConfigBackupTable />
      </SwitchDetailsContext.Provider>
    </Provider>, {
      route: { params, path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab/:activeSubTab' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = (await screen.findByRole('table')).querySelector('tbody')!
    expect(tbody).toBeVisible()
    const rows = await within(tbody).findAllByRole('row')
    expect(rows).toHaveLength(list.totalCount)

    const row1 = await screen.findByRole('row', { name: /Manual_20230111181247/i })
    await userEvent.click(row1)

    await userEvent.click(await screen.findByRole('button', { name: 'View' }))

    const viewDialog = await screen.findByRole('dialog')
    await userEvent.click(await screen.findByText('Actions'))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Download' }))

    await userEvent.click(await within(viewDialog).findByTestId('CloseSymbol'))
    await waitFor(async () => expect(viewDialog).not.toBeVisible())
  })

  it('should render correctly: View Backup and actions: Compare', async () => {

    render(<Provider>
      <SwitchDetailsContext.Provider value={{
        switchDetailsContextData: {
          currentSwitchOperational: true,
          switchName: 'FEK3224R0AG'
        },
        setSwitchDetailsContextData: jest.fn()
      }}>
        <SwitchConfigBackupTable />
      </SwitchDetailsContext.Provider>
    </Provider>, {
      route: { params, path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab/:activeSubTab' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = (await screen.findByRole('table')).querySelector('tbody')!
    expect(tbody).toBeVisible()
    const rows = await within(tbody).findAllByRole('row')
    expect(rows).toHaveLength(list.totalCount)

    const row1 = await screen.findByRole('row', { name: /Manual_20230111181247/i })
    await userEvent.click(row1)

    await userEvent.click(await screen.findByRole('button', { name: 'View' }))

    await userEvent.click(await screen.findByText('Actions'))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Compare' }))
    expect(screen.getByText('Compare Configurations')).toBeVisible()
    const configSelect = await screen.findAllByRole('combobox', { name: /Configuration Name/i })
    await userEvent.click(configSelect[0])
    await userEvent.click((await screen.findByTitle(/SCHEDULED_1/i)))
    const compareDialog = await screen.findByRole('dialog')
    await userEvent.click(await within(compareDialog).findByTestId('CloseSymbol'))
    await waitFor(async () => expect(compareDialog).not.toBeVisible())
  })

  it('should render correctly: View Backup and actions: Restore', async () => {

    render(<Provider>
      <SwitchDetailsContext.Provider value={{
        switchDetailsContextData: {
          currentSwitchOperational: true,
          switchName: 'FEK3224R0AG'
        },
        setSwitchDetailsContextData: jest.fn()
      }}>
        <SwitchConfigBackupTable />
      </SwitchDetailsContext.Provider>
    </Provider>, {
      route: { params, path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab/:activeSubTab' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = (await screen.findByRole('table')).querySelector('tbody')!
    expect(tbody).toBeVisible()
    const rows = await within(tbody).findAllByRole('row')
    expect(rows).toHaveLength(list.totalCount)

    const row1 = await screen.findByRole('row', { name: /Manual_20230111181247/i })
    await userEvent.click(row1)

    await userEvent.click(await screen.findByRole('button', { name: 'View' }))

    await userEvent.click(await screen.findByText('Actions'))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Restore' }))
    const restoreDialog = await screen.findByRole('dialog')
    await userEvent.click(await within(restoreDialog).findByText('Cancel'))
    await waitFor(async () => expect(restoreDialog).not.toBeVisible())

  })

  it('should render correctly: View Backup and actions: Delete', async () => {

    render(<Provider>
      <SwitchDetailsContext.Provider value={{
        switchDetailsContextData: {
          currentSwitchOperational: true,
          switchName: 'FEK3224R0AG'
        },
        setSwitchDetailsContextData: jest.fn()
      }}>
        <SwitchConfigBackupTable />
      </SwitchDetailsContext.Provider>
    </Provider>, {
      route: { params, path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab/:activeSubTab' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = (await screen.findByRole('table')).querySelector('tbody')!
    expect(tbody).toBeVisible()
    const rows = await within(tbody).findAllByRole('row')
    expect(rows).toHaveLength(list.totalCount)

    const row1 = await screen.findByRole('row', { name: /Manual_20230111181247/i })
    await userEvent.click(row1)

    await userEvent.click(await screen.findByRole('button', { name: 'View' }))

    await userEvent.click(await screen.findByText('Actions'))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Delete' }))
    const dialog = await screen.findByRole('dialog')
    await userEvent.click(await within(dialog).findByText('Cancel'))
    await waitFor(async () => expect(dialog).not.toBeVisible())
  })

  it('should render inRestoreProgress correctly', async () => {
    const inRestoreProgressList = JSON.parse(JSON.stringify(list))
    inRestoreProgressList.data.push({
      id: 'f89fee4468d2405cbfc7fb012d0632c9',
      createdDate: '2023-01-10T05:00:00.408+00:00',
      name: 'testBackup',
      backupType: 'SCHEDULED',
      backupName: 'c0:c5:20:aa:32:79-1673326800403',
      status: 'SUCCESS',
      restoreStatus: 'SUCCESS',
      config: 'ver 09.0.10eT213\n!\nstack unit 2',
      switchId: 'c0:c5:20:aa:32:79'
    })
    inRestoreProgressList.data[0].restoreStatus = 'STARTED'
    mockServer.use(
      rest.post(
        SwitchUrlsInfo.getSwitchConfigBackupList.url,
        (req, res, ctx) => res(ctx.json(inRestoreProgressList))
      )
    )
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeTab: 'configuration',
      activeSubTab: 'backup'
    }

    render(<Provider>
      <SwitchDetailsContext.Provider value={{
        switchDetailsContextData: {
          currentSwitchOperational: false,
          switchName: 'FEK3224R0AG'
        },
        setSwitchDetailsContextData: jest.fn()
      }}>
        <SwitchConfigBackupTable />
      </SwitchDetailsContext.Provider>
    </Provider>, {
      route: { params, path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab/:activeSubTab' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = (await screen.findByRole('table')).querySelector('tbody')!
    expect(tbody).toBeVisible()
    const rows = await within(tbody).findAllByRole('row')
    expect(rows).toHaveLength(inRestoreProgressList.data.length)

    const row1 = await screen.findByRole('row', { name: /Manual_20230111181247/i })
    await userEvent.click(within(row1).getByRole('checkbox'))

    const row2 = await screen.findByRole('row', { name: /SCHEDULED_1/i })
    await userEvent.click(within(row2).getByRole('checkbox'))

    const row3 = await screen.findByRole('row', { name: /testBackup/i })
    await userEvent.click(within(row3).getByRole('checkbox'))
    expect(await screen.findByRole('button', { name: 'Restore' })).toBeDisabled()
  })

})