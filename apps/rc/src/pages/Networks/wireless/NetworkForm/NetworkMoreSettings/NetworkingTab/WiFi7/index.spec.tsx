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
  })

  it('should render correctly when useIsSplitOn return false', function () {
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
    expect(screen.queryByText('Enable Multi-Link operation (MLO)')).not.toBeInTheDocument()
  })

  it('onEnableWiFiChange', function () {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    jest.mock('antd/lib/form/Form', () => ({
      useFormInstance: () => ({
        setFieldValue: jest.fn()
      })
    }))

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
    expect(switchElements.length).toBe(2)
    fireEvent.click(switchElements[0])
    expect(switchElements[0]).toBeChecked()
  })
})