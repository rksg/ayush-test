import '@testing-library/jest-dom'
import userEvent   from '@testing-library/user-event'
import { Modal }   from 'antd'
import { rest }    from 'msw'
import { useIntl } from 'react-intl'

import { useIsSplitOn }                                                          from '@acx-ui/feature-toggle'
import { AaaUrls, CommonUrlsInfo, WifiUrlsInfo }                                 from '@acx-ui/rc/utils'
import { Provider }                                                              from '@acx-ui/store'
import { act, mockServer, render, screen, fireEvent, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import {
  venuesResponse,
  venueListResponse,
  networksResponse,
  successResponse,
  cloudpathResponse,
  networkDeepResponse
} from '../__tests__/fixtures'
import { radiusErrorMessage, multipleConflictMessage } from '../contentsMap'
import NetworkForm                                     from '../NetworkForm'

jest.mock('react-intl', () => {
  const reactIntl = jest.requireActual('react-intl')
  const intl = reactIntl.createIntl({
    locale: 'en'
  })

  return {
    ...reactIntl,
    useIntl: () => intl
  }
})
jest.mocked(useIsSplitOn).mockReturnValue(true) // mock AAA policy
const validateErrorResponse = [{
  code: '',
  message: 'Occured Some Error',
  object: 'radiusProfiles.xxxxxxx'
}, {
  code: 'WIFI-10200',
  message: 'Authentication Profile Mismatch [Shared Secret on Primary has changed]',
  object: 'radiusProfiles.authRadius',
  value: {
    primary: {
      ip: '1.1.1.1',
      port: 10,
      sharedSecret: '99999'
    },
    id: '007d6854e6294e97882b432185c1abd9'
  }
}, {
  code: 'WIFI-10200',
  message: 'Accounting Profile Mismatch [Shared Secret on Primary has changed]',
  object: 'radiusProfiles.accountingRadius',
  value: {
    primary: {
      ip: '1.1.1.1',
      port: 20,
      sharedSecret: '88888'
    },
    id: '3e90174d344749b1a1e36a1fd802510c' }
}, {
  code: 'WIFI-10200',
  message: 'multiple conflict xxxxx Authentication Profile Mismatch xxxxxx',
  object: 'radiusProfiles.accountingRadius',
  value: {
    primary: {
      ip: '1.1.1.1',
      port: 10,
      sharedSecret: '99999'
    },
    id: '007d6854e6294e97882b432185c1abd9' }
}, {
  code: 'WIFI-10200',
  message: 'Authentication Profile Mismatch xxxxxx multiple conflict xxxxxx',
  object: 'radiusProfiles.authRadius',
  value: {
    primary: {
      ip: '1.1.1.1',
      port: 20,
      sharedSecret: '88888'
    },
    id: '007d6854e6294e97882b432185c1abd9' }
}]

async function fillInBeforeSettings (networkName: string) {
  const insertInput = screen.getByLabelText(/Network Name/)
  fireEvent.change(insertInput, { target: { value: networkName } })
  fireEvent.blur(insertInput)
  const validating = await screen.findByRole('img', { name: 'loading' })
  await waitForElementToBeRemoved(validating, { timeout: 7000 })
  await userEvent.click(screen.getByRole('radio', { name: /802.1X standard/ }))
  await userEvent.click(screen.getByText('Next'))
  await screen.findByRole('heading', { level: 3, name: 'AAA Settings' })
  await userEvent.click((await screen.findAllByRole('combobox'))[1])
  await userEvent.click((await screen.findAllByTitle('test1'))[0])
}

async function fillInAfterSettings (checkSummary: Function) {
  await userEvent.click(screen.getByText('Next'))
  await screen.findByRole('heading', { level: 3, name: 'Venues' })
  await userEvent.click(screen.getByText('Next'))
  await screen.findByRole('heading', { level: 3, name: 'Summary' })

  checkSummary()
  const finish = screen.getByText('Finish')
  await userEvent.click(finish)
  await waitForElementToBeRemoved(finish)
}

describe('NetworkForm', () => {
  beforeEach(() => {
    networkDeepResponse.name = 'AAA network test'
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
        (_, res, ctx) => res(ctx.json(cloudpathResponse))),
      rest.post(CommonUrlsInfo.validateRadius.url,
        (_, res, ctx) => res(ctx.json(successResponse))),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venueListResponse))),
      rest.get(AaaUrls.getAAAPolicyList.url,
        (_, res, ctx) => res(ctx.json([{ id: '1', name: 'test1', type: 'AUTHENTICATION', primary: {
          ip: '1.1.1.1', port: '123', sharedSecret: 'xxxxxxxx'
        } }]))),
      rest.get(WifiUrlsInfo.getNetwork.url,
        (_, res, ctx) => res(ctx.json(networkDeepResponse))),
      rest.post(CommonUrlsInfo.getNetworkDeepList.url,
        (_, res, ctx) => res(ctx.json({ response: [networkDeepResponse] })))
    )
  })

  const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

  it.skip('should create AAA network successfully', async () => {
    render(<Provider><NetworkForm /></Provider>, { route: { params } })
    await fillInBeforeSettings('AAA network test')
    await userEvent.click((await screen.findAllByRole('combobox'))[0])
    await userEvent.click((await screen.findAllByTitle('test1'))[0])
    const toggle = screen.getAllByRole('switch')
    fireEvent.click(toggle[0])
    fireEvent.click(toggle[0])
    await fillInAfterSettings(async () => {
    })
  })

  it.skip('should render Network AAA diagram with AAA buttons', async () => {
    render(<Provider><NetworkForm /></Provider>, { route: { params } })

    await fillInBeforeSettings('AAA network test')

    let toggle = screen.getAllByRole('switch', { checked: false })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      await userEvent.click(toggle[0]) // Proxy Service
      await userEvent.click(toggle[1]) // Accounting Service
    })

    let diagram = screen.getAllByAltText('Enterprise AAA (802.1X)')
    let authBtn = screen.getByRole('button', { name: 'Authentication Service' })
    let accBtn = screen.getByRole('button', { name: 'Accounting Service' })
    expect(authBtn).toBeVisible()
    expect(authBtn).toBeDisabled()
    expect(accBtn).toBeVisible()
    expect(diagram[1].src).toContain('aaa.png')

    await userEvent.click(accBtn)
    diagram = screen.getAllByAltText('Enterprise AAA (802.1X)')
    authBtn = screen.getByRole('button', { name: 'Authentication Service' })
    expect(diagram[1].src).toContain('aaa.png')
    expect(accBtn).not.toBeDisabled()

    await userEvent.click(authBtn)
    diagram = screen.getAllByAltText('Enterprise AAA (802.1X)')
    expect(diagram[1].src).toContain('aaa.png')
  })
})


