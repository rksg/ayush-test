import '@testing-library/jest-dom'
import { rest } from 'msw'

import { CommonUrlsInfo }                                                   from '@acx-ui/rc/utils'
import { Provider }                                                         from '@acx-ui/store'
import { mockServer, render, screen, fireEvent, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { NetworkForm }                                       from '../NetworkForm'
import { networksResponse, venuesResponse, successResponse } from '../NetworkForm.spec'

async function fillInBeforeSettings (networkName: string) {
  const insertInput = screen.getByLabelText('Network Name')
  fireEvent.change(insertInput, { target: { value: networkName } })
  fireEvent.blur(insertInput)
  const validating = await screen.findByRole('img', { name: 'loading' })
  await waitForElementToBeRemoved(validating)

  fireEvent.click(screen.getByRole('radio', { name: /that you have defined for the network/ }))
  fireEvent.click(screen.getByText('Next'))

  await screen.findByRole('heading', { level: 3, name: 'Settings' })
}

async function fillInAfterSettings (checkSummary: Function) {
  fireEvent.click(screen.getByText('Next'))
  await screen.findByRole('heading', { level: 3, name: 'Venues' })

  fireEvent.click(screen.getByText('Next'))
  await screen.findByRole('heading', { level: 3, name: 'Summary' })

  checkSummary()
  const finish = screen.getByText('Finish')
  fireEvent.click(finish)
  await waitForElementToBeRemoved(finish)
}

describe('NetworkForm', () => {
  beforeEach(() => {
    mockServer.use(
      rest.get(CommonUrlsInfo.getAllUserSettings.url,
        (_, res, ctx) => res(ctx.json({ COMMON: '{}' }))),
      rest.post(CommonUrlsInfo.getNetworksVenuesList.url,
        (_, res, ctx) => res(ctx.json(venuesResponse))),
      rest.post(CommonUrlsInfo.getVMNetworksList.url,
        (_, res, ctx) => res(ctx.json(networksResponse))),
      rest.post(CommonUrlsInfo.addNetworkDeep.url.replace('?quickAck=true', ''),
        (_, res, ctx) => res(ctx.json(successResponse))),
      rest.get(CommonUrlsInfo.getCloudpathList.url,
        (_, res, ctx) => res(ctx.json([])))
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

  xit('should create PSK network with WPA2 and mac auth', async () => {
    render(<Provider><NetworkForm /></Provider>, { route: { params } })

    await fillInBeforeSettings('PSK network test')

    const passphraseTextbox = screen.getByLabelText('Passphrase')
    fireEvent.change(passphraseTextbox, { target: { value: '11111111' } })

    fireEvent.click(screen.getByRole('switch'))

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
  }, 7000)


  xit('should create PSK network with WP3 and mac auth security protocol', async () => {
    render(<Provider><NetworkForm /></Provider>, { route: { params } })

    await fillInBeforeSettings('PSK network test')

    const securityProtocols = screen.getByRole('combobox')

    fireEvent.mouseDown(securityProtocols)

    const option = screen.getAllByLabelText('WPA3')[0]

    fireEvent.click(option)

    const passphraseTextbox = screen.getByLabelText('Passphrase')
    fireEvent.change(passphraseTextbox, { target: { value: '11111111' } })

    fireEvent.click(screen.getByRole('switch'))

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
  }, 7000)

  it('should create PSK network with WEP security protocol', async () => {
    render(<Provider><NetworkForm /></Provider>, { route: { params } })

    await fillInBeforeSettings('PSK network test')

    const securityProtocols = screen.getByRole('combobox')

    fireEvent.mouseDown(securityProtocols)

    const mixOption =screen.getByText('WPA3/WPA2 mixed mode')
    fireEvent.click(mixOption)

    fireEvent.mouseDown(securityProtocols)
    const option = screen.getByText('WEP')

    fireEvent.click(option)

    fireEvent.click(screen.getByText('Generate'))

    await fillInAfterSettings(async () => {
      expect(screen.getByText('PSK network test')).toBeVisible()
    })
  })
})
