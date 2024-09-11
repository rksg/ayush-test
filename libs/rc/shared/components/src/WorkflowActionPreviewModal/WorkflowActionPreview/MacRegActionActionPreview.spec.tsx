import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo, MacRegListUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                           from '@acx-ui/store'
import { mockServer, render, screen }         from '@acx-ui/test-utils'

import { mockMacReg, mockedNetworkList, mockMacRegList } from './__tests__/fixtures'
import { MacRegActionPreview }                           from './MacRegActionPreview'

const getNetworkList = jest.fn()
const getMacRegList = jest.fn()
describe('MacRegActionPreview', () => {
  const macAddLabel = 'Enter the MAC address of your device here'
  beforeEach( () => {
    mockServer.use(
      rest.get(
        MacRegListUrlsInfo.getMacRegistrationPool.url,
        (req, res, ctx) => {
          getMacRegList()
          return res(ctx.json(mockMacRegList))
        }
      ),
      rest.post(CommonUrlsInfo.getVMNetworksList.url,
        (req, res, ctx) => {
          getNetworkList()
          return res(ctx.json(mockedNetworkList))
        })
    )
  })
  it('default render MAC Address valid', async () => {

    const macAddLabel = 'Enter the MAC address of your device here'
    render(<Provider>
      <MacRegActionPreview data={mockMacReg} />
    </Provider>)
    const macAddField = screen.getByRole('textbox', { name: macAddLabel })
    expect(macAddField).toHaveValue('')
    expect(screen.queryByText('Please enter a valid MAC address')).toBeFalsy()
  })
  it('no alert on valid MAC Address', async () => {

    const macAddLabel = 'Enter the MAC address of your device here'
    render(<Provider>
      <MacRegActionPreview data={mockMacReg} />
    </Provider>)
    const macAddField = screen.getByRole('textbox', { name: macAddLabel })
    expect(macAddField).toBeVisible()
    expect(screen.queryByText('Please enter a valid MAC address')).toBeFalsy()
    await userEvent.type(macAddField, '5f:e7:78:6e:96:68')
    expect(screen.queryByText('Please enter a valid MAC address')).toBeFalsy()
  })
  it('alert on invalid MAC Address', async () => {

    const macAddLabel = 'Enter the MAC address of your device here'
    const macAddErrorMessage= 'Please enter a valid MAC address'
    render(<Provider>
      <MacRegActionPreview data={mockMacReg} />
    </Provider>)
    const macAddField = screen.getByRole('textbox', { name: macAddLabel })
    expect(screen.queryByText('Please enter a valid MAC address')).toBeFalsy()

    await userEvent.type(macAddField, '   ')
    let errorMessage = await screen.findByRole('alert')
    expect(errorMessage).toBeVisible()
    expect(errorMessage.textContent).toEqual(macAddErrorMessage)
    await userEvent.type(macAddField, '5f:e7:e:96:')
    errorMessage = await screen.findByRole('alert')
    expect(errorMessage).toBeVisible()
    expect(errorMessage.textContent).toEqual(macAddErrorMessage)
  })

  it('renders action preview on Next when no MAC address', async () => {
    render(<Provider>
      <MacRegActionPreview data={mockMacReg} />
    </Provider>)
    let btnNext = screen.getByRole('button',{ name: /Next/ })
    expect(btnNext).toBeVisible()
    await userEvent.click(btnNext)
    const macAddField = screen.getByRole('textbox', { name: macAddLabel })
    expect(macAddField).toBeVisible()
  })

  it('renders onboarding page on Next', async () => {
    render(<Provider>
      <MacRegActionPreview data={mockMacReg} />
    </Provider>)

    let macAddField = screen.getByRole('textbox', { name: macAddLabel })
    await userEvent.type(macAddField, '5f:e7:78:6e:96:68')
    let btnNext = screen.getByRole('button', { name: /Next/ })
    expect(btnNext).toBeVisible()
    await userEvent.click(btnNext)
    expect(screen.getByText('5f:e7:78:6e:96:68')).toBeInTheDocument()
    let networks = screen.getByRole('list')
    expect(networks).toBeVisible()
    expect(networks.childNodes.length).toEqual(2)
    expect(networks.childNodes[0].textContent).toEqual('ssid-01')
    expect(networks.childNodes[1].textContent).toEqual('ssid-02')
  })

  it('renders preview page on Back button from onboarding page', async () => {
    render(<Provider>
      <MacRegActionPreview data={mockMacReg} />
    </Provider>)

    let macAddField = screen.getByRole('textbox', { name: macAddLabel })
    await userEvent.type(macAddField, '5f:e7:78:6e:96:68')
    let btnNext = screen.getByRole('button', { name: /Next/ })
    expect(btnNext).toBeVisible()
    await userEvent.click(btnNext)
    expect(screen.getByText('5f:e7:78:6e:96:68')).toBeInTheDocument()
    let btnBack = screen.getByRole('button', { name: /Back/ })
    expect(btnBack).toBeVisible()
    await userEvent.click(btnBack)
    macAddField = screen.getByRole('textbox', { name: macAddLabel })
  })
})
