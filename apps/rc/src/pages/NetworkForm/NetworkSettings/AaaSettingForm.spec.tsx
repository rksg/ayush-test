import '@testing-library/jest-dom'
import userEvent   from '@testing-library/user-event'
import { rest }    from 'msw'
import { useIntl } from 'react-intl'

import { CommonUrlsInfo }                                                        from '@acx-ui/rc/utils'
import { Provider }                                                              from '@acx-ui/store'
import { act, mockServer, render, screen, fireEvent, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import {
  venuesResponse,
  networksResponse,
  successResponse,
  cloudpathResponse
} from '../__tests__/fixtures'
import { radiusErrorMessage, multipleConflictMessage } from '../contentsMap'
import { NetworkForm }                                 from '../NetworkForm'

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
  const insertInput = screen.getByLabelText('Network Name')
  fireEvent.change(insertInput, { target: { value: networkName } })
  fireEvent.blur(insertInput)

  const validating = await screen.findByRole('img', { name: 'loading' })
  await waitForElementToBeRemoved(validating, { timeout: 7000 })

  await userEvent.click(screen.getByRole('radio', { name: /802.1X standard/ }))
  await userEvent.click(screen.getByText('Next'))

  await screen.findByRole('heading', { level: 3, name: 'AAA Settings' })
}

async function fillInAfterSettings (checkSummary: Function) {
  await userEvent.click(screen.getByText('Next'))
  const validating = await screen.findByRole('img', { name: 'loading' })
  await waitForElementToBeRemoved(validating)
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
        (_, res, ctx) => res(ctx.json(cloudpathResponse))),
      rest.post(CommonUrlsInfo.validateRadius.url,
        (_, res, ctx) => res(ctx.json(successResponse)))
    )
  })

  const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

  it('should create AAA network successfully', async () => {
    const { asFragment } = render(<Provider><NetworkForm /></Provider>, { route: { params } })
    expect(asFragment()).toMatchSnapshot()

    await fillInBeforeSettings('AAA network test')

    const ipTextbox = screen.getByLabelText('IP Address')
    fireEvent.change(ipTextbox, { target: { value: '192.168.1.1' } })

    const portTextbox = screen.getByLabelText('Port')
    fireEvent.change(portTextbox, { target: { value: '1111' } })

    const secretTextbox = screen.getByLabelText('Shared secret')
    fireEvent.change(secretTextbox, { target: { value: 'secret-1' } })

    await fillInAfterSettings(async () => {
      expect(screen.getByText('AAA network test')).toBeVisible()
      expect(screen.getByText('192.168.1.1:1111')).toBeVisible()
      expect(screen.getAllByDisplayValue('secret-1')).toHaveLength(2)
    })
  })

  it('should create AAA network with secondary server', async () => {
    render(<Provider><NetworkForm /></Provider>, { route: { params } })

    await fillInBeforeSettings('AAA network test')

    const ipTextbox = screen.getByLabelText('IP Address')
    fireEvent.change(ipTextbox, { target: { value: '192.168.1.1' } })

    const portTextbox = screen.getByLabelText('Port')
    fireEvent.change(portTextbox, { target: { value: 1111 } })

    const secretTextbox = screen.getByLabelText('Shared secret')
    fireEvent.change(secretTextbox, { target: { value: 'secret-1' } })

    await userEvent.click(screen.getByText('Add Secondary Server'))

    const secondaryIpTextbox = screen.getAllByLabelText('IP Address')[1]
    fireEvent.change(secondaryIpTextbox, { target: { value: '192.168.2.2' } })

    const secondaryPortTextbox = screen.getAllByLabelText('Port')[1]
    fireEvent.change(secondaryPortTextbox, { target: { value: 2222 } })

    const secondarySecretTextbox = screen.getAllByLabelText('Shared secret')[1]
    fireEvent.change(secondarySecretTextbox, { target: { value: 'secret-2' } })

    await fillInAfterSettings(() => {
      expect(screen.getByText('AAA network test')).toBeVisible()
      expect(screen.getByText('192.168.1.1:1111')).toBeVisible()
      expect(screen.getAllByDisplayValue('secret-1')).toHaveLength(2)

      expect(screen.getByText('192.168.2.2:2222')).toBeVisible()
      expect(screen.getAllByDisplayValue('secret-2')).toHaveLength(2)
    })
  })

  it('should render Network AAA diagram with AAA buttons', async () => {
    render(<Provider><NetworkForm /></Provider>, { route: { params } })

    await fillInBeforeSettings('AAA network test')

    let toggle = screen.getAllByRole('switch', { checked: false })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      await userEvent.click(toggle[1]) // Proxy Service
      await userEvent.click(toggle[2]) // Accounting Service
    })

    let diagram = screen.getAllByAltText('Enterprise AAA (802.1X)')
    let authBtn = screen.getByRole('button', { name: 'Authentication Service' })
    let accBtn = screen.getByRole('button', { name: 'Accounting Service' })
    expect(authBtn).toBeVisible()
    expect(authBtn).toBeDisabled()
    expect(accBtn).toBeVisible()
    expect(diagram[1].src).toContain('aaa-proxy.png')

    await userEvent.click(accBtn)
    diagram = screen.getAllByAltText('Enterprise AAA (802.1X)')
    authBtn = screen.getByRole('button', { name: 'Authentication Service' })
    expect(diagram[1].src).toContain('aaa.png')
    expect(accBtn).not.toBeDisabled()

    await userEvent.click(authBtn)
    diagram = screen.getAllByAltText('Enterprise AAA (802.1X)')
    expect(diagram[1].src).toContain('aaa-proxy.png')
  })
})


