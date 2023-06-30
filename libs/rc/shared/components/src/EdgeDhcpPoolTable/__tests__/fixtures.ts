export const mockDhcpPoolStatsData = {
  fields: [
    'tenantId','id','edgeIds','dhcpId','poolName','subnetMask',
    'poolRange','gateway','activated'
  ],
  totalCount: 3,
  page: 1,
  data: [
    {
      tenantId: '1ecc2d7cf9d2342fdb31ae0e24958fcac',
      id: '1',
      edgeIds: ['1'],
      dhcpId: '1',
      poolName: 'TestPool1',
      subnetMask: '255.255.255.0',
      poolRange: '1.1.1.1 - 1.1.1.5',
      gateway: '1.2.3.4',
      activated: 'true'
    },
    {
      tenantId: '1ecc2d7cf9d2342fdb31ae0e24958fcac',
      id: '2',
      edgeIds: ['2', '3'],
      dhcpId: '2',
      poolName: 'TestPool2',
      subnetMask: '255.255.255.0',
      poolRange: '1.1.1.1 - 1.1.1.5',
      gateway: '1.2.3.4',
      activated: 'true'
    },
    {
      tenantId: '1ecc2d7cf9d2342fdb31ae0e24958fcac',
      id: '3',
      edgeIds: ['4'],
      dhcpId: '3',
      poolName: 'TestPool3',
      subnetMask: '255.255.255.0',
      poolRange: '1.1.1.1 - 1.1.1.5',
      gateway: '1.2.3.4',
      activated: 'true'
    }
  ]
}