describe('Server Configuration Conflict', () => {
  beforeEach(() => {
    networkDeepResponse.name = 'AAA network test'
    mockServer.use(
      rest.get(CommonUrlsInfo.getAllUserSettings.url,
        (_, res, ctx) => res(ctx.json({ COMMON: '{}' }))),
      rest.post(CommonUrlsInfo.getNetworksVenuesList.url,
        (_, res, ctx) => res(ctx.json(venuesResponse))),
      rest.post(CommonUrlsInfo.getVMNetworksList.url,
        (_, res, ctx) => res(ctx.json(networksResponse))),
      rest.post(WifiUrlsInfo.addNetworkDeep.url.replace('?quickAck=true', ''),
        (_, res, ctx) => res(ctx.json(successResponse))),
      rest.get(CommonUrlsInfo.getCloudpathList.url,
        (_, res, ctx) => res(ctx.json(cloudpathResponse))),
      rest.post(CommonUrlsInfo.validateRadius.url,
        (_, res, ctx) => res(ctx.json(successResponse))),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venueListResponse))),
      rest.get(AaaUrls.getAAAPolicyList.url,
        (_, res, ctx) => res(ctx.json([{ id: '1', name: 'test1', type: 'AUTHENTICATION' }]))),
      rest.get(WifiUrlsInfo.getNetwork.url,
        (_, res, ctx) => res(ctx.json(networkDeepResponse))),
      rest.post(CommonUrlsInfo.getNetworkDeepList.url,
        (_, res, ctx) => res(ctx.json({ response: [networkDeepResponse] })))
    )
  })

  afterEach(() => Modal.destroyAll())

  const { $t } = useIntl()
  const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }


  it('should not open Server Configuration Conflict Modal', async () => {
    mockServer.use(
      rest.post(CommonUrlsInfo.validateRadius.url,
        (_, res, ctx) => {
          return res(ctx.status(404), ctx.json({}))
        })
    )
    render(<Provider><NetworkForm /></Provider>, { route: { params } })

    await fillInBeforeSettings('AAA network test')
    await userEvent.click(screen.getByText('Next'))
  })

  it('should open Modal with correct error message', async () => {
    mockServer.use(
      rest.post(CommonUrlsInfo.validateRadius.url,
        (_, res, ctx) => {
          return res(ctx.status(422), ctx.json({ errors: [validateErrorResponse[0]] }))
        })
    )
    render(<Provider><NetworkForm /></Provider>, { route: { params } })

    await fillInBeforeSettings('AAA network test')
    await userEvent.click(screen.getByText('Next'))
    await screen.findByRole('dialog')
    await screen.findByText('Server Configuration Conflict')
    await screen.findByText('Occured Some Error')
  })

  it('should open Modal with auth error message', async () => {
    mockServer.use(
      rest.post(CommonUrlsInfo.validateRadius.url,
        (_, res, ctx) => {
          return res(ctx.status(400), ctx.json({ errors: [validateErrorResponse[1]] }))
        })
    )
    render(<Provider><NetworkForm /></Provider>, { route: { params } })

    await fillInBeforeSettings('AAA network test')
    await userEvent.click(screen.getByText('Next'))
    await screen.findByRole('dialog')
    await screen.findByText('Server Configuration Conflict')
    await screen.findByText($t(radiusErrorMessage['AUTH']))

    await userEvent.click(screen.getByText('Use existing server configuration'))
    await screen.findByRole('heading', { level: 3, name: 'Venues' })
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    await screen.findByRole('heading', { level: 3, name: 'Summary' })
  })

  it('should open Modal with accouting error message', async () => {
    mockServer.use(
      rest.post(CommonUrlsInfo.validateRadius.url,
        (_, res, ctx) => {
          return res(ctx.status(400), ctx.json({ errors: [validateErrorResponse[2]] }))
        })
    )
    render(<Provider><NetworkForm /></Provider>, { route: { params } })

    await fillInBeforeSettings('AAA network test')
    await userEvent.click(screen.getByText('Next'))
    await screen.findByRole('dialog')
    await screen.findByText('Server Configuration Conflict')
    await screen.findByText($t(radiusErrorMessage['ACCOUNTING']))

    await userEvent.click(screen.getByText('Use existing server configuration'))
    await screen.findByRole('heading', { level: 3, name: 'AAA Settings' })
  })

  it('should open Modal with auth and accouting error message', async () => {
    mockServer.use(
      rest.post(CommonUrlsInfo.validateRadius.url,
        (_, res, ctx) => {
          return res(ctx.status(400), ctx.json({ errors: validateErrorResponse.slice(1, 3) }))
        })
    )
    render(<Provider><NetworkForm /></Provider>, { route: { params } })

    await fillInBeforeSettings('AAA network test')
    await userEvent.click(screen.getByText('Next'))
    await screen.findByRole('dialog')
    await screen.findByText('Server Configuration Conflict')
    await screen.findByText($t(radiusErrorMessage['AUTH_AND_ACC']))

    fireEvent.click(
      (await screen.findAllByText('Override the conflicting server configuration'))[0])
    await screen.findByRole('heading', { level: 3, name: 'AAA Settings' })
  })

  it('should open Modal with accouting multiple conflict message', async () => {
    mockServer.use(
      rest.post(CommonUrlsInfo.validateRadius.url,
        (_, res, ctx) => {
          return res(ctx.status(400), ctx.json({ errors: [validateErrorResponse[3]] }))
        })
    )
    render(<Provider><NetworkForm /></Provider>, { route: { params } })

    await fillInBeforeSettings('AAA network test')
    await userEvent.click(screen.getByText('Next'))
    await screen.findByRole('dialog')
    await screen.findByText('Server Configuration Conflict')
    await screen.findByText($t(multipleConflictMessage['ACCOUNTING']))
  })

  it('should open Modal with auth multiple conflict message', async () => {
    mockServer.use(
      rest.post(CommonUrlsInfo.validateRadius.url,
        (_, res, ctx) => {
          return res(ctx.status(400), ctx.json({ errors: [validateErrorResponse[4]] }))
        })
    )
    render(<Provider><NetworkForm /></Provider>, { route: { params } })

    await fillInBeforeSettings('AAA network test')
    await userEvent.click(screen.getByText('Next'))
    await screen.findByRole('dialog')
    await screen.findByText('Server Configuration Conflict')
    await screen.findByText($t(multipleConflictMessage['AUTH']))
  })

  it('should open Modal with auth and accouting multiple conflict message', async () => {
    mockServer.use(
      rest.post(CommonUrlsInfo.validateRadius.url,
        (_, res, ctx) => {
          return res(ctx.status(400), ctx.json({ errors: validateErrorResponse.slice(3, 5) }))
        })
    )
    render(<Provider><NetworkForm /></Provider>, { route: { params } })

    await fillInBeforeSettings('AAA network test')
    await userEvent.click(screen.getByText('Next'))
    await screen.findByRole('dialog')
    await screen.findByText('Server Configuration Conflict')
    await screen.findByText($t(multipleConflictMessage['AUTH_AND_ACC']))
  })

  it('should open Modal with occured error message', async () => {
    mockServer.use(
      rest.post(CommonUrlsInfo.validateRadius.url,
        (_, res, ctx) => {
          return res(ctx.status(400), ctx.json({ errors: [validateErrorResponse[0]] }))
        })
    )
    render(<Provider><NetworkForm /></Provider>, { route: { params } })

    await fillInBeforeSettings('AAA network test')
    await userEvent.click(screen.getByText('Next'))
    await screen.findByRole('dialog')
    await screen.findByText('Occured Error')
    await screen.findByText('Occured Some Error')
  })
})
