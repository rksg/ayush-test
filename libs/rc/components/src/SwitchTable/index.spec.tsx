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
  within,
  findTBody,
  fireEvent
} from '@acx-ui/test-utils'

import { SwitchTable } from '.'

const switchList = {
  totalCount: 2,
  page: 1,
  data: [
    { id: 'FEK4224R19X',
      model: 'ICX7150-C12P',
      serialNumber: 'FEK4224R19X',
      activeSerial: 'FEK4224R19X',
      deviceStatus: 'PREPROVISIONED',
      switchMac: 'C0:C5:20:82:CF:6C',
      isStack: false,
      name: 'FEK4224R19X',
      venueId: 'eb4ef94ba7014f64b69be926faccbc09',
      venueName: 'test',
      configReady: false,
      syncDataEndTime: '',
      cliApplied: false,
      formStacking: true,
      suspendingDeployTime: '' },
    {
      id: 'FMF2249Q0JT',
      model: 'ICX7150-C08P',
      serialNumber: 'FMF2249Q0JT',
      activeSerial: 'FMF2249Q0JT',
      deviceStatus: 'PREPROVISIONED',
      switchMac: '',
      isStack: false,
      name: 'FMF2249Q0JT',
      venueId: '5c05180d54d84e609a4d653a3a8332d1',
      venueName: 'My-Venue',
      configReady: false,
      syncDataEndTime: '',
      cliApplied: false,
      formStacking: false,
      suspendingDeployTime: ''
    }
  ]
}

const stackMemberList = {
  totalCount: 2,
  page: 1,
  data: [
    {
      venueName: 'test',
      serialNumber: 'FEK4224R19X',
      operStatusFound: false,
      switchMac: '',
      model: 'ICX7150-C12P',
      activeSerial: 'FEK4224R19X',
      id: 'FEK4224R19X',
      uptime: '',
      order: '1'
    },
    {
      venueName: 'test',
      serialNumber: 'stack-member',
      operStatusFound: false,
      switchMac: '',
      activeSerial: 'FEK4224R18X',
      id: 'FEK4224R18X',
      uptime: '',
      order: '2'
    }
  ]
}

describe('SwitchTable', () => {
  afterEach(() => jest.restoreAllMocks())

  beforeEach(() => {
    mockServer.use(
      rest.post(
        SwitchUrlsInfo.getSwitchList.url,
        (req, res, ctx) => res(ctx.json(switchList))
      ),
      rest.post(
        SwitchUrlsInfo.getMemberList.url,
        (req, res, ctx) => res(ctx.json(stackMemberList))
      )
    )
  })

  it('should render correctly', async () => {

    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    render(<Provider><SwitchTable showAllColumns={true} searchable={true}/></Provider>, {
      route: { params, path: '/:tenantId' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = (await screen.findByRole('table')).querySelector('tbody')!
    expect(tbody).toBeVisible()
    const rows = await within(tbody).findAllByRole('row')
    expect(rows).toHaveLength(switchList.data.length)

    for (const [index, item] of Object.entries(switchList.data)) {
      expect(await within(rows[Number(index)]).findByText(item.model)).toBeVisible()
    }

    const row1 = await screen.findByRole('row', { name: /FEK4224R19X/i })
    await userEvent.click(await within(row1).findByRole('button'))
    expect(await within(tbody).findByText('stack-member')).toBeVisible()
    // expect(await screen.findAllByTestId(/^options-selector/)).toHaveLength(3)
  })

  it('Table action bar Delete', async () => {
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    render(<Provider><SwitchTable/></Provider>, {
      route: { params, path: '/:tenantId' }
    })

    const deleteSpy = jest.fn()
    deleteSpy.mockReturnValueOnce(true)

    mockServer.use(
      rest.delete(
        SwitchUrlsInfo.deleteSwitches.url,
        (req, res, ctx) => deleteSpy() && res(ctx.json({ requestId: '456' }))
      )
    )

    const row1 = await screen.findByRole('row', { name: /FEK4224R19X/i }) // select ap 1: operational
    await userEvent.click(row1)

    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))

    const dialog = await screen.findByRole('dialog')
    await userEvent.click(await within(dialog).findByRole('button', { name: 'Cancel' }))

    await waitFor(async () => expect(dialog).not.toBeVisible())

    await userEvent.click(row1) // unselect ap 1
    expect(await within(row1).findByRole('checkbox')).not.toBeChecked()

    const row2 = await screen.findByRole('row', { name: /FMF2249Q0JT/i })
    await userEvent.click(row2) // select ap 2: DisconnectedFromCloud

    const tbody = await findTBody()
    const rows = await within(tbody).findAllByRole('checkbox', { checked: true })
    expect(rows).toHaveLength(1)

    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))
    const dialog2 = await screen.findByRole('dialog')
    await userEvent.click(await within(dialog2).findByRole('button', { name: 'Delete Switch' }))

    expect(deleteSpy).toHaveBeenCalled()

  }, 60000)

  it('should search correctly', async () => {
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    render(<Provider><SwitchTable showAllColumns={true} searchable={true}/></Provider>, {
      route: { params, path: '/:tenantId' }
    })

    const input =
      await screen.findByPlaceholderText('Search Switch, Model, MAC Address, IP Address')

    input.focus()
    fireEvent.change(input, { target: { value: 'ICX7150-C08P' } })

    expect(await screen.findByText('ICX7150-C08P')).toBeVisible()
  })
})
