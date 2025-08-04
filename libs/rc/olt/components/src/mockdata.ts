export const onuData = [{
  name: 'ont_9',
  ports: 3,
  usedPorts: 2,
  poeClass: '2',
  portDetails: [
    {
      portIdx: '1',
      status: 'up',
      vlan: ['30'],
      poePower: 2.5
    },
    {
      portIdx: '2',
      status: 'down',
      vlan: ['11'],
      poePower: 10
    },
    {
      portIdx: '3',
      status: 'up',
      vlan: ['66'],
      poePower: 3
    }
  ]
}, {
  name: 'ont_7',
  ports: 1,
  usedPorts: 0,
  poeClass: '2',
  portDetails: [
    {
      portIdx: '1',
      status: 'down',
      vlan: [],
      poePower: 0
    }
  ]
}]