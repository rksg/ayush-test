import { waitFor, within } from '@testing-library/react'
import userEvent           from '@testing-library/user-event'
import moment              from 'moment-timezone'
import { rest }            from 'msw'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  CommonUrlsInfo,
  ConnectionMeteringUrls,
  Persona,
  PersonaUrls,
  PropertyUrlsInfo,
  SwitchUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider }                                              from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import {
  mockEnabledNoNSGPropertyConfig,
  mockPersonaGroupWithoutNSG,
  mockPropertyUnitList,
  mockConnectionMeteringTableResult,
  mockConnectionMeterings,
  replacePagination,
  mockEnabledNSGPropertyConfig,
  mockPersonaGroupWithNSG
} from '../../__tests__/fixtures'

import { VenuePropertyTab } from './index'


const mockPersona: Persona = {
  id: 'persona-id-1',
  name: 'persona-name-1',
  groupId: 'persona-group-id-1',
  dpskGuid: 'dpsk-guid-1',
  dpskPassphrase: 'dpsk-passphrase',
  identityId: 'unit-id-1',
  revoked: false,
  devices: [
    {
      macAddress: '11:11:11:11:11:11',
      personaId: 'persona-id-1'
    },
    {
      macAddress: '11:11:11:11:11:12',
      personaId: 'persona-id-1'
    },
    {
      macAddress: '11:11:11:11:11:13',
      personaId: 'persona-id-1'
    }
  ],
  ethernetPorts: [
    {
      portIndex: 1,
      macAddress: '11:11:11:11:11:11',
      personaId: 'persona-id-1',
      name: 'port-name-1'
    }
  ],
  switches: [
    {
      personaId: 'persona-id-1',
      macAddress: '11:11:11:11:11:11',
      portId: '1/1/10'
    }
  ],
  meteringProfileId: '6ef51aa0-55da-4dea-9936-c6b7c7b11164',
  expirationDate: moment().add(-8, 'days').toISOString()
}

