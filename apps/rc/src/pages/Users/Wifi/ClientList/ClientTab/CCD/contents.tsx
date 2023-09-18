import { MessageDescriptor, defineMessage } from 'react-intl'

export interface ApInfo {
  name?: string
  apMac?: string
  model?: string
  serialNumber?: string
  ssid?: string
  radio?: string
}

export interface CcdEndPointRectX {
    id: number,
    x1: number,
    x2: number
}

export interface CcdDataMessage {
  clientMac: string
  messageId: number
  reportingModule: number
  sourceServerType: number
  sourceServerId: string
  sourceServerName?: string
  sourceModule: number
  destinationServerType: number
  destinationServerId: string
  destinationServerName?: string
  destinationModule: number
  apMac?: string
  statusCode: number
  protocol?: string
  info?: string
  radioBand?: number
  ssid?: string
  bidirection?: boolean
  reasonCode?: number
  probe?: {
    airtimeUtilization: number,
    capacity: number,
    channel: number,
    connectionFailure: number,
    latency: number,
    rssi: number
  }
}

export const CcdEndPoints = [
  { id: 1, name: 'UE', fullName: 'Client Device' },
  { id: 2, name: 'AP', fullName: 'AP' },
  { id: 4, name: 'DP', fullName: 'Data Plane' },
  { id: 3, name: 'CP', fullName: 'Control Plane' },
  { id: 5, name: 'DHCP', fullName: 'DHCP' },
  { id: 6, name: 'AAA', fullName: 'AAA server' },
  { id: 7, name: 'LDAP', fullName: 'LDAP' },
  { id: 8, name: 'AD', fullName: 'Active Directory Server' },
  { id: 9, name: 'SP', fullName: 'Captive Portal' },
  { id: 99, name: 'Broadcast', fullName: 'Broadcast' }
]

export const CcdStatus = {
  SUCCESS: 0,
  FAIL: 1,
  WARRING: 2
}

