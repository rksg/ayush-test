import userEvent     from '@testing-library/user-event'
import { cloneDeep } from 'lodash'
import moment        from 'moment'
import { rest }      from 'msw'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import { firmwareApi }  from '@acx-ui/rc/services'
import {
  EdgeCompatibilityFixtures,
  EdgeFirmwareFixtures,
  FirmwareUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider, store }                             from '@acx-ui/store'
import { mockServer, render, screen, waitFor, within } from '@acx-ui/test-utils'

import { EdgeCompatibilityDetailTable } from '.'

const { mockEdgeCompatibilitiesVenue } = EdgeCompatibilityFixtures
const TEST_VERSION = '2.1.0.600'
const NEXT_TEST_VERSION = '2.1.0.700'
const mockAvailableVersions = cloneDeep(EdgeFirmwareFixtures.mockAvailableVersions).slice(0, 2)
mockAvailableVersions[0].id = TEST_VERSION
mockAvailableVersions[0].name = TEST_VERSION
mockAvailableVersions[1].id = NEXT_TEST_VERSION
mockAvailableVersions[1].name = NEXT_TEST_VERSION

const mockedVenueFirmwareList = cloneDeep(EdgeFirmwareFixtures.mockedVenueFirmwareList)
mockedVenueFirmwareList[0].id = 'mock_venue_id'
mockedVenueFirmwareList[0].versions[0].id = TEST_VERSION
mockedVenueFirmwareList[0].versions[0].name = TEST_VERSION

jest.spyOn(Date, 'now').mockImplementation(() => {
  return new Date('2023-01-20T12:33:37.101+00:00').getTime()
})

const mockedUpdateNow = jest.fn()
const mockedUpdateSchedule = jest.fn()
const mockData = mockEdgeCompatibilitiesVenue.compatibilities?.[0].incompatibleFeatures!

describe('EdgeCompatibilityDetailTable', () => {
  let params: { tenantId: string }
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)

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
          data={mockData}
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
          data={mockData}
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
          data={mockData}
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
      { name: '2.1.0.700 (Release - Recommended) - 02/23/2023' }
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
      version: '2.1.0.700'
    }))
    await waitFor(() => expect(submitBtn).not.toBeVisible())
  })

  it('should not have action button when available version is lower', async () => {
    const mockAvailableVersionsReq = jest.fn()
    const tt = EdgeFirmwareFixtures.mockedVenueFirmwareList
    mockServer.use(
      rest.post(
        FirmwareUrlsInfo.getVenueEdgeFirmwareList.url,
        (_req, res, ctx) => res(ctx.json(tt))),
      rest.get(
        FirmwareUrlsInfo.getAvailableEdgeFirmwareVersions.url,
        (_req, res, ctx) => {
          mockAvailableVersionsReq()
          return res(ctx.json(EdgeFirmwareFixtures.mockAvailableVersions))
        }
      )
    )

    render(
      <Provider>
        <EdgeCompatibilityDetailTable
          data={mockData}
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
    expect(mockAvailableVersionsReq).toBeCalledTimes(2)
    expect(screen.queryByRole('button', { name: 'Schedule Version Update' })).toBeNull()
  })

  it('should not have incompatible count when requirementOnly', async () => {
    render(
      <Provider>
        <EdgeCompatibilityDetailTable
          data={mockData}
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

  describe('Edge venue firmware list with batch operation', () => {
    const mockedUpdateNowBatchOperation = jest.fn()
    const mockedUpdateScheduleBatchOperation = jest.fn()

    beforeEach(async () => {
      jest.mocked(useIsSplitOn).mockReturnValue(true)

      mockServer.use(
        rest.post(
          FirmwareUrlsInfo.startEdgeFirmwareBatchOperation.url,
          (_req, res, ctx) => res(ctx.json({
            requestId: 'requseId', response: { batchId: 'batchId' }
          }))
        ),
        rest.patch(
          FirmwareUrlsInfo.startEdgeFirmwareVenueUpdateNow.url,
          (req, res, ctx) => {
            mockedUpdateNowBatchOperation(req.params, req.body)
            return res(ctx.status(202))
          }
        ),
        rest.post(
          FirmwareUrlsInfo.updateEdgeFirmwareVenueSchedule.url,
          (req, res, ctx) => {
            mockedUpdateScheduleBatchOperation(req.params, req.body)
            return res(ctx.status(202))
          }
        )
      )
    })

    it('should be able to do update now', async () => {
      render(
        <Provider>
          <EdgeCompatibilityDetailTable
            data={mockData}
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
      await waitFor(() => expect(mockedUpdateNowBatchOperation).toBeCalledWith(
        { venueId: 'mock_venue_id', batchId: 'batchId' }, {
          state: 'UPDATE_NOW',
          version: '2.1.0.600'
        }
      ))
      await waitFor(() => expect(submitBtn).not.toBeVisible())
    })

    it('should be able to do change update schedule', async () => {
      render(
        <Provider>
          <EdgeCompatibilityDetailTable
            data={mockData}
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
        { name: '2.1.0.700 (Release - Recommended) - 02/23/2023' }
      ))
      await userEvent.click(screen.getByPlaceholderText('Select date'))
      const cell = await screen.findByRole('cell', { name: new RegExp(nowDateStr) })
      await userEvent.click(within(cell).getByText(new RegExp(nowDayStr)))
      await userEvent.click(await screen.findByRole('radio', { name: /12 am \- 02 am/i }))
      const submitBtn = await screen.findByRole('button', { name: 'Save' })
      await userEvent.click(submitBtn)
      await waitFor(() => expect(mockedUpdateScheduleBatchOperation).toBeCalledWith(
        { venueId: 'mock_venue_id', batchId: 'batchId' }, {
          date: '2023-01-22',
          time: '00:00-02:00',
          version: '2.1.0.700'
        }
      ))
      await waitFor(() => expect(submitBtn).not.toBeVisible())
    })
  })
})

const basicCheck= async () => {
  const rows = await screen.findAllByRole('row')
  return rows
}