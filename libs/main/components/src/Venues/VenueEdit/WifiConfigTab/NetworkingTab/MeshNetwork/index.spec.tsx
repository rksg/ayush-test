/* eslint-disable max-len */
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn }                                           from '@acx-ui/feature-toggle'
import { venueApi }                                                         from '@acx-ui/rc/services'
import { CommonUrlsInfo, WifiUrlsInfo, WifiRbacUrlsInfo, FirmwareUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                                  from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved }            from '@acx-ui/test-utils'

import {
  venueData,
  venueSetting,
  venueApsList,
  validChannelsData,
  venueApCompatibilitiesData,
  mockedApModelFamilies
} from '../../../../__tests__/fixtures'

import { MeshNetwork } from '.'

const { hover } = userEvent

const params = {
  tenantId: '15a04f095a8f4a96acaf17e921e8a6df',
  venueId: 'f892848466d047798430de7ac234e940'
}

describe('MeshNetwork', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getVenue.url,
        (_, res, ctx) => res(ctx.json(venueData))),
      rest.get(
        CommonUrlsInfo.getVenueSettings.url,
        (_, res, ctx) => res(ctx.json(venueSetting))),
      rest.put(
        CommonUrlsInfo.updateVenueMesh.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json(venueApsList))),
      rest.get(
        WifiUrlsInfo.getVenueDefaultRegulatoryChannels.url,
        (_, res, ctx) => res(ctx.json(validChannelsData))),
      rest.get(
        WifiRbacUrlsInfo.getVenueDefaultRegulatoryChannels.url,
        (_, res, ctx) => res(ctx.json(validChannelsData))),
      rest.post(
        FirmwareUrlsInfo.getApModelFamilies.url,
        (req, res, ctx) => res(ctx.json(mockedApModelFamilies))
      )
    )
  })
  it('should render correctly', async () => {
    const { asFragment } = render(<Provider><MeshNetwork /></Provider>, { route: { params } })
    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))

    expect(asFragment()).toMatchSnapshot()
    await userEvent.click(await screen.findByRole('switch')) // unchecked

    await userEvent.click(await screen.findByRole('switch'))

    await userEvent.click(await screen.findByRole('switch')) // unchecked

  })
  it('should render disabled switch button correctly', async () => {
    mockServer.use(
      rest.get(CommonUrlsInfo.getVenueSettings.url,
        (_, res, ctx) => res(ctx.json({
          ...venueSetting,
          dhcpServiceSetting: {
            ...venueSetting.dhcpServiceSetting,
            enabled: true
          },
          mesh: {
            enabled: false
          }
        })))
    )

    const { asFragment } = render(<Provider><MeshNetwork /></Provider>, { route: { params } })
    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))

    expect(asFragment()).toMatchSnapshot()
    expect(screen.getByTestId('mesh-switch')).toBeDisabled()
  })

  it('Mesh enhancement: should disabled all settings when mesh has been turned ON', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.WIFI_RBAC_API)

    render(<Provider><MeshNetwork /></Provider>, { route: { params } })
    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))

    // eslint-disable-next-line max-len
    const [ssidChangeBtn, passphraseChangeBtn] = await screen.findAllByRole('button', { name: 'Change' })

    expect(ssidChangeBtn).toBeDisabled()
    expect(passphraseChangeBtn).toBeDisabled()

  })

  it('Mesh enhancement: enable mesh and set other settings', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.WIFI_RBAC_API)

    mockServer.use(rest.get(
      CommonUrlsInfo.getVenueSettings.url,
      (_, res, ctx) => res(ctx.json({ mesh: { enabled: false } }))))

    render(<Provider><MeshNetwork /></Provider>, { route: { params } })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))

    // enable mesh
    await userEvent.click(await screen.findByRole('switch'))

    const [ssidChangeBtn, passphraseChangeBtn] = await screen.findAllByRole('button', { name: 'Change' })

    expect(ssidChangeBtn).toBeEnabled()

    // edit mesh network name (ssid)
    await userEvent.click(ssidChangeBtn)

    const [ssidInputElm, passphraseInputElm] = await screen.findAllByRole('textbox')
    await userEvent.clear(ssidInputElm)
    await screen.findByText('Please enter the Mesh Network Name')
    await userEvent.type(ssidInputElm, '2345678 ')
    await screen.findByText('No leading or trailing spaces allowed')

    await userEvent.clear(ssidInputElm)
    await userEvent.type(ssidInputElm, '`')
    await screen.findByText('"`" and "$(" are not allowed')

    await userEvent.clear(ssidInputElm)
    await userEvent.type(ssidInputElm, '$(')
    await screen.findByText('"`" and "$(" are not allowed')

    await userEvent.clear(ssidInputElm)
    await userEvent.type(ssidInputElm, '1234567890123456789012345678901234567890')
    await screen.findByText('The Mesh Network Name must be between 1 and 32 characters')
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))

    await userEvent.click(passphraseChangeBtn)
    await userEvent.type(passphraseInputElm, '{backspace}@1234567890')
    await screen.findByText('The PSK is invalid')
    await userEvent.clear(passphraseInputElm)
    await screen.findByText('Please enter Mesh PSK')
    await userEvent.type(passphraseInputElm, '1')
    await screen.findByText('PSK must be between 8 and 63 characters or 64 hexadecimal number')
    await userEvent.type(passphraseInputElm, '2345678 ')
    await screen.findByText('No leading or trailing spaces allowed')
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))


    const [ssidChangeBtn1, passphraseChangeBtn1] = await screen.findAllByRole('button', { name: 'Change' })
    await userEvent.click(ssidChangeBtn1)
    await userEvent.type(ssidInputElm, '@123')
    await userEvent.click(await screen.findByRole('button', { name: 'Save' }))

    await userEvent.click(passphraseChangeBtn1)
    await userEvent.type(passphraseInputElm, '{backspace}1')
    await userEvent.click(await screen.findByRole('button', { name: 'Generate' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Save' }))

    await userEvent.click(await screen.findByTestId('radio24'))
    await userEvent.click(await screen.findByTestId('radio56'))
    await userEvent.click(await screen.findByTestId('radio5'))
    await userEvent.click(await screen.findByTestId('radio6'))
    // zero touch mesh
    await userEvent.click(await screen.findByTestId('zero-touch-mesh-switch'))
  })

  it('Mesh 5g only and 6g only: r370 heterogeneous tooltips', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff =>
      ff === Features.WIFI_MESH_CONFIGURATION_FOR_5G_6G_ONLY ||
      ff === Features.WIFI_R370_TOGGLE)

    mockServer.use(
      rest.get(
        CommonUrlsInfo.getVenueSettings.url,
        (_, res, ctx) => res(ctx.json({ mesh: { enabled: true } }))),
      rest.post(
        WifiUrlsInfo.getApCompatibilitiesVenue.url,
        (req, res, ctx) => res(ctx.json(venueApCompatibilitiesData))
      ))

    render(<Provider><MeshNetwork /></Provider>, { route: { params } })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))

    // enable mesh
    await hover(await screen.queryAllByTestId('InformationSolid')[2])
    expect(await screen.findByRole('tooltip', { hidden: true }))
      // eslint-disable-next-line max-len
      .toHaveTextContent(
        'When selecting the 5GHz radio to link other mesh APs, 2R APs (2/6) will form mesh on the 6GHz band.')
    await screen.findByText('See the compatibility requirements.')
    await userEvent.click(await screen.findByTestId('tooltip-button'))
  })
})
