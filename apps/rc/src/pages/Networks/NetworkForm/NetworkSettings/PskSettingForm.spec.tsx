import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo, WifiUrlsInfo }                                              from '@acx-ui/rc/utils'
import { Provider }                                                                  from '@acx-ui/store'
import { mockServer, render, screen, fireEvent, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import {
  venuesResponse,
  venueListResponse,
  networksResponse,
  successResponse,
  networkDeepResponse
} from '../__tests__/fixtures'
import NetworkForm from '../NetworkForm'

async function fillInBeforeSettings (networkName: string) {
  const insertInput = await screen.findByLabelText(/Network Name/)
  fireEvent.change(insertInput, { target: { value: networkName } })
  fireEvent.blur(insertInput)
  const validating = await screen.findByRole('img', { name: 'loading' })
  await waitForElementToBeRemoved(validating)

  await userEvent.click(await screen.findByRole('radio', { name: /defined for the network/ }))
  await userEvent.click(await screen.findByRole('button', { name: 'Next' }))

  await waitFor(async () => {
    expect(await screen.findByRole('heading', { level: 3, name: 'Settings' })).toBeVisible()
  })
}

async function fillInAfterSettings (checkSummary: Function, waitForIpValidation?: boolean) {
  await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
  if (waitForIpValidation) {
    const validating = await screen.findAllByRole('img', { name: 'loading' })
    await waitForElementToBeRemoved(validating)
  }
  await screen.findByRole('heading', { level: 3, name: 'Venues' })

  await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
  await screen.findByRole('heading', { level: 3, name: 'Summary' })

  checkSummary()
  const finish = await screen.findByText('Finish')
  await userEvent.click(finish)
  await waitForElementToBeRemoved(finish)
}

describe('NetworkForm', () => {
  beforeEach(() => {
    networkDeepResponse.name = 'PSK network test'
    mockServer.use(
      rest.get(CommonUrlsInfo.getAllUserSettings.url,
        (_, res, ctx) => res(ctx.json({ COMMON: '{}' }))),
      rest.post(CommonUrlsInfo.getNetworksVenuesList.url,
        (_, res, ctx) => res(ctx.json(venuesResponse))),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venueListResponse))),
      rest.post(CommonUrlsInfo.getVMNetworksList.url,
        (_, res, ctx) => res(ctx.json(networksResponse))),
      rest.post(WifiUrlsInfo.addNetworkDeep.url.replace('?quickAck=true', ''),
        (_, res, ctx) => res(ctx.json(successResponse))),
      rest.get(CommonUrlsInfo.getCloudpathList.url,
        (_, res, ctx) => res(ctx.json([]))),
      rest.post(CommonUrlsInfo.validateRadius.url,
        (_, res, ctx) => res(ctx.json(successResponse))),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venueListResponse))),
      rest.get(WifiUrlsInfo.getNetwork.url,
        (_, res, ctx) => res(ctx.json(networkDeepResponse))),
      rest.post(CommonUrlsInfo.getNetworkDeepList.url,
        (_, res, ctx) => res(ctx.json({ response: [networkDeepResponse] })))
    )
  })

  const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

  it('should create PSK network with WPA2 successfully', async () => {
    const { asFragment } = render(<Provider><NetworkForm /></Provider>, { route: { params } })
    expect(asFragment()).toMatchSnapshot()

    await fillInBeforeSettings('PSK network test')

    const passphraseTextbox = await screen.findByLabelText('Passphrase')
    fireEvent.change(passphraseTextbox, { target: { value: '11111111' } })

    await fillInAfterSettings(async () => {
      expect(await screen.findByText('PSK network test')).toBeVisible()
    })
  })

  it('should create PSK network with WPA2 and mac auth', async () => {
    render(<Provider><NetworkForm /></Provider>, { route: { params } })

    await fillInBeforeSettings('PSK network test')

    const passphraseTextbox = await screen.findByLabelText(/Passphrase/)
    fireEvent.change(passphraseTextbox, { target: { value: '11111111' } })

    await userEvent.click(await screen.findByRole('switch'))

    const ipTextbox = await screen.findByLabelText('IP Address')
    fireEvent.change(ipTextbox, { target: { value: '192.168.1.1' } })

    const portTextbox = await screen.findByLabelText('Port')
    fireEvent.change(portTextbox, { target: { value: '1111' } })

    const secretTextbox = await screen.findByLabelText('Shared secret')
    fireEvent.change(secretTextbox, { target: { value: 'secret-1' } })
  })


  it('should create PSK network with WP3 and mac auth security protocol', async () => {
    render(<Provider><NetworkForm /></Provider>, { route: { params } })

    await fillInBeforeSettings('PSK network test')

    const securityProtocols = await screen.findByRole('combobox', { name: 'Security Protocol' })

    fireEvent.mouseDown(securityProtocols)

    const option = screen.getAllByText('WPA3')[0]

    await userEvent.click(option)

    const passphraseTextbox = await screen.findByLabelText('Passphrase')
    fireEvent.change(passphraseTextbox, { target: { value: '11111111' } })

    await userEvent.click(await screen.findByRole('switch'))

    const ipTextbox = await screen.findByLabelText('IP Address')
    fireEvent.change(ipTextbox, { target: { value: '192.168.1.1' } })

    const portTextbox = await screen.findByLabelText('Port')
    fireEvent.change(portTextbox, { target: { value: '1111' } })

    const secretTextbox = await screen.findByLabelText('Shared secret')
    fireEvent.change(secretTextbox, { target: { value: 'secret-1' } })

    await fillInAfterSettings(async () => {
      expect(await screen.findByText('PSK network test')).toBeVisible()
      expect(await screen.findByText('192.168.1.1:1111')).toBeVisible()
      expect(await screen.findAllByDisplayValue('secret-1')).toHaveLength(2)
    }, true)
  }, 20000)

  it('should create PSK network with WEP security protocol', async () => {
    render(<Provider><NetworkForm /></Provider>, { route: { params } })

    await fillInBeforeSettings('PSK network test')

    const securityProtocols = await screen.findByRole('combobox', { name: 'Security Protocol' })

    fireEvent.mouseDown(securityProtocols)

    const mixOption1 = await screen.findByText('WPA')
    await userEvent.click(mixOption1)

    fireEvent.mouseDown(securityProtocols)

    const mixOption2 = await screen.findByText('WPA2 (Recommended)')
    await userEvent.click(mixOption2)

    fireEvent.mouseDown(securityProtocols)

    const mixOption3 = await screen.findByText('WPA3/WPA2 mixed mode')
    await userEvent.click(mixOption3)

    fireEvent.mouseDown(securityProtocols)
    const option = await screen.findByText('WEP')

    await userEvent.click(option)

    await userEvent.click(await screen.findByText('Generate'))

    await userEvent.click(await screen.findByRole('switch'))

    const ipTextbox = await screen.findByLabelText('IP Address')
    fireEvent.change(ipTextbox, { target: { value: '192.168.1.1' } })

    const portTextbox = await screen.findByLabelText('Port')
    fireEvent.change(portTextbox, { target: { value: '1111' } })

    const secretTextbox = await screen.findByLabelText('Shared secret')
    fireEvent.change(secretTextbox, { target: { value: 'secret-1' } })

    await userEvent.click(await screen.findByRole('button', { name: 'Add Secondary Server' }))

    const ipTextboxAlt = await screen.findAllByLabelText('IP Address')
    fireEvent.change(ipTextboxAlt[1], { target: { value: '192.168.2.2' } })

    const portTextboxAlt = await screen.findAllByLabelText('Port')
    fireEvent.change(portTextboxAlt[1], { target: { value: '2222' } })

    const secretTextboxAlt = await screen.findAllByLabelText('Shared secret')
    fireEvent.change(secretTextboxAlt[1], { target: { value: 'secret-2' } })

    const switchButton = await screen.findAllByRole('switch')
    await userEvent.click(switchButton[1])

    const ipTextboxAcc = await screen.findAllByLabelText('IP Address')
    fireEvent.change(ipTextboxAcc[2], { target: { value: '192.168.3.3' } })

    const portTextboxAcc = await screen.findAllByLabelText('Port')
    fireEvent.change(portTextboxAcc[2], { target: { value: '3333' } })

    const secretTextboxAcc = await screen.findAllByLabelText('Shared secret')
    fireEvent.change(secretTextboxAcc[2], { target: { value: 'secret-3' } })
    await fillInAfterSettings(async () => {
      expect(await screen.findByText('PSK network test')).toBeVisible()
      expect(await screen.findByText('192.168.1.1:1111')).toBeVisible()
      expect(await screen.findAllByDisplayValue('secret-1')).toHaveLength(2)
      expect(await screen.findByText('192.168.2.2:2222')).toBeVisible()
      expect(await screen.findAllByDisplayValue('secret-2')).toHaveLength(2)
      expect(await screen.findByText('192.168.3.3:3333')).toBeVisible()
      expect(await screen.findAllByDisplayValue('secret-3')).toHaveLength(2)
    }, true)
  })
})
