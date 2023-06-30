import { ApDeviceStatusEnum, FloorPlanDto, NetworkDeviceType, TypeWiseNetworkDevices } from '@acx-ui/rc/utils'

export const mockedMeshFloorPlans: FloorPlanDto[] = [
  {
    id: 'cd97772ea3bd4dfdb478fc91756048fe',
    image: {
      id: '01acff37331949c686d40b5a00822ec2-001.jpeg',
      name: '8.jpeg'
    },
    name: 'TEST_2',
    floorNumber: 0,
    imageId: '01acff37331949c686d40b5a00822ec2-001.jpeg',
    imageName: '8.jpeg',
    imageUrl:
    '/api/file/tenant/fe892a451d7a486bbb3aee929d2dfcd1/01acff37331949c686d40b5a00822ec2-001.jpeg'
  }
]

export const mockedMeshAps = {
  totalCount: 1,
  page: 1,
  data: [
    {
      serialNumber: '931704001509',
      name: 'R510-ROOT',
      apMac: '0C:F4:D5:27:3B:90',
      downlink: [
        {
          serialNumber: '511603004160',
          name: 'R710-11.196',
          apMac: '0C:F4:D5:10:EB:00',
          downlink: [],
          uplink: [
            {
              txFrames: '4644882',
              rssi: 39,
              rxBytes: '2393253315',
              txBytes: '1897287255',
              rxFrames: '17659460',
              type: 1,
              upMac: '0c:f4:d5:27:3b:90'
            }
          ],
          meshRole: 'MAP',
          hops: 1,
          xPercent: 29.25373,
          yPercent: 29.927008,
          txFrames: '9484527',
          rssi: 56,
          rxBytes: '1006942797',
          txBytes: '1195117373',
          rxFrames: '2456334',
          type: 2,
          downMac: '0c:f4:d5:10:eb:00',
          floorplanId: mockedMeshFloorPlans[0].id
        }
      ],
      uplink: [],
      meshRole: 'RAP',
      hops: 0,
      floorplanId: mockedMeshFloorPlans[0].id,
      xPercent: 79.716515,
      yPercent: 31.556149,
      downlinkCount: 2,
      healthStatus: 'Unknown'
    }
  ]
}

export const mockedMeshNetworkDevices: { [key: string]: TypeWiseNetworkDevices } = {
  cd97772ea3bd4dfdb478fc91756048fe: {
    ap: [
      {
        deviceStatus: ApDeviceStatusEnum.OPERATIONAL,
        floorplanId: mockedMeshFloorPlans[0].id,
        id: '931704001509',
        name: 'R510-ROOT',
        serialNumber: '931704001509',
        position: {
          floorplanId: mockedMeshFloorPlans[0].id,
          xPercent: 79.716515,
          yPercent: 31.556149
        },
        xPercent: 79.716515,
        yPercent: 31.556149,
        networkDeviceType: NetworkDeviceType.ap
      },
      {
        deviceStatus: ApDeviceStatusEnum.OPERATIONAL,
        floorplanId: mockedMeshFloorPlans[0].id,
        id: '511603004160',
        name: 'R710-11.196',
        serialNumber: '511603004160',
        position: {
          floorplanId: mockedMeshFloorPlans[0].id,
          xPercent: 29.25373,
          yPercent: 29.927008
        },
        xPercent: 29.25373,
        yPercent: 29.927008,
        networkDeviceType: NetworkDeviceType.ap
      }
    ],
    switches: [],
    LTEAP: [],
    RogueAP: [],
    cloudpath: [],
    DP: []
  }
}

export const mockedApMeshTopologyData = {
  fields: [],
  totalCount: 1,
  page: null,
  data: [
    {
      edges: [
        {
          from: '931704001509',
          to: '511603004160',
          fromMac: '0C:F4:D5:27:3B:90',
          toMac: '0C:F4:D5:10:EB:00',
          poeEnabled: false,
          connectedPort: '0',
          connectionType: 'Mesh',
          connectionStatus: 'Good',
          fromRole: 'RAP',
          toRole: 'MAP',
          fromSNR: 72,
          toSNR: 39,
          band: '5G',
          channel: 100
        }
      ],
      nodes: []
    }
  ]
}