describe('Server Configuration Conflict', () => {
  let dialog

  afterEach(async () => dialog?.remove())

  const { $t } = useIntl()
  const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

  async function fillInAuthIpSettings () {
    const ipTextbox = screen.getByLabelText('IP Address')
    fireEvent.change(ipTextbox, { target: { value: '1.1.1.1' } })

    const portTextbox = screen.getByLabelText('Port')
    fireEvent.change(portTextbox, { target: { value: '10' } })

    const secretTextbox = screen.getByLabelText('Shared secret')
    fireEvent.change(secretTextbox, { target: { value: 'secret-1' } })

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    
    const validating = await screen.findByRole('img', { name: 'loading' })
    await waitForElementToBeRemoved(validating)
  }

  async function fillInAuthAndAccIpSettings () {
    const toggle = screen.getAllByRole('switch', { checked: false })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      await userEvent.click(toggle[2]) // Accounting Service
    })

    const ipTextbox = screen.getAllByLabelText('IP Address')
    fireEvent.change(ipTextbox[0], { target: { value: '1.1.1.1' } })
    fireEvent.change(ipTextbox[1], { target: { value: '1.1.1.1' } })

    const portTextbox = screen.getAllByLabelText('Port')
    fireEvent.change(portTextbox[0], { target: { value: '10' } })
    fireEvent.change(portTextbox[1], { target: { value: '20' } })

    const secretTextbox = screen.getAllByLabelText('Shared secret')
    fireEvent.change(secretTextbox[0], { target: { value: 'secret-1' } })
    fireEvent.change(secretTextbox[1], { target: { value: 'secret-2' } })

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    const validating = await screen.findByRole('img', { name: 'loading' })
    await waitForElementToBeRemoved(validating)
  }

  it('should not open Server Configuration Conflict Modal', async () => {
    mockServer.use(
      rest.post(CommonUrlsInfo.validateRadius.url,
        (_, res, ctx) => {
          return res(ctx.status(404), ctx.json({}))
        })
    )
    render(<Provider><NetworkForm /></Provider>, { route: { params } })
    
    await fillInBeforeSettings('AAA network test')
    await fillInAuthIpSettings()
    await screen.findByRole('heading', { level: 3, name: 'Venues' })
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
    await fillInAuthIpSettings()

    dialog = await screen.findByRole('dialog')
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
    await fillInAuthIpSettings()

    dialog = await screen.findByRole('dialog')
    await screen.findByText('Server Configuration Conflict')
    await screen.findByText($t(radiusErrorMessage['AUTH']))
    
    await userEvent.click(screen.getByText('Use existing server configuration'))
    await screen.findByRole('heading', { level: 3, name: 'Venues' })
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    await screen.findByRole('heading', { level: 3, name: 'Summary' })
    expect(screen.getByText('1.1.1.1:10')).toBeVisible()
    expect(screen.getAllByDisplayValue('99999')).toHaveLength(2)
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
    await fillInAuthAndAccIpSettings()

    dialog = await screen.findByRole('dialog')
    await screen.findByText('Server Configuration Conflict')
    await screen.findByText($t(radiusErrorMessage['ACCOUNTING']))

    await userEvent.click(screen.getByText('Use existing server configuration'))
    await screen.findByRole('heading', { level: 3, name: 'Venues' })
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    await screen.findByRole('heading', { level: 3, name: 'Summary' })
    expect(screen.getByText('1.1.1.1:20')).toBeVisible()
    expect(screen.getAllByDisplayValue('88888')).toHaveLength(2)
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
    await fillInAuthAndAccIpSettings()

    dialog = await screen.findByRole('dialog')
    await screen.findByText('Server Configuration Conflict')
    await screen.findByText($t(radiusErrorMessage['AUTH_AND_ACC']))

    fireEvent.click(screen.getByText('Override the conflicting server configuration'))
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
    await fillInAuthAndAccIpSettings()

    dialog = await screen.findByRole('dialog')
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
    await fillInAuthIpSettings()

    dialog = await screen.findByRole('dialog')
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
    await fillInAuthAndAccIpSettings()

    dialog = await screen.findByRole('dialog')
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
    await fillInAuthIpSettings()

    dialog = await screen.findByRole('dialog')
    await screen.findByText('Occured Error')
    await screen.findByText('Occured Some Error')
  })
})