export const CcdMsg: Record<number, MessageDescriptor> = {
  1: defineMessage({
    defaultMessage: 'Probe Request',
    description: 'CCD Message ID 1'
  }),
  2: defineMessage({
    defaultMessage: '802.11 Authentication Request',
    description: 'CCD Message ID 2'
  }),
  3: defineMessage({
    defaultMessage: '802.11 Authentication Response',
    description: 'CCD Message ID 3'
  }),
  4: defineMessage({
    defaultMessage: '802.11 Association Request',
    description: 'CCD Message ID 4'
  }),
  5: defineMessage({
    defaultMessage: '802.11 Association Response',
    description: 'CCD Message ID 5'
  }),
  6: defineMessage({
    defaultMessage: '802.11 Reassociation Request',
    description: 'CCD Message ID 6'
  }),
  7: defineMessage({
    defaultMessage: '802.11 Reassociation Response',
    description: 'CCD Message ID 7'
  }),
  8: defineMessage({
    defaultMessage: '802.11 Deauthentication(AP)',
    description: 'CCD Message ID 8'
  }),
  9: defineMessage({
    defaultMessage: '802.11 Disassociation(AP)',
    description: 'CCD Message ID 9'
  }),
  10: defineMessage({
    defaultMessage: '802.11 Deauthentication(Client)',
    description: 'CCD Message ID 10'
  }),
  11: defineMessage({
    defaultMessage: '802.11 Disassociation(Client)',
    description: 'CCD Message ID 11'
  }),
  12: defineMessage({
    defaultMessage: '802.11 Authentication Commit Request',
    description: 'CCD Message ID 12'
  }),
  13: defineMessage({
    defaultMessage: '802.11 Authentication Commit Response',
    description: 'CCD Message ID 13'
  }),
  14: defineMessage({
    defaultMessage: '802.11 Authentication Confirm Request',
    description: 'CCD Message ID 14'
  }),
  15: defineMessage({
    defaultMessage: '802.11 Authentication Confirm Response',
    description: 'CCD Message ID 15'
  }),
  21: defineMessage({
    defaultMessage: '4-Way Handshake - Frame 1',
    description: 'CCD Message ID 21'
  }),
  22: defineMessage({
    defaultMessage: '4-Way Handshake - Frame 2',
    description: 'CCD Message ID 22'
  }),
  23: defineMessage({
    defaultMessage: '4-Way Handshake - Frame 3',
    description: 'CCD Message ID 23'
  }),
  24: defineMessage({
    defaultMessage: '4-Way Handshake - Frame 4',
    description: 'CCD Message ID 24'
  }),
  31: defineMessage({
    defaultMessage: 'DHCP Discover',
    description: 'CCD Message ID 31'
  }),
  32: defineMessage({
    defaultMessage: 'DHCP Offer',
    description: 'CCD Message ID 32'
  }),
  33: defineMessage({
    defaultMessage: 'DHCP Request',
    description: 'CCD Message ID 33'
  }),
  34: defineMessage({
    defaultMessage: 'DHCP Ack',
    description: 'CCD Message ID 34'
  }),
  35: defineMessage({
    defaultMessage: 'DHCP NAK',
    description: 'CCD Message ID 5'
  }),
  36: defineMessage({
    defaultMessage: 'DHCP Done',
    description: 'CCD Message ID 35'
  }),
  37: defineMessage({
    defaultMessage: 'DHCP Discover',
    description: 'CCD Message ID 37'
  }),
  38: defineMessage({
    defaultMessage: 'DHCP Request',
    description: 'CCD Message ID 38'
  }),
  41: defineMessage({
    defaultMessage: 'EAP Request',
    description: 'CCD Message ID 41'
  }),
  42: defineMessage({
    defaultMessage: 'EAP Response',
    description: 'CCD Message ID 42'
  }),
  43: defineMessage({
    defaultMessage: 'EAP Success',
    description: 'CCD Message ID 43'
  }),
  44: defineMessage({
    defaultMessage: 'EAP Failure',
    description: 'CCD Message ID 44'
  }),
  51: defineMessage({
    defaultMessage: 'RADIUS Access Request',
    description: 'CCD Message ID 51'
  }),
  52: defineMessage({
    defaultMessage: 'RADIUS Access Challenge',
    description: 'CCD Message ID 52'
  }),
  53: defineMessage({
    defaultMessage: 'RADIUS Access Accept',
    description: 'CCD Message ID 53'
  }),
  54: defineMessage({
    defaultMessage: 'RADIUS Access Reject',
    description: 'CCD Message ID 54'
  }),
  55: defineMessage({
    defaultMessage: 'RADIUS Access Request',
    description: 'CCD Message ID 55'
  }),
  56: defineMessage({
    defaultMessage: 'RADIUS Access Challenge',
    description: 'CCD Message ID 56'
  }),
  57: defineMessage({
    defaultMessage: 'RADIUS Access Accept',
    description: 'CCD Message ID 57'
  }),
  58: defineMessage({
    defaultMessage: 'RADIUS Access Reject',
    description: 'CCD Message ID 58'
  }),
  61: defineMessage({
    defaultMessage: 'Authentication Request',
    description: 'CCD Message ID 61'
  }),
  62: defineMessage({
    defaultMessage: 'Authentication Success',
    description: 'CCD Message ID 62'
  }),
  63: defineMessage({
    defaultMessage: 'Authentication Failure',
    description: 'CCD Message ID 63'
  }),
  64: defineMessage({
    defaultMessage: 'ID Authentication Request',
    description: 'CCD Message ID 64'
  }),
  65: defineMessage({
    defaultMessage: 'ID Authentication Accept',
    description: 'CCD Message ID 65'
  }),
  66: defineMessage({
    defaultMessage: 'ID Authentication Reject',
    description: 'CCD Message ID 66'
  }),
  91: defineMessage({
    defaultMessage: 'Message Redirect',
    description: 'CCD Message ID 91'
  }),
  101: defineMessage({
    defaultMessage: 'Active Directory Server Request',
    description: 'CCD Message ID 101'
  }),
  102: defineMessage({
    defaultMessage: 'Active Directory Server Accept',
    description: 'CCD Message ID 102'
  }),
  103: defineMessage({
    defaultMessage: 'Active Directory Server Reject',
    description: 'CCD Message ID 103'
  }),
  104: defineMessage({
    defaultMessage: 'LDAP Request',
    description: 'CCD Message ID 5'
  }),
  105: defineMessage({
    defaultMessage: 'LDAP Accept',
    description: 'CCD Message ID 104'
  }),
  106: defineMessage({
    defaultMessage: 'LDAP Reject',
    description: 'CCD Message ID 106'
  }),
  254: defineMessage({
    defaultMessage: 'The connection process is finished',
    description: 'CCD Message ID 254'
  }),
  255: defineMessage({
    defaultMessage: 'The client monitoring has ended',
    description: 'CCD Message ID 255'
  })
}