const tenantId = '15a04f095a8f4a96acaf17e921e8a6df'
const params = { tenantId, venueId: 'f892848466d047798430de7ac234e940' }
const enableNsgParams = { tenantId, venueId: '23edaec8639a42c89ce0a52143c64f15' }
const updateUnitFn = jest.fn()
const getPersonaGroupSpy = jest.fn()
jest.mocked(useIsSplitOn).mockReturnValue(true)
describe('Property Unit Page', () => {
  beforeEach(async () => {
    updateUnitFn.mockClear()
    getPersonaGroupSpy.mockClear()

    mockServer.use(
      rest.get(
        PropertyUrlsInfo.getPropertyConfigs.url,
        (req, res, ctx) => {
          return res(ctx.json(
            req.params.venueId === enableNsgParams.venueId
              ? mockEnabledNSGPropertyConfig
              : mockEnabledNoNSGPropertyConfig)
          )
        }
      ),
      rest.post(
        PropertyUrlsInfo.getPropertyUnitList.url,
        (_, res, ctx) => res(ctx.json(mockPropertyUnitList))
      ),
      rest.get(
        PropertyUrlsInfo.getUnitById.url,
        (_, res, ctx) => res(ctx.json(mockPropertyUnitList.content[0]))
      ),
      rest.get(
        PersonaUrls.getPersonaGroupById.url,
        (req, res, ctx) => {
          getPersonaGroupSpy()
          return res(ctx.json(
            req.params.groupId === 'persona-group-id-noNSG'
              ? mockPersonaGroupWithoutNSG
              : mockPersonaGroupWithNSG)
          )
        }
      ),
      rest.delete(
        PropertyUrlsInfo.deletePropertyUnits.url,
        (_, res, ctx) => res(ctx.json({}))
      ),
      rest.patch(
        PropertyUrlsInfo.updatePropertyUnit.url,
        (_, res, ctx) => {
          updateUnitFn()
          return res(ctx.json({}))
        }
      ),
      rest.get(
        PersonaUrls.getPersonaById.url,
        (_, res, ctx) => res(ctx.json(mockPersona))
      ),
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json({ data: [{ apMac: '11:22:33:44:55:66' }], totalCount: 0 }))
      ),
      rest.post(
        SwitchUrlsInfo.getSwitchList.url,
        (_, res, ctx) =>
          res(ctx.json({
            data: [{ switchMac: '11:11:11:11:11:11', name: 'switchName' }],
            totalCount: 0
          }))
      ),
      rest.get(
        ConnectionMeteringUrls.getConnectionMeteringDetail.url,
        (_, res, ctx) => res(ctx.json(mockConnectionMeterings[0]))
      ),
      rest.get(
        replacePagination(ConnectionMeteringUrls.getConnectionMeteringList.url),
        (_, res, ctx) => res(ctx.json(mockConnectionMeteringTableResult))
      )
    )
  })

  it('show render Unit table', async () => {
    render(<Provider><VenuePropertyTab /></Provider>, {
      route: {
        params,
        path: '/:tenantId/t/venues/:venueId/venue-details/units'
      }
    })

    await waitFor(() => expect(getPersonaGroupSpy).toHaveBeenCalled())

    await waitFor(() => {
      expect(screen.queryByText(/Access Point/i)).toBeNull()
    })

    await waitFor(() => {
      expect(screen.getByText(/unit name/i)).toBeInTheDocument()
    })

    // Open add drawer
    const addUnitBtn = await screen.findByRole('button', { name: /add unit/i })
    await userEvent.click(addUnitBtn)

    const unitDialog = await screen.findByRole('dialog')
    await within(unitDialog).findByText(/add unit/i)
    await userEvent.click(await within(unitDialog).findByRole('button', { name: /cancel/i }))
    expect(screen.queryByRole('dialog')).toBeNull()

    // select one of row and open edit drawer
    const firstRowName = mockPropertyUnitList.content[0].name
    const firstRow = await screen.findByRole('cell', { name: firstRowName })
    await screen.findByRole('link', { name: mockConnectionMeterings[0].name })

    await userEvent.click(firstRow)
    await userEvent.click(await screen.findByRole('button', { name: /edit/i }))
    const editDialog = await screen.findByRole('dialog')
    await within(editDialog).findByText(/edit unit/i)
    await userEvent.click(await within(editDialog).findByRole('button', { name: /cancel/i }))

    // teardown
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('show render Unit table withNsg', async () => {
    render(<Provider><VenuePropertyTab /></Provider>, {
      route: {
        params: enableNsgParams,
        path: '/:tenantId/t/venues/:venueId/venue-details/units'
      }
    })

    const firstRowName = mockPropertyUnitList.content[0].name
    await screen.findByRole('cell', { name: firstRowName })
    await waitFor(async () => await screen.findByRole('cell', { name: /switchName/i }))
    await waitFor(async () => await screen.findByRole('columnheader', { name: /Access Point/i }))
  })

  it('should support Suspend, View Portal, Delete actions', async () => {
    render(<Provider><VenuePropertyTab /></Provider>, {
      route: {
        params,
        path: '/:tenantId/t/venues/:venueId/venue-details/units'
      }
    })

    await waitFor(() => expect(getPersonaGroupSpy).toHaveBeenCalled())

    await waitFor(() => {
      expect(screen.queryByText(/Access Point/i)).toBeNull()
    })

    await waitFor(() => {
      expect(screen.getByText(/unit name/i)).toBeInTheDocument()
    })

    // Find first row
    const firstRowName = mockPropertyUnitList.content[0].name
    const firstRow = await screen.findByRole('cell', { name: firstRowName })

    // TODO: test while API ready and confirm with real behavior, and waitFor
    // 'Suspend' Unit action
    await userEvent.click(firstRow)
    await userEvent.click(await screen.findByRole('button', { name: /suspend/i }))
    const confirmDialog = await screen.findByRole('dialog')
    await userEvent.click(await within(confirmDialog).findByRole('button', { name: /suspend/i }))
    // Wait api processing
    await waitFor(() => expect(updateUnitFn).toHaveBeenCalled())
    await waitFor(async () => await screen.findByRole('textbox'))

    // 'View Portal' Unit action
    await userEvent.click(firstRow)
    await userEvent.click(await screen.findByRole('button', { name: /view portal/i }))

    // 'Delete' Unit action
    await userEvent.click(firstRow)
    await userEvent.click(await screen.findByRole('button', { name: /delete/i }))
    await userEvent.click(await screen.findByRole('button', { name: /delete unit/i }))

    // Make sure clearSelection() be called
    await waitFor(async () => await screen.findByRole('textbox'))
  })

  it('should import from file', async () => {
    const importFn = jest.fn()

    mockServer.use(
      rest.post(
        PropertyUrlsInfo.importPropertyUnits.url,
        (req, res, ctx) => {
          importFn()
          return res(ctx.json({}))
        })
    )

    render(
      <Provider><VenuePropertyTab /></Provider>,
      {
        route: {
          params,
          path: '/:tenantId/t/venues/:venueId/venue-details/units'
        }
      }
    )

    await userEvent.click(await screen.findByRole('button', { name: /Import From File/ }))

    const dialog = await screen.findByRole('dialog')

    const csvFile = new File(
      [''],
      'unit_import_template.csv',
      { type: 'text/csv' }
    )

    // eslint-disable-next-line testing-library/no-node-access
    await userEvent.upload(document.querySelector('input[type=file]')!, csvFile)

    await userEvent.click(await within(dialog).findByRole('button', { name: /Import/ }))

    await waitFor(() => expect(importFn).toHaveBeenCalled())
  })

  it('should export Units to CSV', async () => {
    const exportFn = jest.fn()

    mockServer.use(
      rest.post(
        PropertyUrlsInfo.exportPropertyUnits.url,
        (req, res, ctx) => {
          const headers = req['headers']

          if (headers.get('accept') !== 'text/csv') {
            return res(ctx.json(mockPropertyUnitList))
          } else {
            exportFn()

            return res(ctx.set({
              'content-disposition': 'attachment; filename=Units_20230118100829.csv',
              'content-type': 'text/csv;charset=ISO-8859-1'
            }), ctx.text('Property'))
          }
        }
      )
    )

    render(
      <Provider><VenuePropertyTab /></Provider>,
      {
        route: {
          params,
          path: '/:tenantId/t/venues/:venueId/venue-details/units'
        }
      })

    const exportBtn = await screen.findByTestId('export-unit')
    await userEvent.click(exportBtn)
    await waitFor(() => expect(exportFn).toHaveBeenCalled())
  })
})
