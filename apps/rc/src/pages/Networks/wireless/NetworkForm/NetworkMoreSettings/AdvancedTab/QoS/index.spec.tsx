import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { NetworkSaveData, OpenWlanAdvancedCustomization } from '@acx-ui/rc/utils'
import { Provider }                                       from '@acx-ui/store'
import { render, screen, fireEvent, waitFor }             from '@acx-ui/test-utils'


import QoS, { QoSMirroringScope } from '.'


describe('QoS', () => {
  it('should render QoS correctly when add Network', function () {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    const mockWlanData = {
      name: 'test',
      type: 'open',
      wlan: {
        advancedCustomization: {
        } as OpenWlanAdvancedCustomization
      }
    } as NetworkSaveData

    render(
      <Provider>
        <Form>
          <QoS wlanData={mockWlanData} />
        </Form>
      </Provider>,
      { route: { params } }
    )

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

  it('should render QoS correctly when edit Network with qosMirroringEnabled is false',
    function () {
      const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
      const mockWlanData = {
        name: 'test',
        type: 'open',
        wlan: {
          advancedCustomization: {
            qosMirroringEnabled: false
          } as OpenWlanAdvancedCustomization
        }
      } as NetworkSaveData

      render(
        <Provider>
          <Form>
            <QoS wlanData={mockWlanData} />
          </Form>
        </Provider>,
        { route: { params } }
      )

      expect(screen.getByText('QoS')).toBeInTheDocument()
      expect(screen.getByTestId('QuestionMarkCircleOutlined')).toBeInTheDocument()

      const switchElement = screen.getByRole('switch')
      expect(switchElement).toBeInTheDocument()
      expect(switchElement).toBeEnabled()
      expect(switchElement).not.toBeChecked()

      expect(screen.queryByText('QoS Mirroring Scope')).not.toBeInTheDocument()
    })

  it('should render QoS correctly when edit Network with qosMirroringEnabled is true',
    function () {
      const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
      const mockWlanData = {
        name: 'test',
        type: 'open',
        wlan: {
          advancedCustomization: {
            qosMirroringEnabled: true,
            qosMirroringScope: QoSMirroringScope.ALL_CLIENTS
          } as OpenWlanAdvancedCustomization
        }
      } as NetworkSaveData

      render(
        <Provider>
          <Form>
            <QoS wlanData={mockWlanData} />
          </Form>
        </Provider>,
        { route: { params } }
      )

      expect(screen.getByText('QoS')).toBeInTheDocument()
      expect(screen.getByTestId('QuestionMarkCircleOutlined')).toBeInTheDocument()

      const switchElement = screen.getByRole('switch')
      expect(switchElement).toBeInTheDocument()
      expect(switchElement).toBeEnabled()
      expect(switchElement).toBeChecked()

      expect(screen.getByText('QoS Mirroring Scope')).toBeInTheDocument()
      const selectElement = screen.getByRole('combobox')
      expect(selectElement).toBeInTheDocument()
      // eslint-disable-next-line max-len
      expect(screen.getByText('Mirroring for all clients connected to this Wi-Fi network.')).toBeInTheDocument()
    })

  it('should toggle switch button correctly', function () {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    const mockWlanData = {
      name: 'test',
      type: 'open',
      wlan: {
        advancedCustomization: {
          qosMirroringEnabled: true,
          qosMirroringScope: QoSMirroringScope.ALL_CLIENTS
        } as OpenWlanAdvancedCustomization
      }
    } as NetworkSaveData

    render(
      <Provider>
        <Form>
          <QoS wlanData={mockWlanData} />
        </Form>
      </Provider>,
      { route: { params } }
    )

    const switchElement = screen.getByRole('switch')
    expect(switchElement).toBeInTheDocument()
    expect(switchElement).toBeEnabled()
    expect(switchElement).toBeChecked()

    fireEvent.click(switchElement)
    expect(switchElement).not.toBeChecked()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()

    fireEvent.click(switchElement)
    expect(switchElement).toBeChecked()
    expect(screen.getByRole('combobox')).toBeInTheDocument()

    // eslint-disable-next-line max-len
    expect(screen.queryByText('Mirroring for clients sending MSCS (Multimedia and Streaming Control Server) requests')).not.toBeInTheDocument()
    // eslint-disable-next-line max-len
    expect(screen.getByText('Mirroring for all clients connected to this Wi-Fi network.')).toBeInTheDocument()
  })

  it('should select correctly', async function () {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    const mockWlanData = {
      name: 'test',
      type: 'open',
      wlan: {
        advancedCustomization: {
          qosMirroringEnabled: true,
          qosMirroringScope: QoSMirroringScope.ALL_CLIENTS
        } as OpenWlanAdvancedCustomization
      }
    } as NetworkSaveData

    render(
      <Provider>
        <Form>
          <QoS wlanData={mockWlanData} />
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
    expect(screen.queryByText('Mirroring for clients sending MSCS (Multimedia and Streaming Control Server) requests')).not.toBeInTheDocument()
    // eslint-disable-next-line max-len
    expect(screen.getByText('Mirroring for all clients connected to this Wi-Fi network.')).toBeInTheDocument()

    // eslint-disable-next-line max-len
    await screen.findByText('Mirroring for all clients connected to this Wi-Fi network.')
    const selectors = await screen.findByRole('combobox')
    await userEvent.click(selectors)
    await screen.findByText('MSCS requests only')
    fireEvent.click(screen.getByText('MSCS requests only'))

    await waitFor(async () => {
      // eslint-disable-next-line max-len
      expect(screen.getByText('Mirroring for clients sending MSCS (Multimedia and Streaming Control Server) requests')).toBeInTheDocument()
    })
    await waitFor(async () => {
      // eslint-disable-next-line max-len
      expect(screen.queryByText('Mirroring for all clients connected to this Wi-Fi network.')).not.toBeInTheDocument()
    })
  })
})