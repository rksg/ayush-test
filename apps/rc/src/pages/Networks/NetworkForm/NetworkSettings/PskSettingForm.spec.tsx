import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo, WifiUrlsInfo }                                     from '@acx-ui/rc/utils'
import { Provider }                                                         from '@acx-ui/store'
import { mockServer, render, screen, fireEvent, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import {
  venuesResponse,
  venueListResponse,
  networksResponse,
  successResponse
} from '../__tests__/fixtures'
import { NetworkForm } from '../NetworkForm'

async function fillInBeforeSettings (networkName: string) {
  const insertInput = screen.getByLabelText(/Network Name/)
  fireEvent.change(insertInput, { target: { value: networkName } })
  fireEvent.blur(insertInput)
  const validating = await screen.findByRole('img', { name: 'loading' })
  await waitForElementToBeRemoved(validating)

  await userEvent.click(screen.getByRole('radio', { name: /defined for the network/ }))
  await userEvent.click(screen.getByRole('button', { name: 'Next' }))

  await screen.findByRole('heading', { level: 3, name: 'Settings' })
}

async function fillInAfterSettings (checkSummary: Function, waitForIpValidation?: boolean) {
  await userEvent.click(screen.getByRole('button', { name: 'Next' }))
  if (waitForIpValidation) {
    const validating = await screen.findByRole('img', { name: 'loading' })
    await waitForElementToBeRemoved(validating)
  }
  await screen.findByRole('heading', { level: 3, name: 'Venues' })

  await userEvent.click(screen.getByRole('button', { name: 'Next' }))
  await screen.findByRole('heading', { level: 3, name: 'Summary' })

  checkSummary()
  const finish = screen.getByText('Finish')
  await userEvent.click(finish)
  await waitForElementToBeRemoved(finish)
}

describe('NetworkForm', () => {
  beforeEach(() => {
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
        (_, res, ctx) => res(ctx.json(successResponse)))
    )
  })

  const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

  it('should create PSK network with WPA2 successfully', async () => {
    const { asFragment } = render(<Provider><NetworkForm /></Provider>, { route: { params } })
    expect(asFragment()).toMatchSnapshot()

    await fillInBeforeSettings('PSK network test')

    const passphraseTextbox = screen.getByLabelText('Passphrase')
    fireEvent.change(passphraseTextbox, { target: { value: '11111111' } })

    await fillInAfterSettings(async () => {
      expect(screen.getByText('PSK network test')).toBeVisible()
    })
  })

  it('should create PSK network with WPA2 and mac auth', async () => {
    render(<Provider><NetworkForm /></Provider>, { route: { params } })

    await fillInBeforeSettings('PSK network test')

    const passphraseTextbox = screen.getByLabelText('Passphrase')
    fireEvent.change(passphraseTextbox, { target: { value: '11111111' } })

    await userEvent.click(screen.getByRole('switch'))

    const ipTextbox = screen.getByLabelText('IP Address')
    fireEvent.change(ipTextbox, { target: { value: '192.168.1.1' } })

    const portTextbox = screen.getByLabelText('Port')
    fireEvent.change(portTextbox, { target: { value: '1111' } })

    const secretTextbox = screen.getByLabelText('Shared secret')
    fireEvent.change(secretTextbox, { target: { value: 'secret-1' } })

    await fillInAfterSettings(async () => {
      expect(screen.getByText('PSK network test')).toBeVisible()
      expect(screen.getByText('192.168.1.1:1111')).toBeVisible()
      expect(screen.getAllByDisplayValue('secret-1')).toHaveLength(2)
    })
  }, 20000)


  it('should create PSK network with WP3 and mac auth security protocol', async () => {
    render(<Provider><NetworkForm /></Provider>, { route: { params } })

    await fillInBeforeSettings('PSK network test')

    const securityProtocols = screen.getByRole('combobox', { name: 'Security Protocol' })

    fireEvent.mouseDown(securityProtocols)

    const option = screen.getAllByLabelText('WPA3')[0]

    await userEvent.click(option)

    const passphraseTextbox = screen.getByLabelText('Passphrase')
    fireEvent.change(passphraseTextbox, { target: { value: '11111111' } })

    await userEvent.click(screen.getByRole('switch'))

    const ipTextbox = screen.getByLabelText('IP Address')
    fireEvent.change(ipTextbox, { target: { value: '192.168.1.1' } })

    const portTextbox = screen.getByLabelText('Port')
    fireEvent.change(portTextbox, { target: { value: '1111' } })

    const secretTextbox = screen.getByLabelText('Shared secret')
    fireEvent.change(secretTextbox, { target: { value: 'secret-1' } })

    await fillInAfterSettings(async () => {
      expect(screen.getByText('PSK network test')).toBeVisible()
      expect(screen.getByText('192.168.1.1:1111')).toBeVisible()
      expect(screen.getAllByDisplayValue('secret-1')).toHaveLength(2)
    })
  }, 20000)

  it('should create PSK network with WEP security protocol', async () => {
    render(<Provider><NetworkForm /></Provider>, { route: { params } })

    await fillInBeforeSettings('PSK network test')

    const securityProtocols = screen.getByRole('combobox', { name: 'Security Protocol' })

    fireEvent.mouseDown(securityProtocols)

    const mixOption =screen.getByText('WPA3/WPA2 mixed mode')
    await userEvent.click(mixOption)

    fireEvent.mouseDown(securityProtocols)
    const option = screen.getByText('WEP')

    await userEvent.click(option)

    await userEvent.click(screen.getByText('Generate'))

    await userEvent.click(screen.getByRole('switch'))

    const ipTextbox = screen.getByLabelText('IP Address')
    fireEvent.change(ipTextbox, { target: { value: '192.168.1.1' } })

    const portTextbox = screen.getByLabelText('Port')
    fireEvent.change(portTextbox, { target: { value: '1111' } })

    const secretTextbox = screen.getByLabelText('Shared secret')
    fireEvent.change(secretTextbox, { target: { value: 'secret-1' } })

    await userEvent.click(screen.getByRole('button', { name: 'Add Secondary Server' }))

    const ipTextboxAlt = screen.getAllByLabelText('IP Address')[1]
    fireEvent.change(ipTextboxAlt, { target: { value: '192.168.2.2' } })

    const portTextboxAlt = screen.getAllByLabelText('Port')[1]
    fireEvent.change(portTextboxAlt, { target: { value: '2222' } })

    const secretTextboxAlt = screen.getAllByLabelText('Shared secret')[1]
    fireEvent.change(secretTextboxAlt, { target: { value: 'secret-2' } })

    await userEvent.click(screen.getAllByRole('switch')[1])

    const ipTextboxAcc = screen.getAllByLabelText('IP Address')[2]
    fireEvent.change(ipTextboxAcc, { target: { value: '192.168.3.3' } })

    const portTextboxAcc = screen.getAllByLabelText('Port')[2]
    fireEvent.change(portTextboxAcc, { target: { value: '3333' } })

    const secretTextboxAcc = screen.getAllByLabelText('Shared secret')[2]
    fireEvent.change(secretTextboxAcc, { target: { value: 'secret-3' } })

    await fillInAfterSettings(async () => {
      expect(screen.getByText('PSK network test')).toBeVisible()
      expect(screen.getByText('192.168.1.1:1111')).toBeVisible()
      expect(screen.getAllByDisplayValue('secret-1')).toHaveLength(2)
      expect(screen.getByText('192.168.2.2:2222')).toBeVisible()
      expect(screen.getAllByDisplayValue('secret-2')).toHaveLength(2)
      expect(screen.getByText('192.168.3.3:3333')).toBeVisible()
      expect(screen.getAllByDisplayValue('secret-3')).toHaveLength(2)
    })
  }, 20000)
})
