export const alarmList = {
  totalCount: 2,
  page: 1,
  data: [
    {
      severity: 'Major',
      serialNumber: '272002000493',
      entityType: 'AP',
      startTime: 1667879968000,
      entityId: '272002000493',
      id: '272002000493_ap_status',
      message: '{ "message_template": "AP @@apName disconnected from the cloud controller." }'
    },
    {
      severity: 'Critical',
      entityId: '212002008925',
      entityType: 'AP',
      id: '212002008925_ap_status',
      message: '{ "message_template": "AP @@apName disconnected from the cloud controller." }',
      serialNumber: '212002008925',
      startTime: 1670911389000
    }
  ],
  subsequentQueries: [
    {
      fields: [
        'venueName',
        'apName',
        'switchName'
      ],
      url: '/api/eventalarmapi/e3d0c24e808d42b1832d47db4c2a7914/alarm/meta'
    }
  ],
  fields: [
    'startTime',
    'severity',
    'message',
    'id',
    'serialNumber',
    'entityType',
    'entityId',
    'sourceType'
  ]
}
