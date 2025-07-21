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

  it.skip('should render connection capabilities in edit mode', async () => {
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
          },
          {
            protocol: 'TRUNK-1',
            protocolNumber: 23,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'TRUNK-2',
            protocolNumber: 24,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'LEAF-1',
            protocolNumber: 25,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'LEAF-2',
            protocolNumber: 26,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'RDP',
            protocolNumber: 27,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'IRTP',
            protocolNumber: 28,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'ISO-TP4',
            protocolNumber: 29,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'NETBLT',
            protocolNumber: 30,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'MFE-NSP',
            protocolNumber: 31,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'MERIT-INP',
            protocolNumber: 32,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'DCCP',
            protocolNumber: 33,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: '3PC',
            protocolNumber: 34,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'IDPR',
            protocolNumber: 35,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'XTP',
            protocolNumber: 36,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'DDP',
            protocolNumber: 37,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'IDPR-CMTP',
            protocolNumber: 38,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'TP',
            protocolNumber: 39,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'IL',
            protocolNumber: 40,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'IPv6',
            protocolNumber: 41,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'SDRP',
            protocolNumber: 42,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'IPv6-Route',
            protocolNumber: 43,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'IPv6-Frag',
            protocolNumber: 44,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'IDRP',
            protocolNumber: 45,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'RSVP',
            protocolNumber: 46,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'GRE',
            protocolNumber: 47,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'DSR',
            protocolNumber: 48,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'BNA',
            protocolNumber: 49,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'ESP',
            protocolNumber: 50,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'AH',
            protocolNumber: 51,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'I-NLSP',
            protocolNumber: 52,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'SWIPE',
            protocolNumber: 53,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'NARP',
            protocolNumber: 54,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'Min-IPv4',
            protocolNumber: 55,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'TLSP',
            protocolNumber: 56,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'SKIP',
            protocolNumber: 57,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'IPv6-ICMP',
            protocolNumber: 58,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'IPv6-NoNxt',
            protocolNumber: 59,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'IPv6-Opts',
            protocolNumber: 60,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'CFTP',
            protocolNumber: 62,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'SAT-EXPAK',
            protocolNumber: 64,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'KRYPTOLAN',
            protocolNumber: 65,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'RVD',
            protocolNumber: 66,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'IPPC',
            protocolNumber: 67,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'SAT-MON',
            protocolNumber: 69,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'VISA',
            protocolNumber: 70,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'IPCV',
            protocolNumber: 71,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'CPNX',
            protocolNumber: 72,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'CPHB',
            protocolNumber: 73,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'WSN',
            protocolNumber: 74,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'PVP',
            protocolNumber: 75,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'BR-SAT-MON',
            protocolNumber: 76,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'SUN-ND',
            protocolNumber: 77,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'WB-MON',
            protocolNumber: 78,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'WB-EXPAK',
            protocolNumber: 79,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'ISO-IP',
            protocolNumber: 80,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'VMTP',
            protocolNumber: 81,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'SECURE-VMTP',
            protocolNumber: 82,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'VINES',
            protocolNumber: 83,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'IPTM',
            protocolNumber: 84,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'NSFNET-IGP',
            protocolNumber: 85,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'DGP',
            protocolNumber: 86,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'TCF',
            protocolNumber: 87,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'EIGRP',
            protocolNumber: 88,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'OSPFIGP',
            protocolNumber: 89,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'Sprite-RPC',
            protocolNumber: 90,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'LARP',
            protocolNumber: 91,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'MTP',
            protocolNumber: 92,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'AX.25',
            protocolNumber: 93,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'IPIP',
            protocolNumber: 94,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'MICP',
            protocolNumber: 95,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'SCC-SP',
            protocolNumber: 96,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'ETHERIP',
            protocolNumber: 97,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'ENCAP',
            protocolNumber: 98,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'GMTP',
            protocolNumber: 100,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'IFMP',
            protocolNumber: 101,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'PNNI',
            protocolNumber: 102,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'PIM',
            protocolNumber: 103,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'ARIS',
            protocolNumber: 104,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'SCPS',
            protocolNumber: 105,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'QNX',
            protocolNumber: 106,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'A/N',
            protocolNumber: 107,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'IPComp',
            protocolNumber: 108,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'SNP',
            protocolNumber: 109,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'Compaq-Peer',
            protocolNumber: 110,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'IPX-in-IP',
            protocolNumber: 111,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'VRRP',
            protocolNumber: 112,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'PGM',
            protocolNumber: 113,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'L2TP',
            protocolNumber: 115,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'DDX',
            protocolNumber: 116,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'IATP',
            protocolNumber: 117,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'STP',
            protocolNumber: 118,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'SRP',
            protocolNumber: 119,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'UTI',
            protocolNumber: 120,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'SMP',
            protocolNumber: 121,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'SM',
            protocolNumber: 122,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'PTP',
            protocolNumber: 123,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'ISIS over IPv4',
            protocolNumber: 124,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'FIRE',
            protocolNumber: 125,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'CRTP',
            protocolNumber: 126,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'CRUDP',
            protocolNumber: 127,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'SSCOPMCE',
            protocolNumber: 128,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'IPLT',
            protocolNumber: 129,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'SPS',
            protocolNumber: 130,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'PIPE',
            protocolNumber: 131,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'SCTP',
            protocolNumber: 132,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'FC',
            protocolNumber: 133,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'RSVP-E2E-IGNORE',
            protocolNumber: 134,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'Mobility Header',
            protocolNumber: 135,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'UDPLite',
            protocolNumber: 136,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'MPLS-in-IP',
            protocolNumber: 137,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'manet',
            protocolNumber: 138,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'HIP',
            protocolNumber: 139,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'Shim6',
            protocolNumber: 140,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'WESP',
            protocolNumber: 141,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'ROHC',
            protocolNumber: 142,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'Ethernet',
            protocolNumber: 143,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'AGGFRAG',
            protocolNumber: 144,
            port: 0,
            status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
          },
          {
            protocol: 'NSH',
            protocolNumber: 145,
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

    expect(await screen.findByText('Connection Capabilities (136)')).toBeInTheDocument()
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
    expect(await screen.findByText('23 (TRUNK-1)')).toBeInTheDocument()
    expect(await screen.findByText('24 (TRUNK-2)')).toBeInTheDocument()
    expect(await screen.findByText('25 (LEAF-1)')).toBeInTheDocument()
    expect(await screen.findByText('26 (LEAF-2)')).toBeInTheDocument()
    expect(await screen.findByText('27 (RDP)')).toBeInTheDocument()
    expect(await screen.findByText('28 (IRTP)')).toBeInTheDocument()
    expect(await screen.findByText('29 (ISO-TP4)')).toBeInTheDocument()
    expect(await screen.findByText('30 (NETBLT)')).toBeInTheDocument()
    expect(await screen.findByText('31 (MFE-NSP)')).toBeInTheDocument()
    expect(await screen.findByText('32 (MERIT-INP)')).toBeInTheDocument()
    expect(await screen.findByText('33 (DCCP)')).toBeInTheDocument()
    expect(await screen.findByText('34 (3PC)')).toBeInTheDocument()
    expect(await screen.findByText('35 (IDPR)')).toBeInTheDocument()
    expect(await screen.findByText('36 (XTP)')).toBeInTheDocument()
    expect(await screen.findByText('37 (DDP)')).toBeInTheDocument()
    expect(await screen.findByText('38 (IDPR-CMTP)')).toBeInTheDocument()
    expect(await screen.findByText('39 (TP)')).toBeInTheDocument()
    expect(await screen.findByText('40 (IL)')).toBeInTheDocument()
    expect(await screen.findByText('41 (IPv6)')).toBeInTheDocument()
    expect(await screen.findByText('42 (SDRP)')).toBeInTheDocument()
    expect(await screen.findByText('43 (IPv6-Route)')).toBeInTheDocument()
    expect(await screen.findByText('44 (IPv6-Frag)')).toBeInTheDocument()
    expect(await screen.findByText('45 (IDRP)')).toBeInTheDocument()
    expect(await screen.findByText('46 (RSVP)')).toBeInTheDocument()
    expect(await screen.findByText('47 (GRE)')).toBeInTheDocument()
    expect(await screen.findByText('48 (DSR)')).toBeInTheDocument()
    expect(await screen.findByText('49 (BNA)')).toBeInTheDocument()
    expect(await screen.findByText('50 (ESP)')).toBeInTheDocument()
    expect(await screen.findByText('51 (AH)')).toBeInTheDocument()
    expect(await screen.findByText('52 (I-NLSP)')).toBeInTheDocument()
    expect(await screen.findByText('53 (SWIPE)')).toBeInTheDocument()
    expect(await screen.findByText('54 (NARP)')).toBeInTheDocument()
    expect(await screen.findByText('55 (Min-IPv4)')).toBeInTheDocument()
    expect(await screen.findByText('56 (TLSP)')).toBeInTheDocument()
    expect(await screen.findByText('57 (SKIP)')).toBeInTheDocument()
    expect(await screen.findByText('58 (IPv6-ICMP)')).toBeInTheDocument()
    expect(await screen.findByText('59 (IPv6-NoNxt)')).toBeInTheDocument()
    expect(await screen.findByText('60 (IPv6-Opts)')).toBeInTheDocument()
    expect(await screen.findByText('62 (CFTP)')).toBeInTheDocument()
    expect(await screen.findByText('64 (SAT-EXPAK)')).toBeInTheDocument()
    expect(await screen.findByText('65 (KRYPTOLAN)')).toBeInTheDocument()
    expect(await screen.findByText('66 (RVD)')).toBeInTheDocument()
    expect(await screen.findByText('67 (IPPC)')).toBeInTheDocument()
    expect(await screen.findByText('69 (SAT-MON)')).toBeInTheDocument()
    expect(await screen.findByText('70 (VISA)')).toBeInTheDocument()
    expect(await screen.findByText('71 (IPCV)')).toBeInTheDocument()
    expect(await screen.findByText('72 (CPNX)')).toBeInTheDocument()
    expect(await screen.findByText('73 (CPHB)')).toBeInTheDocument()
    expect(await screen.findByText('74 (WSN)')).toBeInTheDocument()
    expect(await screen.findByText('75 (PVP)')).toBeInTheDocument()
    expect(await screen.findByText('76 (BR-SAT-MON)')).toBeInTheDocument()
    expect(await screen.findByText('77 (SUN-ND)')).toBeInTheDocument()
    expect(await screen.findByText('78 (WB-MON)')).toBeInTheDocument()
    expect(await screen.findByText('79 (WB-EXPAK)')).toBeInTheDocument()
    expect(await screen.findByText('80 (ISO-IP)')).toBeInTheDocument()
    expect(await screen.findByText('81 (VMTP)')).toBeInTheDocument()
    expect(await screen.findByText('82 (SECURE-VMTP)')).toBeInTheDocument()
    expect(await screen.findByText('83 (VINES)')).toBeInTheDocument()
    expect(await screen.findByText('84 (IPTM)')).toBeInTheDocument()
    expect(await screen.findByText('85 (NSFNET-IGP)')).toBeInTheDocument()
    expect(await screen.findByText('86 (DGP)')).toBeInTheDocument()
    expect(await screen.findByText('87 (TCF)')).toBeInTheDocument()
    expect(await screen.findByText('88 (EIGRP)')).toBeInTheDocument()
    expect(await screen.findByText('89 (OSPFIGP)')).toBeInTheDocument()
    expect(await screen.findByText('90 (Sprite-RPC)')).toBeInTheDocument()
    expect(await screen.findByText('91 (LARP)')).toBeInTheDocument()
    expect(await screen.findByText('92 (MTP)')).toBeInTheDocument()
    expect(await screen.findByText('93 (AX.25)')).toBeInTheDocument()
    expect(await screen.findByText('94 (IPIP)')).toBeInTheDocument()
    expect(await screen.findByText('95 (MICP)')).toBeInTheDocument()
    expect(await screen.findByText('96 (SCC-SP)')).toBeInTheDocument()
    expect(await screen.findByText('97 (ETHERIP)')).toBeInTheDocument()
    expect(await screen.findByText('98 (ENCAP)')).toBeInTheDocument()
    expect(await screen.findByText('100 (GMTP)')).toBeInTheDocument()
    expect(await screen.findByText('101 (IFMP)')).toBeInTheDocument()
    expect(await screen.findByText('102 (PNNI)')).toBeInTheDocument()
    expect(await screen.findByText('103 (PIM)')).toBeInTheDocument()
    expect(await screen.findByText('104 (ARIS)')).toBeInTheDocument()
    expect(await screen.findByText('105 (SCPS)')).toBeInTheDocument()
    expect(await screen.findByText('106 (QNX)')).toBeInTheDocument()
    expect(await screen.findByText('107 (A/N)')).toBeInTheDocument()
    expect(await screen.findByText('108 (IPComp)')).toBeInTheDocument()
    expect(await screen.findByText('109 (SNP)')).toBeInTheDocument()
    expect(await screen.findByText('110 (Compaq-Peer)')).toBeInTheDocument()
    expect(await screen.findByText('111 (IPX-in-IP)')).toBeInTheDocument()
    expect(await screen.findByText('112 (VRRP)')).toBeInTheDocument()
    expect(await screen.findByText('113 (PGM)')).toBeInTheDocument()
    expect(await screen.findByText('115 (L2TP)')).toBeInTheDocument()
    expect(await screen.findByText('116 (DDX)')).toBeInTheDocument()
    expect(await screen.findByText('117 (IATP)')).toBeInTheDocument()
    expect(await screen.findByText('118 (STP)')).toBeInTheDocument()
    expect(await screen.findByText('119 (SRP)')).toBeInTheDocument()
    expect(await screen.findByText('120 (UTI)')).toBeInTheDocument()
    expect(await screen.findByText('121 (SMP)')).toBeInTheDocument()
    expect(await screen.findByText('122 (SM)')).toBeInTheDocument()
    expect(await screen.findByText('123 (PTP)')).toBeInTheDocument()
    expect(await screen.findByText('124 (ISIS over IPv4)')).toBeInTheDocument()
    expect(await screen.findByText('125 (FIRE)')).toBeInTheDocument()
    expect(await screen.findByText('126 (CRTP)')).toBeInTheDocument()
    expect(await screen.findByText('127 (CRUDP)')).toBeInTheDocument()
    expect(await screen.findByText('128 (SSCOPMCE)')).toBeInTheDocument()
    expect(await screen.findByText('129 (IPLT)')).toBeInTheDocument()
    expect(await screen.findByText('130 (SPS)')).toBeInTheDocument()
    expect(await screen.findByText('131 (PIPE)')).toBeInTheDocument()
    expect(await screen.findByText('132 (SCTP)')).toBeInTheDocument()
    expect(await screen.findByText('133 (FC)')).toBeInTheDocument()
    expect(await screen.findByText('134 (RSVP-E2E-IGNORE)')).toBeInTheDocument()
    expect(await screen.findByText('135 (Mobility Header)')).toBeInTheDocument()
    expect(await screen.findByText('136 (UDPLite)')).toBeInTheDocument()
    expect(await screen.findByText('137 (MPLS-in-IP)')).toBeInTheDocument()
    expect(await screen.findByText('138 (manet)')).toBeInTheDocument()
    expect(await screen.findByText('139 (HIP)')).toBeInTheDocument()
    expect(await screen.findByText('140 (Shim6)')).toBeInTheDocument()
    expect(await screen.findByText('141 (WESP)')).toBeInTheDocument()
    expect(await screen.findByText('142 (ROHC)')).toBeInTheDocument()
    expect(await screen.findByText('143 (Ethernet)')).toBeInTheDocument()
    expect(await screen.findByText('144 (AGGFRAG)')).toBeInTheDocument()
    expect(await screen.findByText('145 (NSH)')).toBeInTheDocument()
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
    expect(await screen.findByText('Connection Capabilities (135)')).toBeInTheDocument()
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
