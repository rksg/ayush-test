import { DEFAULT_DASHBOARD_ID } from './index.utils'

export const mockDashboardList = [{
  id: DEFAULT_DASHBOARD_ID,
  name: 'RUCKUS One Default Dashboard'
}, {
  id: '2bde337644cc43ac925684879e1b83d5',
  name: 'Dashboard 1 longlonglonglonglonglonglonglong',
  author: 'Joseph Stonkus longlonglonglonglonglonglonglong',
  updatedDate: '2025-04-01T09:19:14.525+00:00',
  widgetIds: [
    '4488ae74ee7d4316835d92ce57c2978d',
    '50d9f993a88b4d86a53da0e8dfff83c4',
    'b73ba496ba0545ec994098f139d99fd8'
  ],
  diffWidgetIds: [
    '50d9f993a88b4d86a53da0e8dfff83c4',
    'b73ba496ba0545ec994098f139d99fd8'
  ]
},
{
  id: '613013d1015d45fea3929830072d0512',
  name: 'Dashboard 2',
  updatedDate: '2025-04-01T09:19:14.525+00:00',
  widgetIds: [
    '54ca583dc31b44e4ac8c74030cedf562',
    '0f7d4d22707642ecad6ceb4a5282b42d',
    '59a0769d298241a086ef71341ba099db',
    '04fbc2eb86e5411fb76a820bd9fc4543',
    '6ef08aba650d432698160a837a8c51f0'
  ],
  diffWidgetIds: []
},
{
  id: '613013d1015d45fea3929830072d0513',
  name: 'Dashboard 3',
  updatedDate: '2025-04-03T09:19:14.525+00:00',
  widgetIds: [
    '54ca583dc31b44e4ac8c74030cedf562',
    '0f7d4d22707642ecad6ceb4a5282b42d',
    '59a0769d298241a086ef71341ba099db',
    '04fbc2eb86e5411fb76a820bd9fc4543',
    '6ef08aba650d432698160a837a8c51f0'
  ],
  diffWidgetIds: [
    '6ef08aba650d432698160a837a8c51f0'
  ]
}]

export const mockCanvasList = [{
  id: '879973540cfe4e5b95e0ebe7606a78df',
  name: 'Dashboard 1 longlonglonglonglonglonglonglonglonglonglonglonglong',
  updatedDate: '2025-04-09T08:19:56.973+00:00',
  widgetCount: 2,
  visible: true,
  author: 'FisrtName 120 LastName 120\n',
  usedAsOwnDashboard: true
},
{
  id: '868fa9ade03e491d8bf86fe57feb9900',
  name: 'Dashboard 2',
  updatedDate: '2025-04-09T08:24:08.622+00:00',
  widgetCount: 2,
  visible: false,
  usedAsOwnDashboard: true
},
{
  id: '899973540cfe4e5b95e0ebe7606a78df',
  name: 'Dashboard 3',
  updatedDate: '2025-04-08T08:45:05.000+00:00',
  widgetCount: 0,
  visible: true,
  usedAsOwnDashboard: true
},
{
  id: '889973540cfe4e5b95e0ebe7606a78df',
  name: 'Dashboard 4',
  updatedDate: '2025-04-08T08:45:05.000+00:00',
  widgetCount: 0,
  visible: true,
  usedAsOwnDashboard: false
}]