import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo }                                                        from '@acx-ui/rc/utils'
import { Provider }                                                              from '@acx-ui/store'
import { act, mockServer, render, screen, fireEvent, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import {
  venuesResponse,
  networksResponse,
  successResponse,
  cloudpathResponse
} from '../__tests__/fixtures'
import { NetworkForm } from '../NetworkForm'

async function fillInBeforeSettings (networkName: string) {
  const insertInput = screen.getByLabelText('Network Name')
  fireEvent.change(insertInput, { target: { value: networkName } })
  fireEvent.blur(insertInput)

  const validating = await screen.findByRole('img', { name: 'loading' })
  await waitForElementToBeRemoved(validating, { timeout: 7000 })

  userEvent.click(screen.getByRole('radio', { name: /802.1X standard/ }))
  userEvent.click(screen.getByText('Next'))

  await screen.findByRole('heading', { level: 3, name: 'AAA Settings' })
}

async function fillInAfterSettings (checkSummary: Function) {
  userEvent.click(screen.getByText('Next'))
  await screen.findByRole('heading', { level: 3, name: 'Venues' })

  userEvent.click(screen.getByText('Next'))
  await screen.findByRole('heading', { level: 3, name: 'Summary' })

  checkSummary()
  const finish = screen.getByText('Finish')
  userEvent.click(finish)
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
        (_, res, ctx) => res(ctx.json(cloudpathResponse)))
    )
  })

  const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

  it('should create AAA network successfully', async () => {
    const { asFragment } = render(<Provider><NetworkForm /></Provider>, { route: { params } })
    expect(asFragment()).toMatchSnapshot()

    await fillInBeforeSettings('AAA network test')

    const ipTextbox = screen.getByLabelText('IP Address')
    fireEvent.change(ipTextbox, { target: { value: '111.111.111.111' } })

    const portTextbox = screen.getByLabelText('Port')
    fireEvent.change(portTextbox, { target: { value: '1111' } })

    const secretTextbox = screen.getByLabelText('Shared secret')
    fireEvent.change(secretTextbox, { target: { value: 'secret-1' } })

    await fillInAfterSettings(async () => {
      expect(screen.getByText('AAA network test')).toBeVisible()
      expect(screen.getByText('111.111.111.111:1111')).toBeVisible()
      expect(screen.getAllByDisplayValue('secret-1')).toHaveLength(2)
    })
  })

  it('should create AAA network with secondary server', async () => {
    render(<Provider><NetworkForm /></Provider>, { route: { params } })

    await fillInBeforeSettings('AAA network test')

    const ipTextbox = screen.getByLabelText('IP Address')
    fireEvent.change(ipTextbox, { target: { value: '111.111.111.111' } })

    const portTextbox = screen.getByLabelText('Port')
    fireEvent.change(portTextbox, { target: { value: 1111 } })

    const secretTextbox = screen.getByLabelText('Shared secret')
    fireEvent.change(secretTextbox, { target: { value: 'secret-1' } })

    fireEvent.click(screen.getByText('Add Secondary Server'))

    const secondaryIpTextbox = screen.getAllByLabelText('IP Address')[1]
    fireEvent.change(secondaryIpTextbox, { target: { value: '222.222.222.222' } })

    const secondaryPortTextbox = screen.getAllByLabelText('Port')[1]
    fireEvent.change(secondaryPortTextbox, { target: { value: '2222' } })

    const secondarySecretTextbox = screen.getAllByLabelText('Shared secret')[1]
    fireEvent.change(secondarySecretTextbox, { target: { value: 'secret-2' } })

    await fillInAfterSettings(() => {
      expect(screen.getByText('AAA network test')).toBeVisible()
      expect(screen.getByText('111.111.111.111:1111')).toBeVisible()
      expect(screen.getAllByDisplayValue('secret-1')).toHaveLength(2)

      expect(screen.getByText('222.222.222.222:2222')).toBeVisible()
      expect(screen.getAllByDisplayValue('secret-2')).toHaveLength(2)
    })
  })

  it('should render Network AAA diagram with AAA buttons', async () => {
    render(<Provider><NetworkForm /></Provider>, { route: { params } })

    await fillInBeforeSettings('AAA network test')

    let toggle = screen.getAllByRole('switch', { checked: false })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.click(toggle[1]) // Proxy Service
      fireEvent.click(toggle[2]) // Accounting Service
    })

    let diagram = screen.getAllByAltText('Enterprise AAA (802.1X)')
    let authBtn = screen.getByRole('button', { name: 'Authentication Service' })
    let accBtn = screen.getByRole('button', { name: 'Accounting Service' })
    expect(authBtn).toBeVisible()
    expect(authBtn).toBeDisabled()
    expect(accBtn).toBeVisible()
    expect(diagram[1].src).toContain('aaa-proxy.png')

    fireEvent.click(accBtn)
    diagram = screen.getAllByAltText('Enterprise AAA (802.1X)')
    authBtn = screen.getByRole('button', { name: 'Authentication Service' })
    expect(diagram[1].src).toContain('aaa.png')
    expect(accBtn).not.toBeDisabled()

    fireEvent.click(authBtn)
    diagram = screen.getAllByAltText('Enterprise AAA (802.1X)')
    expect(diagram[1].src).toContain('aaa-proxy.png')
  })
})
