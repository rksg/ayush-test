import { Form } from 'antd'

import { useIsSplitOn }                      from '@acx-ui/feature-toggle'
import { Provider }                          from '@acx-ui/store'
import { render, screen, within, fireEvent } from '@acx-ui/test-utils'

import WiFi7 from '.'


describe('WiFi7', () => {
  it('should render correctly when useIsSplitOn return true', function () {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    const { asFragment } = render(
      <Provider>
        <Form>
          <WiFi7 />
        </Form>
      </Provider>, {
        route: { params }
      }
    )

    expect(asFragment).toMatchSnapshot()

    const heading = screen.getByRole('heading')
    expect(heading).toBeInTheDocument()
    within(heading).getByText('Wi-Fi 7')
    within(heading).getByTestId('QuestionMarkCircleOutlined')

    const switchElements = screen.getAllByRole('switch')
    expect(switchElements.length).toBe(2)
    expect(screen.getByText('Enable WiFi 6/ 7')).toBeInTheDocument()
    expect(screen.getByText('Enable Multi-Link operation (MLO)')).toBeInTheDocument()
    expect(switchElements[0]).toBeChecked()
    expect(switchElements[1]).not.toBeChecked()
  })

  it('should not render MLO field item render when useIsSplitOn return false', function () {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    const { asFragment } = render(
      <Provider>
        <Form>
          <WiFi7 />
        </Form>
      </Provider>, {
        route: { params }
      }
    )

    expect(asFragment()).toMatchSnapshot()

    const heading = screen.getByRole('heading')
    expect(heading).toBeInTheDocument()
    within(heading).getByText('Wi-Fi 7')
    within(heading).getByTestId('QuestionMarkCircleOutlined')

    const switchElements = screen.getAllByRole('switch')
    expect(switchElements.length).toBe(1)
    expect(screen.getByText('Enable WiFi 6/ 7')).toBeInTheDocument()
    expect(screen.queryByText('Enable Multi-Li' +
            'nk operation (MLO)')).not.toBeInTheDocument()
  })

  it('should switch enable wifi toggle correctly', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    render(
      <Provider>
        <Form>
          <WiFi7 />
        </Form>
      </Provider>, {
        route: { params }
      }
    )

    const switchElements = screen.getAllByRole('switch')
    fireEvent.click(switchElements[0])
    expect(switchElements[0]).not.toBeChecked()
    expect(switchElements[1]).not.toBeChecked()

    fireEvent.click(switchElements[0])
    expect(switchElements[0]).toBeChecked()
    expect(switchElements[1]).not.toBeChecked()
  })

  it('should switch enable mlo toggle correctly', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    render(
      <Provider>
        <Form>
          <WiFi7 />
        </Form>
      </Provider>, {
        route: { params }
      }
    )

    const switchElements = screen.getAllByRole('switch')
    expect(switchElements[0]).toBeChecked()
    expect(switchElements[1]).not.toBeChecked()
    fireEvent.click(switchElements[1])
    expect(switchElements[0]).toBeChecked()
    expect(switchElements[1]).toBeChecked()

    const checkboxElememt = screen.getAllByRole('checkbox')
    expect(checkboxElememt.length).toBe(3)
    expect(checkboxElememt[0]).toBeChecked()
    expect(checkboxElememt[1]).toBeChecked()
    expect(checkboxElememt[2]).not.toBeChecked()
  })

  it('should show error text when select only 1 band', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    render(
      <Provider>
        <Form>
          <WiFi7 />
        </Form>
      </Provider>, {
        route: { params }
      }
    )

    const switchElements = screen.getAllByRole('switch')
    expect(switchElements[0]).toBeChecked()
    expect(switchElements[1]).not.toBeChecked()
    fireEvent.click(switchElements[1])
    expect(switchElements[0]).toBeChecked()
    expect(switchElements[1]).toBeChecked()

    const checkboxElememt = screen.getAllByRole('checkbox')
    expect(checkboxElememt.length).toBe(3)
    expect(checkboxElememt[0]).toBeChecked()
    expect(checkboxElememt[1]).toBeChecked()
    expect(checkboxElememt[2]).not.toBeChecked()

    fireEvent.click(checkboxElememt[0])
    expect(screen.getByText('At least 2 bands are selected')).toBeInTheDocument()
  })

  it('should show disable the un-selected item when a;ready select 2 bands', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    render(
      <Provider>
        <Form>
          <WiFi7 />
        </Form>
      </Provider>, {
        route: { params }
      }
    )

    const switchElements = screen.getAllByRole('switch')
    expect(switchElements[0]).toBeChecked()
    expect(switchElements[1]).not.toBeChecked()
    fireEvent.click(switchElements[1])
    expect(switchElements[0]).toBeChecked()
    expect(switchElements[1]).toBeChecked()

    const checkboxElememt = screen.getAllByRole('checkbox')
    expect(checkboxElememt.length).toBe(3)
    expect(checkboxElememt[0]).toBeChecked()
    expect(checkboxElememt[1]).toBeChecked()
    expect(checkboxElememt[2]).not.toBeChecked()
    expect(checkboxElememt[2]).toBeDisabled()

    fireEvent.click(checkboxElememt[0])
    expect(screen.getByText('At least 2 bands are selected')).toBeInTheDocument()

    fireEvent.click(checkboxElememt[0])
    expect(checkboxElememt[2]).toBeDisabled()
  })
})