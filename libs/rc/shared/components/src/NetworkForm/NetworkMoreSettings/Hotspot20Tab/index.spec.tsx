import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import {
  Hotspot20AccessNetworkTypeEnum,
  Hotspot20ConnectionCapabilityStatusEnum,
  Hotspot20Ipv4AddressTypeEnum,
  NetworkSaveData
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import NetworkFormContext from '../../NetworkFormContext'

import { Hotspot20Tab } from '.'

const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

describe('Network More Settings - Hotspot 2.0 Tab', () => {
  it('should render Hotspot 2.0 tab correctly', async () => {

    render(
      <Provider>
        <Form>
          <Hotspot20Tab />
        </Form>
      </Provider>,
      { route: { params } }
    )

    expect(await screen.findByText('Accounting Interim Updates')).toBeInTheDocument()
    expect(await screen.findByText('Internet Access')).toBeInTheDocument()
    expect(await screen.findByText('Access Network Type')).toBeInTheDocument()
    expect(await screen.findByText('Private')).toBeInTheDocument()
    expect(await screen.findByText('IPv4 Address')).toBeInTheDocument()
    expect(await screen.findByText('Single NATed private address')).toBeInTheDocument()
    expect(await screen.findByText('Connection Capabilities (11)')).toBeInTheDocument()
    expect(await screen.findByText('ICMP')).toBeInTheDocument()
    expect(await screen.findByText('1 (ICMP)')).toBeInTheDocument()
    expect(await screen.findByText('FTP')).toBeInTheDocument()
    expect(await screen.findByText('SSH')).toBeInTheDocument()
    expect(await screen.findByText('HTTP')).toBeInTheDocument()
    expect(await screen.findByText('Used by TLS VPN')).toBeInTheDocument()
    expect(await screen.findByText('Used by PPTP VPNs')).toBeInTheDocument()
    expect(await screen.findByText('Used by IKEv2 (IPsec VPN)')).toBeInTheDocument()
    expect(await screen.findByText('IPsec VPN')).toBeInTheDocument()
    expect(await screen.findByText('ESP')).toBeInTheDocument()
    expect(await screen.findByText('50 (ESP)')).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Add Protocol' })).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'Add Protocol' }))
  })

  it('should render connection capabilities in edit mode', async () => {
    const data = {
      type: 'hotspot20',
      hotspot20Settings: {
        allowInternetAccess: true,
        accessNetworkType: Hotspot20AccessNetworkTypeEnum.PRIVATE,
        ipv4AddressType: Hotspot20Ipv4AddressTypeEnum.SINGLE_NATED_PRIVATE,
        connectionCapabilities: [
          {
            protocol: 'IGMP',
            protocolNumber: 2,
            port: 20,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'GGP',
            protocolNumber: 3,
            port: 22,
            status: Hotspot20ConnectionCapabilityStatusEnum.OPEN
          },
          {
            protocol: 'ST',
            protocolNumber: 5,
            port: 80,
            status: Hotspot20ConnectionCapabilityStatusEnum.OPEN
          },
          {
            protocol: 'CBT',
            protocolNumber: 7,
            port: 443,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'EGP',
            protocolNumber: 8,
            port: 1723,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'IGP',
            protocolNumber: 9,
            port: 5060,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'BBN-RCC-MON',
            protocolNumber: 10,
            port: 5060,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'NVP-II',
            protocolNumber: 11,
            port: 500,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'PUP',
            protocolNumber: 12,
            port: 4500,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'ARGUS',
            protocolNumber: 13,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'EMCON',
            protocolNumber: 14,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'XNET',
            protocolNumber: 15,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'CHAOS',
            protocolNumber: 16,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'MUX',
            protocolNumber: 18,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'DCN-MEAS',
            protocolNumber: 19,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'HMP',
            protocolNumber: 20,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'PRM',
            protocolNumber: 21,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'XNS-IDP',
            protocolNumber: 22,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          }
        ]
      }
    } as NetworkSaveData

    render(
      <Provider>
        <NetworkFormContext.Provider value={{
          data: data, editMode: true, cloneMode: false, setData: () => {}
        }} >
          <Form>
            <Hotspot20Tab />
          </Form>
        </NetworkFormContext.Provider>
      </Provider>,
      { route: { params } })

    expect(await screen.findByText('Connection Capabilities (18)')).toBeInTheDocument()
    expect(await screen.findByText('2 (IGMP)')).toBeInTheDocument()
    expect(await screen.findByText('3 (GGP)')).toBeInTheDocument()
    expect(await screen.findByText('5 (ST)')).toBeInTheDocument()
    expect(await screen.findByText('7 (CBT)')).toBeInTheDocument()
    expect(await screen.findByText('8 (EGP)')).toBeInTheDocument()
    expect(await screen.findByText('9 (IGP)')).toBeInTheDocument()
    expect(await screen.findByText('10 (BBN-RCC-MON)')).toBeInTheDocument()
    expect(await screen.findByText('11 (NVP-II)')).toBeInTheDocument()
    expect(await screen.findByText('12 (PUP)')).toBeInTheDocument()
    expect(await screen.findByText('13 (ARGUS)')).toBeInTheDocument()
    expect(await screen.findByText('14 (EMCON)')).toBeInTheDocument()
    expect(await screen.findByText('15 (XNET)')).toBeInTheDocument()
    expect(await screen.findByText('16 (CHAOS)')).toBeInTheDocument()
    expect(await screen.findByText('18 (MUX)')).toBeInTheDocument()
    expect(await screen.findByText('19 (DCN-MEAS)')).toBeInTheDocument()
    expect(await screen.findByText('20 (HMP)')).toBeInTheDocument()
    expect(await screen.findByText('21 (PRM)')).toBeInTheDocument()
    expect(await screen.findByText('22 (XNS-IDP)')).toBeInTheDocument()
    const row18 = await screen.findByText('XNS-IDP')
    await userEvent.click(row18)

    let editBtn = await screen.findByText('Edit')
    expect(editBtn).toBeInTheDocument()
    let deleteBtn = await screen.findByText('Delete')
    expect(deleteBtn).toBeInTheDocument()

    await userEvent.click(editBtn)
    const drawer = await screen.findByRole('dialog')
    expect(drawer).toBeInTheDocument()

    expect(await screen.findByText('Edit Protocol')).toBeInTheDocument()
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(drawer).not.toBeVisible()

    await userEvent.click(row18)
    deleteBtn = await screen.findByText('Delete')
    expect(deleteBtn).toBeInTheDocument()
    await userEvent.click(deleteBtn)
    expect(await screen.findByText('Connection Capabilities (17)')).toBeInTheDocument()
  })

  it('should render number if no protocol name at connection capabilities in edit mode'
    , async () => {
      const data = {
        type: 'hotspot20',
        hotspot20Settings: {
          allowInternetAccess: true,
          accessNetworkType: Hotspot20AccessNetworkTypeEnum.PRIVATE,
          ipv4AddressType: Hotspot20Ipv4AddressTypeEnum.SINGLE_NATED_PRIVATE,
          connectionCapabilities: [
            {
              protocol: 'PT',
              protocolNumber: 155,
              port: 0,
              status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
            }
          ]
        }
      } as NetworkSaveData

      render(
        <Provider>
          <NetworkFormContext.Provider value={{
            data: data, editMode: true, cloneMode: false, setData: () => {}
          }} >
            <Form>
              <Hotspot20Tab />
            </Form>
          </NetworkFormContext.Provider>
        </Provider>,
        { route: { params } })

      expect(await screen.findByText('Connection Capabilities (1)')).toBeInTheDocument()
      expect(await screen.findByText('155')).toBeInTheDocument()
    })
})
