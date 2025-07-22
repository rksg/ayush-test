import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo, MacRegListUrlsInfo }  from '@acx-ui/rc/utils'
import { Provider }                            from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { mockMacReg, mockedNetworkList, mockMacRegList, mockInvalidMacReg } from './__tests__/fixtures'
import { MacRegActionPreview }                                              from './MacRegActionPreview'

const getNetworkList = jest.fn()
const getMacRegList = jest.fn()
describe('MacRegActionPreview', () => {
  const macAddLabel = 'Enter the MAC address of your device here'
  beforeEach( () => {
    getMacRegList.mockClear()
    getNetworkList.mockClear()

    mockServer.use(
      rest.get(
        MacRegListUrlsInfo.getMacRegistrationPool.url,
        (_, res, ctx) => {
          getMacRegList()
          return res(ctx.json(mockMacRegList))
        }
      ),
      rest.post(CommonUrlsInfo.getVMNetworksList.url,
        (_, res, ctx) => {
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

    await waitFor(() => expect(getMacRegList).toHaveBeenCalled())
    await waitFor(() => expect(getNetworkList).toHaveBeenCalled())

    const macAddField = screen.getByRole('textbox', { name: macAddLabel })
    expect(macAddField).toHaveValue('')
    expect(screen.queryByText('This field is invalid')).toBeFalsy()
  })
  it('invalid mac reg does not call mac reg list', async () => {

    const macAddLabel = 'Enter the MAC address of your device here'
    render(<Provider>
      <MacRegActionPreview data={mockInvalidMacReg} />
    </Provider>)

    await waitFor(() => expect(getMacRegList).not.toHaveBeenCalled())
    await waitFor(() => expect(getNetworkList).not.toHaveBeenCalled())

    const macAddField = screen.getByRole('textbox', { name: macAddLabel })
    expect(macAddField).toHaveValue('')
    expect(screen.queryByText('This field is invalid')).toBeFalsy()
  })

  it('no alert on valid MAC Address', async () => {

    const macAddLabel = 'Enter the MAC address of your device here'
    render(<Provider>
      <MacRegActionPreview data={mockMacReg} />
    </Provider>)
    await waitFor(() => expect(getNetworkList).toHaveBeenCalled())

    const macAddField = screen.getByRole('textbox', { name: macAddLabel })
    expect(macAddField).toBeVisible()
    expect(screen.queryByText('This field is invalid')).toBeFalsy()
    await userEvent.type(macAddField, '5f:e7:78:6e:96:68')
    expect(screen.queryByText('This field is invalid')).toBeFalsy()
  })
  it('alert on invalid MAC Address', async () => {

    const macAddLabel = 'Enter the MAC address of your device here'
    const macAddErrorMessage= 'This field is invalid'
    render(<Provider>
      <MacRegActionPreview data={mockMacReg} />
    </Provider>)
    await waitFor(() => expect(getNetworkList).toHaveBeenCalled())

    const macAddField = screen.getByRole('textbox', { name: macAddLabel })
    expect(screen.queryByText('This field is invalid')).toBeFalsy()

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
    await waitFor(() => expect(getNetworkList).toHaveBeenCalled())

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
    await waitFor(() => expect(getNetworkList).toHaveBeenCalled())

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

  it('renders network on select network', async () => {
    render(<Provider>
      <MacRegActionPreview data={mockMacReg} />
    </Provider>)
    await waitFor(() => expect(getNetworkList).toHaveBeenCalled())

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
    let nw0 = screen.getByTestId('lnw-0')
    await userEvent.click(nw0)
    screen.getByRole('list')
    networks = screen.getByRole('list')
    expect(networks).toBeVisible()
    expect(networks.childNodes.length).toEqual(1)
    nw0 = screen.getByTestId('lnw-0')
    await userEvent.click(nw0)
    screen.getByRole('list')
    networks = screen.getByRole('list')
    expect(networks).toBeVisible()
    expect(networks.childNodes.length).toEqual(2)
  })

  it('renders preview page on Back button from onboarding page', async () => {
    render(<Provider>
      <MacRegActionPreview data={mockMacReg} />
    </Provider>)
    await waitFor(() => expect(getNetworkList).toHaveBeenCalled())

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
