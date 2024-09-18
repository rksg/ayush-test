import userEvent     from '@testing-library/user-event'
import { cloneDeep } from 'lodash'
import moment        from 'moment'
import { rest }      from 'msw'

import { firmwareApi } from '@acx-ui/rc/services'
import {
  EdgeCompatibilityFixtures,
  EdgeFirmwareFixtures,
  FirmwareUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider, store }                             from '@acx-ui/store'
import { mockServer, render, screen, waitFor, within } from '@acx-ui/test-utils'

import { EdgeCompatibilityDetailTable } from '.'

const { mockEdgeCompatibilitiesVenue } = EdgeCompatibilityFixtures
const mockAvailableVersions = cloneDeep(EdgeFirmwareFixtures.mockAvailableVersions).slice(0, 1)
mockAvailableVersions.forEach(item => {
  item.id = '2.1.0.600'
  item.name = '2.1.0.600'
})
const mockedVenueFirmwareList = cloneDeep(EdgeFirmwareFixtures.mockedVenueFirmwareList)
mockedVenueFirmwareList[0].id = 'mock_venue_id'

jest.spyOn(Date, 'now').mockImplementation(() => {
  return new Date('2023-01-20T12:33:37.101+00:00').getTime()
})

const mockedUpdateNow = jest.fn()
const mockedUpdateSchedule = jest.fn()
describe('EdgeCompatibilityDetailTable', () => {
  let params: { tenantId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    store.dispatch(firmwareApi.util.resetApiState())

    mockServer.use(
      rest.post(
        FirmwareUrlsInfo.getVenueEdgeFirmwareList.url,
        (_req, res, ctx) => res(ctx.json(mockedVenueFirmwareList))
      ),
      rest.get(
        FirmwareUrlsInfo.getAvailableEdgeFirmwareVersions.url,
        (_req, res, ctx) => res(ctx.json(mockAvailableVersions))
      ),
      rest.patch(
        FirmwareUrlsInfo.updateEdgeFirmware.url,
        (req, res, ctx) => {
          mockedUpdateNow(req.body)
          return res(ctx.status(202))
        }
      ),
      rest.post(
        FirmwareUrlsInfo.updateEdgeVenueSchedules.url,
        (req, res, ctx) => {
          mockedUpdateSchedule(req.body)
          return res(ctx.status(202))
        }
      )
    )
  })

  it('should create table successfully', async () => {
    render(
      <Provider>
        <EdgeCompatibilityDetailTable
          data={mockEdgeCompatibilitiesVenue.compatibilities[0].incompatibleFeatures}
          venueId='mock_venue_id'
        />
      </Provider>
    )

    const rows = await basicCheck()
    expect(rows.length).toBe(3) // including header
    expect(screen.getByRole('columnheader', { name: 'Incompatible RUCKUS Edges' })).toBeVisible()

    const row1 = screen.getByRole('row', { name: /SD-LAN 1 2.1.0.200/i })
    screen.getByRole('row', { name: /Tunnel Profile 2 2.1.0.400/i })
    await userEvent.click(within(row1).getByRole('checkbox'))
    await screen.findByRole('button', { name: 'Update Version Now' })
  })

  it('should be able to do update now', async () => {
    render(
      <Provider>
        <EdgeCompatibilityDetailTable
          data={mockEdgeCompatibilitiesVenue.compatibilities[0].incompatibleFeatures}
          venueId='mock_venue_id'
        />
      </Provider>
    )

    const rows = await basicCheck()
    expect(rows.length).toBe(3) // including header
    expect(screen.getByRole('columnheader', { name: 'Incompatible RUCKUS Edges' })).toBeVisible()

    const row1 = screen.getByRole('row', { name: /SD-LAN 1 2.1.0.200/i })
    screen.getByRole('row', { name: /Tunnel Profile 2 2.1.0.400/i })
    await userEvent.click(within(row1).getByRole('checkbox'))
    await userEvent.click(await screen.findByRole('button', { name: 'Update Version Now' }))
    const submitBtn = await screen.findByRole('button', { name: 'Run Update' })
    await userEvent.click(submitBtn)
    await waitFor(() => expect(mockedUpdateNow).toBeCalledWith({
      state: 'UPDATE_NOW',
      version: '2.1.0.600'
    }))
    await waitFor(() => expect(submitBtn).not.toBeVisible())
  })

  it('should be able to do change update schedule', async () => {
    render(
      <Provider>
        <EdgeCompatibilityDetailTable
          data={mockEdgeCompatibilitiesVenue.compatibilities[0].incompatibleFeatures}
          venueId='mock_venue_id'
        />
      </Provider>
    )

    const rows = await basicCheck()
    expect(rows.length).toBe(3) // including header
    expect(screen.getByRole('columnheader', { name: 'Incompatible RUCKUS Edges' })).toBeVisible()

    const row1 = screen.getByRole('row', { name: /SD-LAN 1 2.1.0.200/i })
    screen.getByRole('row', { name: /Tunnel Profile 2 2.1.0.400/i })
    await userEvent.click(within(row1).getByRole('checkbox'))
    await userEvent.click(await screen.findByRole('button', { name: 'Schedule Version Update' }))

    const nowDateStr = moment().add(2, 'days').format('YYYY-MM-DD')
    const nowDayStr = nowDateStr.split('-')[2]
    await userEvent.click(await screen.findByRole('radio',
      { name: '2.1.0.600 (Release - Recommended) - 02/23/2023' }
    ))
    await userEvent.click(screen.getByPlaceholderText('Select date'))
    const cell = await screen.findByRole('cell', { name: new RegExp(nowDateStr) })
    await userEvent.click(within(cell).getByText(new RegExp(nowDayStr)))
    await userEvent.click(await screen.findByRole('radio', { name: /12 am \- 02 am/i }))
    const submitBtn = await screen.findByRole('button', { name: 'Save' })
    await userEvent.click(submitBtn)
    await waitFor(() => expect(mockedUpdateSchedule).toBeCalledWith({
      date: '2023-01-22',
      time: '00:00-02:00',
      version: '2.1.0.600'
    }))
    await waitFor(() => expect(submitBtn).not.toBeVisible())
  })

  it('should not have action button when available version is lower', async () => {
    mockServer.use(
      rest.post(
        FirmwareUrlsInfo.getVenueEdgeFirmwareList.url,
        (_req, res, ctx) => res(ctx.json(EdgeFirmwareFixtures.mockedVenueFirmwareList))
      ),
      rest.get(
        FirmwareUrlsInfo.getAvailableEdgeFirmwareVersions.url,
        (_req, res, ctx) => res(ctx.json(EdgeFirmwareFixtures.mockAvailableVersions))
      )
    )

    render(
      <Provider>
        <EdgeCompatibilityDetailTable
          data={mockEdgeCompatibilitiesVenue.compatibilities[0].incompatibleFeatures}
          venueId='mock_venue_id'
        />
      </Provider>
    )

    const rows = await basicCheck()
    expect(rows.length).toBe(3) // including header
    expect(screen.getByRole('columnheader', { name: 'Incompatible RUCKUS Edges' })).toBeVisible()

    const row1 = screen.getByRole('row', { name: /SD-LAN 1 2.1.0.200/i })
    screen.getByRole('row', { name: /Tunnel Profile 2 2.1.0.400/i })
    await userEvent.click(within(row1).getByRole('checkbox'))

    expect(screen.queryByRole('button', { name: 'Update Version Now' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Schedule Version Update' })).toBeNull()
  })

  it('should not have incompatible count when requirementOnly', async () => {
    render(
      <Provider>
        <EdgeCompatibilityDetailTable
          data={mockEdgeCompatibilitiesVenue.compatibilities[0].incompatibleFeatures}
          requirementOnly
        />
      </Provider>, {
        route: { params, path: '/:tenantId/services/edgeMvSdLan/list' }
      }
    )

    const rows = await basicCheck()
    expect(rows.length).toBe(3) // including header
    expect(screen.queryByRole('columnheader', { name: 'Incompatible RUCKUS Edges' })).toBeNull()

    screen.getByRole('row', { name: /SD-LAN 2.1.0.200/i })
    screen.getByRole('row', { name: /Tunnel Profile 2.1.0.400/i })
  })
})

const basicCheck= async () => {
  const rows = await screen.findAllByRole('row')
  return rows
}