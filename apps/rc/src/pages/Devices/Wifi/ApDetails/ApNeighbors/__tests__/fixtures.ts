export const mockedSocket = {
  on: jest.fn(),
  off: jest.fn(),
  disconnect: jest.fn(),
  disconnected: false
}

export const tabPath = '/:tenantId/t/devices/wifi/:apId/details/neighbors/:activeSubTab'

export const mockedAp = {
  totalCount: 1,
  page: 1,
  data: [
    {
      serialNumber: 'AP001',
      venueName: 'Mock-Venue',
      apMac: '00:00:00:00:00:01'
    }
  ]
}

export const mockedApRfNeighbors = {
  detectedTime: '2022-12-16T06:22:23.337+0000',
  neighbors: [
    {
      deviceName: 'AP-282608',
      apMac: '05:B6:A1:AC:52:BA',
      status: '2_00_Operational',
      model: 'R720',
      venueName: 'test_hank',
      ip: '53.68.230.52',
      channel24G: '6 (20MHz)',
      channel5G: '161 (80MHz)',
      channel6G: null,
      snr24G: '15 dB',
      snr5G: '37 dB',
      snr6G: null
    },
    {
      deviceName: 'AP-909297',
      apMac: '27:F4:BC:C9:A0:B7',
      status: '2_00_Operational',
      model: 'R720',
      venueName: 'test_hank',
      ip: '55.74.62.230',
      channel24G: '6 (20MHz)',
      channel5G: '161 (80MHz)',
      channel6G: null,
      snr24G: '15 dB',
      snr5G: '37 dB',
      snr6G: null
    }
  ]
}

export const mockedApLldpNeighbors = {
  detectedTime: '2022-12-16T06:22:23.337+0000',
  neighbors: [
    {
      neighborManaged: false,
      neighborSerialNumber: '987654321',
      lldpInterface: 'eth0',
      lldpVia: 'LLDP',
      lldpRID: '5',
      lldpTime: '7 days, 21:03:20',
      lldpChassisID: 'mac d8:38:fc:36:8b:c0',
      lldpSysName: 'hank-hao-r610',
      lldpSysDesc: 'Ruckus R610 Multimedia Hotzone Wireless AP/SW Version: 6.2.1.103.2578',
      lldpMgmtIP: '10.206.78.111',
      lldpCapability: 'Bridge, on;Router, off;WLAN AP, on',
      lldpPortID: 'mac d8:38:fc:36:8b:c0',
      lldpPortDesc: 'eth0',
      lldpMFS: null,
      lldpPMDAutoNeg: 'supported: yes, enabled: yes',
      lldpAdv: '10Base-T, HD: yes, FD: yes;100Base-TX, HD: yes, FD: yes;10Base-T, HD: no, FD: yes',
      lldpMAUOperType: '100BaseTXFD - 2 pair category 5 UTP, full duplex mode',
      lldpMDIPower: null,
      lldpDeviceType: null,
      lldpPowerPairs: null,
      lldpClass: null,
      lldpPowerType: null,
      lldpPowerSource: null,
      lldpPowerPriority: null,
      lldpPDReqPowerVal: null,
      lldpPSEAllocPowerVal: null,
      lldpUPOE: '0'
    },
    {
      neighborManaged: true,
      neighborSerialNumber: '123456789',
      lldpInterface: 'eth1',
      lldpVia: 'LLDP',
      lldpRID: '7',
      lldpTime: '3 days, 21:03:20',
      lldpChassisID: 'mac d8:38:fc:36:8b:cc',
      lldpSysName: 'Jacky-r610',
      lldpSysDesc: 'Ruckus R610 Multimedia Hotzone Wireless AP/SW Version: 6.2.1.103.2578',
      lldpMgmtIP: '10.206.78.222',
      lldpCapability: 'Bridge, on;Router, off;WLAN AP, on',
      lldpPortID: 'mac d8:38:fc:36:8b:cc',
      lldpPortDesc: 'eth1',
      lldpMFS: null,
      lldpPMDAutoNeg: 'supported: yes, enabled: yes',
      lldpAdv: '10Base-T, HD: no, FD: yes;100Base-TX, HD: yes, FD: yes;1000Base-T, HD: no, FD: yes',
      lldpMAUOperType: '100BaseTXFD - 2 pair category 5 UTP, full duplex mode',
      lldpMDIPower: null,
      lldpDeviceType: null,
      lldpPowerPairs: null,
      lldpClass: null,
      lldpPowerType: null,
      lldpPowerSource: null,
      lldpPowerPriority: null,
      lldpPDReqPowerVal: null,
      lldpPSEAllocPowerVal: null,
      lldpUPOE: '0'
    }
  ]
}
