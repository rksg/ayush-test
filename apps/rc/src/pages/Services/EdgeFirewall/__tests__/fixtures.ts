export const mockEdgeList = {
  fields: [
    'name','deviceStatus','type','model','serialNumber','ip',
    'ports','venueName','venueId','tags'
  ],
  totalCount: 5,
  page: 1,
  data: [
    {
      name: 'Smart Edge 1',
      deviceStatus: '1_07_Initializing',
      deviceStatusSeverity: '1_InSetupPhase',
      type: 'type 1',
      model: 'model 1',
      serialNumber: '0000000001',
      ip: '0.0.0.0',
      ports: '80',
      venueName: 'Venue 1',
      venueId: '00001',
      tags: ['Tag1', 'Tag2'],
      firmwareVersion: '1.1.1.1'
    },
    {
      name: 'Smart Edge 2',
      deviceStatus: '1_01_NeverContactedCloud',
      deviceStatusSeverity: '1_InSetupPhase',
      type: 'type 1',
      model: 'model 1',
      serialNumber: '0000000002',
      ip: '0.0.0.0',
      ports: '80',
      venueName: 'Venue 1',
      venueId: '00001',
      tags: ['Tag1', 'Tag2'],
      firmwareVersion: '1.1.1.1'
    },
    {
      name: 'Smart Edge 3',
      deviceStatus: '1_09_Offline',
      deviceStatusSeverity: '1_InSetupPhase_Offline',
      type: 'type 1',
      model: 'model 1',
      serialNumber: '0000000003',
      ip: '0.0.0.0',
      ports: '80',
      venueName: 'Venue 1',
      venueId: '00001',
      tags: ['Tag1', 'Tag2'],
      firmwareVersion: '1.1.1.1'
    },
    {
      name: 'Smart Edge 4',
      deviceStatus: '1_10_NeedsConfig',
      deviceStatusSeverity: '1_InSetupPhase',
      type: 'type 1',
      model: 'model 1',
      serialNumber: '0000000004',
      ip: '0.0.0.0',
      ports: '80',
      venueName: 'Venue 1',
      venueId: '00001',
      tags: ['Tag1', 'Tag2'],
      firmwareVersion: '1.1.1.1'
    },
    {
      name: 'Smart Edge 5',
      deviceStatus: '2_00_Operational',
      deviceStatusSeverity: '2_Operational',
      type: 'type 1',
      model: 'model 1',
      serialNumber: '0000000005',
      ip: '0.0.0.0',
      ports: '80',
      venueName: 'Venue 1',
      venueId: '00001',
      tags: ['Tag1', 'Tag2'],
      firmwareVersion: '1.1.1.1'
    }
  ]
}