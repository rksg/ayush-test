import { waitFor, within } from '@testing-library/react'
import userEvent           from '@testing-library/user-event'
import { rest }            from 'msw'

import { useIsSplitOn, useIsTierAllowed }        from '@acx-ui/feature-toggle'
import { ClientUrlsInfo, DpskUrls, PersonaUrls } from '@acx-ui/rc/utils'
import { Provider }                              from '@acx-ui/store'
import { mockServer, render, screen }            from '@acx-ui/test-utils'

import { mockedDpskPassphraseDevices, mockPersona } from '../__tests__/fixtures'

import { PersonaDevicesTable } from './PersonaDevicesTable'

type MockModalProps = React.PropsWithChildren<{
  visible: boolean
  onSubmit: () => void
  onCancel: () => void
}>

jest.mock('../PersonaForm/PersonaDevicesImportDialog', () => ({
  PersonaDevicesImportDialog: ({ onSubmit, onCancel, visible }: MockModalProps) =>
    visible && <div data-testid='PersonaDevicesImportDialog' >
      <button onClick={(e) => {
        e.preventDefault()
        onSubmit()
      }}>Add</button>
      <button onClick={() => onCancel()}>Cancel</button>
    </div>
}))

jest.mocked(useIsSplitOn).mockReturnValue(true)
jest.mocked(useIsTierAllowed).mockReturnValue(true)


describe('PersonaDevicesTable', () => {
  const deleteDeviceFn = jest.fn()
  let params: { tenantId: string, personaGroupId: string, personaId: string }

  beforeEach( async () => {
    deleteDeviceFn.mockClear()
    mockServer.use(
      rest.post(
        PersonaUrls.addPersonaDevices.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.delete(
        PersonaUrls.deletePersonaDevices.url,
        (req, res, ctx) => {
          deleteDeviceFn()
          return res(ctx.json({}))
        }
      ),
      rest.post(
        ClientUrlsInfo.getClientList.url,
        (_, res, ctx) => res(ctx.json({ data: [
          {
            osType: 'Windows',
            clientMac: '11:11:11:11:11:11',
            ipAddress: '10.206.1.93',
            Username: 'mac-device',
            hostname: 'Persona_Host_name',
            venueName: 'UI-TEST-VENUE',
            apName: 'UI team ONLY',
            authmethod: 'Standard+Mac'  // for MAC auth devices
          },
          {
            osType: 'Windows',
            clientMac: '22:22:22:22:22:22',
            ipAddress: '10.206.1.93',
            Username: 'dpsk-device',
            hostname: 'dpsk-hostname',
            venueName: 'UI-TEST-VENUE',
            apName: 'UI team ONLY',
            authmethod: 'Standard+Open' // for DPSK auth devices
          }
        ] }))
      ),
      rest.post(
        ClientUrlsInfo.getClientMeta.url,
        (req, res, ctx) => res(ctx.json({ data: [] }))
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      personaGroupId: mockPersona.groupId,
      personaId: mockPersona.id
    }
  })


  it('should render persona devices table without dpsk devices', async () => {
    render(
      <Provider>
        <PersonaDevicesTable disableAddButton={false} persona={mockPersona}/>
      </Provider>, {
        route: {
          params,
          // eslint-disable-next-line max-len
          path: '/:tenantId/t/users/persona-management/persona-group/:personaGroupId/persona/:personaId'
        }
      }
    )

    const expectedMacAddress = mockPersona?.devices ? mockPersona.devices[0].macAddress : ''

    await screen.findByRole('heading', { name: /devices/i })
    await screen.findByRole('cell', { name: expectedMacAddress })
    await screen.findByRole('cell', { name: 'Persona_Host_name' })  // to make sure that clients/metas api done

    const addButton = await screen.findByRole('button', { name: /add device/i })
    expect(addButton).not.toBeDisabled()
    await userEvent.click(addButton)

    const addDeviceModal = await screen.findByTestId('PersonaDevicesImportDialog')
    expect(addDeviceModal).toBeInTheDocument()

    // Save the modal
    await userEvent.click(await within(addDeviceModal).findByRole('button', { name: /add/i }))
    await waitFor(() => expect(addDeviceModal).not.toBeInTheDocument())

    await userEvent.click(addButton)

    // Cancel the modal
    await userEvent.click(await within(addDeviceModal).findByRole('button', { name: /cancel/i }))
    expect(addDeviceModal).not.toBeInTheDocument()
  })

  it('should delete selected persona devices', async () => {
    render(
      <Provider>
        <PersonaDevicesTable disableAddButton={false} persona={mockPersona}/>
      </Provider>, {
        route: {
          params,
          // eslint-disable-next-line max-len
          path: '/:tenantId/t/users/persona-management/persona-group/:personaGroupId/persona/:personaId'
        }
      }
    )

    const expectedMacAddress = mockPersona?.devices ? mockPersona.devices[0].macAddress : ''

    await screen.findByRole('heading', { name: /devices/i })
    const row = await screen.findByRole('row', { name: new RegExp(expectedMacAddress) })
    await userEvent.click(await within(row).findByRole('checkbox'))

    await userEvent.click(await screen.findByRole('button', { name: /delete/i }))

    const confirmDialog = await screen.findByRole('dialog')
    await userEvent.click(await within(confirmDialog).findByRole('button', { name: /delete/i }))

    await waitFor(() => expect(deleteDeviceFn).toHaveBeenCalled())
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('should render persona device table with dpsk devices', async () => {
    mockServer.use(
      rest.get(
        DpskUrls.getPassphraseDevices.url.split('?')[0],
        (_, res, ctx) => res(ctx.json(mockedDpskPassphraseDevices))
      )
    )
    render(
      <Provider>
        <PersonaDevicesTable
          disableAddButton={true}
          persona={mockPersona}
          dpskPoolId={'dpsk-pool-id'}
        />
      </Provider>, {
        route: {
          params,
          // eslint-disable-next-line max-len
          path: '/:tenantId/t/users/persona-management/persona-group/:personaGroupId/persona/:personaId'
        }
      }
    )

    const expectedMacAddress = mockedDpskPassphraseDevices[0].mac.replaceAll(':', '-')

    await screen.findByRole('heading', { name: /devices/i })
    await screen.findByRole('row', { name: new RegExp(expectedMacAddress) })
    await screen.findByRole('cell', { name: 'dpsk-hostname' })  // to make sure that clients/metas api done
  })

  it('should disable `add device` while does not associate with MacPool', async () => {
    render(
      <Provider>
        <PersonaDevicesTable disableAddButton={true} />
      </Provider>, {
        route: {
          params,
          // eslint-disable-next-line max-len
          path: '/:tenantId/t/users/persona-management/persona-group/:personaGroupId/persona/:personaId'
        }
      }
    )

    expect(await screen.findByRole('button', { name: /add device/i })).toBeDisabled()
  })
})
