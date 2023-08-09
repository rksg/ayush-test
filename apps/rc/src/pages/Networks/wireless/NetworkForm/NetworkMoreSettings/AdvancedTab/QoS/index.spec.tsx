import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { Provider }                           from '@acx-ui/store'
import { render, screen, fireEvent, waitFor } from '@acx-ui/test-utils'

import QoS, { findTargetMirroringScopeOption, MirroringScopeOption } from '.'


describe('QoS', () => {
  it('should render Qos correctly', function () {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    const { asFragment } = render(
      <Provider>
        <Form>
          <QoS />
        </Form>
      </Provider>,
      { route: { params } }
    )

    expect(asFragment).toMatchSnapshot()

    expect(screen.getByText('QoS')).toBeInTheDocument()
    expect(screen.getByTestId('QuestionMarkCircleOutlined')).toBeInTheDocument()

    const switchElement = screen.getByRole('switch')
    expect(switchElement).toBeInTheDocument()
    expect(switchElement).toBeEnabled()
    expect(switchElement).toBeChecked()

    expect(screen.getByText('QoS Mirroring Scope')).toBeInTheDocument()
    const selectElement = screen.getByRole('combobox')
    expect(selectElement).toBeInTheDocument()
  })

  it('should toggle switch button correctly', function () {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    render(
      <Provider>
        <Form>
          <QoS />
        </Form>
      </Provider>,
      { route: { params } }
    )

    const switchElement = screen.getByRole('switch')
    expect(switchElement).toBeInTheDocument()
    expect(switchElement).toBeEnabled()
    expect(switchElement).toBeChecked()

    const selectElement = screen.getByRole('combobox')
    expect(selectElement).toBeInTheDocument()
    // eslint-disable-next-line max-len
    expect(screen.getByText('Mirroring for clients sending MSCS (Multimedia and Streaming Control Server) requests')).toBeInTheDocument()
    // eslint-disable-next-line max-len
    expect(screen.queryByText('Mirroring for all clients connected to this Wi-Fi network.')).not.toBeInTheDocument()

    fireEvent.click(switchElement)
    expect(switchElement).not.toBeChecked()
    expect(selectElement).not.toBeInTheDocument()
  })

  it('should select correctly', async function () {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    render(
      <Provider>
        <Form>
          <QoS />
        </Form>
      </Provider>,
      { route: { params } }
    )

    const switchElement = screen.getByRole('switch')
    expect(switchElement).toBeInTheDocument()
    expect(switchElement).toBeEnabled()
    expect(switchElement).toBeChecked()

    const selectElement = screen.getByRole('combobox')
    expect(selectElement).toBeInTheDocument()
    // eslint-disable-next-line max-len
    expect(screen.getByText('Mirroring for clients sending MSCS (Multimedia and Streaming Control Server) requests')).toBeInTheDocument()
    // eslint-disable-next-line max-len
    expect(screen.queryByText('Mirroring for all clients connected to this Wi-Fi network.')).not.toBeInTheDocument()

    // eslint-disable-next-line max-len
    await screen.findByText('Mirroring for clients sending MSCS (Multimedia and Streaming Control Server) requests')
    const selectors = await screen.findByRole('combobox')
    await userEvent.click(selectors)
    await screen.findByText('All clients')
    fireEvent.click(screen.getByText('All clients'))

    await waitFor(async () => {
      // eslint-disable-next-line max-len
      expect(screen.queryByText('Mirroring for clients sending MSCS (Multimedia and Streaming Control Server) requests')).not.toBeInTheDocument()
    })
    await waitFor(async () => {
      // eslint-disable-next-line max-len
      expect(screen.getByText('Mirroring for all clients connected to this Wi-Fi network.')).toBeInTheDocument()
    })
  })
})

describe('findTargetMirroringScopeOption', () => {
  it('should work correctly', function () {
    const mirroringScopeOptions: MirroringScopeOption[] = [
      {
        label: 'mockLabel',
        value: 'MSCS_REQUESTS_ONLY',
        key: 'MSCS_REQUESTS_ONLY',
        message: 'mockMessage'
      },
      {
        label: 'mockLabel',
        value: 'ALL_CLIENTS',
        key: 'ALL_CLIENTS',
        message: 'mockMessage'
      }
    ]
    const expected = mirroringScopeOptions[0]
    const valueOption =
            findTargetMirroringScopeOption(expected.value, mirroringScopeOptions)
    expect(valueOption).toBe(expected)
  })
})