import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

import { Incident }                                  from '@acx-ui/analytics/utils'
import * as config                                   from '@acx-ui/config'
import { dataApiURL, Provider, store }               from '@acx-ui/store'
import { render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'
import { mockGraphqlQuery }                          from '@acx-ui/test-utils'

import { mockRogueAPs } from '../__tests__/fixtures'

import { RogueAPsDrawer, RogueAPsDrawerLink } from './RogueAPsDrawer'
import { drawerApi }                          from './services'

jest.mock('@acx-ui/config')
const get = jest.mocked(config.get)
const mockTenantLink = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  TenantLink: (props: { to: string, children: React.ReactNode }) => mockTenantLink(props)
}))

beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}))
afterAll(() => jest.resetAllMocks())

describe('RogueAPsDrawer', () => {
  const props = {
    id: 'id',
    impactedStart: (new Date('2023-11-25T00:00:00Z')).toISOString(),
    impactedEnd: (new Date('2023-11-26T00:00:00Z')).toISOString(),
    visible: true,
    onClose: jest.fn()
  }
  beforeEach(() => {
    store.dispatch(drawerApi.util.resetApiState())
    get.mockReturnValue('')
    mockTenantLink.mockImplementation(({ to, children, ...props }) => {
      const isRai = get('IS_MLISA_SA') === 'true'
      const prefix = isRai ? '/ai' : '/tenant-id/t'
      const href = `${prefix}${to.startsWith('/') ? '' : '/'}${to}`
      return <a href={href} {...props}>{children}</a>
    })
  })
  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'rogueAPs', {
      data: { incident: { rogueAPs: mockRogueAPs, rogueAPCount: mockRogueAPs.length } } })
    render(<Provider><RogueAPsDrawer {...props}/></Provider>, { route: true })
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })
  it('should render drawer', async () => {
    mockGraphqlQuery(dataApiURL, 'rogueAPs', {
      data: { incident: { rogueAPs: mockRogueAPs, rogueAPCount: mockRogueAPs.length } } })
    render(<Provider><RogueAPsDrawer {...props}/></Provider>, { route: true })
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

    screen.getByText('4 Rogue APs')
    screen.getByPlaceholderText(/Search Rogue/)
    screen.getByText(mockRogueAPs[0].rogueApMac)
    screen.getAllByText(mockRogueAPs[0].rogueType)
    screen.getByText(mockRogueAPs[0].apName)
    screen.getByText(mockRogueAPs[0].apMac)
    screen.getByText(`${mockRogueAPs[0].rogueSSID} (2)`)
    screen.getByText(`${mockRogueAPs[0].maxRogueSNR} dB (2)`)

    expect(screen.getAllByRole('link')[0].textContent).toBe(mockRogueAPs[0].apName)
    const links: HTMLAnchorElement[] = screen.getAllByRole('link')
    expect(links[0].href).toBe(
      'http://localhost/tenant-id/t/devices/wifi/70:CA:97:01:9D:F0/details/overview')
  })
  it('should render correct url for RAI', async () => {
    get.mockReturnValue('true')
    mockGraphqlQuery(dataApiURL, 'rogueAPs', {
      data: { incident: { rogueAPs: mockRogueAPs, rogueAPCount: mockRogueAPs.length } } })
    render(<Provider><RogueAPsDrawer {...props}/></Provider>, { route: true })
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

    screen.getByText('4 Rogue APs')
    screen.getByPlaceholderText(/Search Rogue/)
    screen.getByText(mockRogueAPs[0].rogueApMac)
    screen.getAllByText(mockRogueAPs[0].rogueType)
    screen.getByText(mockRogueAPs[0].apName)
    screen.getByText(mockRogueAPs[0].apMac)
    screen.getByText(`${mockRogueAPs[0].rogueSSID} (2)`)
    screen.getByText(`${mockRogueAPs[0].maxRogueSNR} dB (2)`)

    expect(screen.getAllByRole('link')[0].textContent).toBe(mockRogueAPs[0].apName)
    const links: HTMLAnchorElement[] = screen.getAllByRole('link')
    expect(links[0].href).toBe(
      'http://localhost/ai/devices/wifi/70:CA:97:01:9D:F0/details/ai')
  })
  it('should render error', async () => {
    mockGraphqlQuery(dataApiURL, 'rogueAPs', { error: new Error('something went wrong!') })
    render(<Provider><RogueAPsDrawer {...props}/></Provider>, { route: true })
    await screen.findByText('Something went wrong.')
  })
})

describe('RogueAPsDrawerLink', () => {
  const incident = {
    id: 'id',
    impactedStart: (new Date('2023-11-25T00:00:00Z')).toISOString(),
    impactedEnd: (new Date('2023-11-26T00:00:00Z')).toISOString()
  } as Incident
  beforeEach(() => store.dispatch(drawerApi.util.resetApiState()))
  it('should render drawer when clicking', async () => {
    mockGraphqlQuery(dataApiURL, 'rogueAPs', {
      data: { incident: { rogueAPs: mockRogueAPs, rogueAPCount: mockRogueAPs.length } } })
    render(<Provider><RogueAPsDrawerLink incident={incident}>
      Click here</RogueAPsDrawerLink></Provider>, { route: true })
    await userEvent.click(await screen.findByText('Click here'))
    screen.getByText('4 Rogue APs')
  })
  it('should close the drawer', async () => {
    mockGraphqlQuery(dataApiURL, 'rogueAPs', {
      data: { incident: { rogueAPs: mockRogueAPs, rogueAPCount: mockRogueAPs.length } } })
    render(<Provider><RogueAPsDrawerLink incident={incident}>
      Click here</RogueAPsDrawerLink></Provider>, { route: true })
    await userEvent.click(await screen.findByText('Click here'))
    expect(await screen.findByText('4 Rogue APs')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    // eslint-disable-next-line testing-library/no-node-access
    expect(screen.getByRole('dialog').parentNode)
      .toHaveClass('ant-drawer-content-wrapper-hidden')
  })
})
