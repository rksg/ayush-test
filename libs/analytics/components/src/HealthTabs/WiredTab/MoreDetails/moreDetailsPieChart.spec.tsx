import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { MoreDetailsPieChart, transformData } from './moreDetailsPieChart'

describe('moreDetailsPieChart', () => {
  it('transformData', () => {
    const cpuData = [
      { mac: 'mac1', cpuUtilization: 80, name: '',
        serial: '', model: '',status: '', firmware: '',numOfPorts: 0 },
      { mac: 'mac2', cpuUtilization: 60, name: '',
        serial: '', model: '',status: '', firmware: '',numOfPorts: 0 },
      { mac: 'mac3', cpuUtilization: 70, name: '',
        serial: '', model: '',status: '', firmware: '',numOfPorts: 0 }
    ]

    const dhcpData = [
      { mac: 'mac1', dhcpFailureCount: 80, name: '',
        serial: '', model: '',status: '', firmware: '',numOfPorts: 0 },
      { mac: 'mac2', dhcpFailureCount: 60, name: '',
        serial: '', model: '',status: '', firmware: '',numOfPorts: 0 },
      { mac: 'mac3', dhcpFailureCount: 70, name: '',
        serial: '', model: '',status: '', firmware: '',numOfPorts: 0 }
    ]

    const expectedPieChartData = [
      { mac: 'mac1', value: 80, name: '', color: '#66B1E8' },
      { mac: 'mac2', value: 60, name: '', color: '#EC7100' },
      { mac: 'mac3', value: 70, name: '', color: '#F9C34B' }
    ]

    const cpuResult = transformData('cpu', cpuData)
    expect(cpuResult).toEqual(expectedPieChartData)

    const dhcpResult = transformData('dhcp', dhcpData)
    expect(dhcpResult).toEqual(expectedPieChartData)
  })
  it('should show data', () => {
    const mapping = [{
      type: 'cpu',
      title: '',
      pieTitle: '',
      tableTitle: '',
      pieData: [
        { mac: 'mac1', cpuUtilization: 80, name: 'name',
          serial: '', model: '',status: '', firmware: '',numOfPorts: 0 }
      ]
    }]
    render(
      <Provider><MoreDetailsPieChart mapping={mapping} /></Provider>
    )
    const element = screen.getByText('name')
    expect(element).toBeInTheDocument()
  })
  it('should show no data', () => {
    const mapping = [{
      type: 'cpu',
      title: '',
      pieTitle: '',
      tableTitle: '',
      pieData: []
    }]
    render(
      <Provider>
        <MoreDetailsPieChart mapping={mapping} />
      </Provider>
    )
    const element = screen.getByText('No data to display')
    expect(element).toBeInTheDocument()
  })
})
