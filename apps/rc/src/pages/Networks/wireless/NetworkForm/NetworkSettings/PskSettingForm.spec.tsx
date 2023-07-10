import '@testing-library/jest-dom'
import React from 'react'

import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn, useIsTierAllowed }                                            from '@acx-ui/feature-toggle'
import { AaaUrls, CommonUrlsInfo, MacRegListUrlsInfo, WifiUrlsInfo }                 from '@acx-ui/rc/utils'
import { Provider }                                                                  from '@acx-ui/store'
import { mockServer, render, screen, fireEvent, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'
import { UserUrlsInfo }                                                              from '@acx-ui/user'

import {
  venuesResponse,
  venueListResponse,
  networksResponse,
  successResponse,
  networkDeepResponse,
  mockMacRegistrationPoolList, mockUpdatedMacRegistrationPoolList
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
      rest.get(UserUrlsInfo.getAllUserSettings.url,
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
      rest.get(AaaUrls.getAAAPolicyList.url,
        (_, res, ctx) => res(ctx.json([{ id: '1', name: 'test1' }]))),
      rest.post(CommonUrlsInfo.getNetworkDeepList.url,
        (_, res, ctx) => res(ctx.json({ response: [networkDeepResponse] })))
    )
  })

  const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

  it('should create PSK network with WPA2 successfully', async () => {
    render(<Provider><NetworkForm /></Provider>, { route: { params } })

    await fillInBeforeSettings('PSK network test')

    const passphraseTextbox = await screen.findAllByLabelText('Passphrase')
    fireEvent.change(passphraseTextbox[0], { target: { value: '11111111' } })

    await fillInAfterSettings(async () => {
      expect(await screen.findByText('PSK network test')).toBeVisible()
    })
  })

  it('should create PSK network with WPA2 and mac auth', async () => {
    render(<Provider><NetworkForm /></Provider>, { route: { params } })

    await fillInBeforeSettings('PSK network test')

    const passphraseTextbox = await screen.findAllByLabelText(/Passphrase/)
    fireEvent.change(passphraseTextbox[0], { target: { value: '11111111' } })
    await userEvent.click(await screen.findByRole('switch'))
    // await userEvent.click((await screen.findAllByRole('combobox'))[3])
    // await userEvent.click((await screen.findAllByTitle('test1'))[0])
  })

  it('should create PSK network with WPA2 and mac auth (for mac registration list)', async () => {
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    mockServer.use(
      rest.get(MacRegListUrlsInfo.getMacRegistrationPools.url
        .split('?')[0],
      (_, res, ctx) => res(ctx.json(mockMacRegistrationPoolList)))
    )

    render(<Provider><NetworkForm /></Provider>, { route: { params } })

    await fillInBeforeSettings('PSK network test')

    const passphraseTextbox = await screen.findAllByLabelText(/Passphrase/)
    fireEvent.change(passphraseTextbox[0], { target: { value: '11111111' } })
    await userEvent.click(await screen.findByRole('switch'))
    // await userEvent.click((await screen.findAllByRole('combobox'))[3])
    // await userEvent.click((await screen.findAllByTitle('test1'))[0])

    await userEvent.click(await screen.findByRole('radio', {
      name: /mac registration list/i
    }))

    await screen.findByText(/select mac registration list/i)

    await userEvent.click(await screen.findByRole('button', {
      name: /add/i
    }))

    await screen.findByText(/add mac registration list/i)

    const buttons = await screen.findAllByRole('button', {
      name: /cancel/i
    })

    await userEvent.click(await screen.findByRole('button', {
      name: /add/i
    }))

    await screen.findByText(/add mac registration list/i)

    await userEvent.type(await screen.findByRole('textbox', {
      name: /name/i
    }), 'macReg6')

    await userEvent.click(await screen.findByRole('button', {
      name: /apply/i
    }))

    mockServer.use(
      rest.get(MacRegListUrlsInfo.getMacRegistrationPools.url
        .split('?')[0],
      (_, res, ctx) => res(ctx.json(mockUpdatedMacRegistrationPoolList)))
    )

    await userEvent.click(buttons[1])

    expect(await screen.findByText(/add mac registration list/i)).not.toBeVisible()
  })


  it('should create PSK network with WP3 and mac auth security protocol', async () => {
    render(<Provider><NetworkForm /></Provider>, { route: { params } })

    await fillInBeforeSettings('PSK network test')

    const securityProtocols = await screen.findByRole('combobox', { name: 'Security Protocol' })

    fireEvent.mouseDown(securityProtocols)

    const option = screen.getAllByText('WPA3')[0]

    await userEvent.click(option)

    const passphraseTextbox = await screen.findAllByLabelText('Passphrase')
    fireEvent.change(passphraseTextbox[0], { target: { value: '11111111' } })

    await userEvent.click(await screen.findByRole('switch'))
    // await userEvent.click((await screen.findAllByRole('combobox'))[3])
    // await userEvent.click((await screen.findAllByTitle('test1'))[0])
    await userEvent.click((await screen.findAllByRole('switch'))[1])
    await userEvent.click((await screen.findAllByRole('switch'))[1])
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
  })
})
