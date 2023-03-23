import { render, screen } from '@acx-ui/test-utils'

import { Status, StatusBlock, StatusBlockProps } from './Status'

import { ConfigStatusEnum, getExecutionSectionData } from '.'

describe('StatusBlock', () => {
  const samples = [
    { field: 'passedApsPercent', values: [0.5, 0.9], configured: ConfigStatusEnum.Configured,
      results: ['Test Result', '90%', '+40%'] },
    { field: 'passedApsPercent', values: [0.9, 0.5], configured: ConfigStatusEnum.Configured,
      results: ['Test Result', '50%', '-40%'] },
    { field: 'passedApsPercent', values: [0.9, 0.9], configured: ConfigStatusEnum.Configured,
      results: ['Test Result', '90%' ] },
    { field: 'passedApsPercent', values: [0, 0.9], configured: ConfigStatusEnum.Configured,
      results: ['Test Result', '90%', '+90%'] },
    { field: 'passedApsPercent', values: [0.9, 0], configured: ConfigStatusEnum.Configured,
      results: ['Test Result', '0%', '-90%'] },
    { field: 'passedApsPercent', values: [NaN, 0.9], configured: ConfigStatusEnum.Configured,
      results: ['Test Result', '90%'] },
    { field: 'passedApsPercent', values: [NaN, NaN], configured: ConfigStatusEnum.Configured,
      results: ['Test Result', '0%'] },
    { field: 'avgPingTime', values: [500, 900], configured: ConfigStatusEnum.Configured,
      results: ['Average Ping Time', '900 ms', '+400 ms'] },
    { field: 'avgPingTime', values: [900, 500], configured: ConfigStatusEnum.Configured,
      results: ['Average Ping Time', '500 ms', '-400 ms'] },
    { field: 'avgPingTime', values: [900, 900], configured: ConfigStatusEnum.Configured,
      results: ['Average Ping Time', '900 ms'] },
    { field: 'avgPingTime', values: [0, 900], configured: ConfigStatusEnum.Configured,
      results: ['Average Ping Time', '900 ms'] },
    { field: 'avgPingTime', values: [900, 0], configured: ConfigStatusEnum.Configured,
      results: ['Average Ping Time', '--'] },
    { field: 'avgPingTime', values: [900, 0], configured: ConfigStatusEnum.NA,
      results: ['Average Ping Time', 'N/A'] },
    { field: 'avgPingTime', values: [undefined, 900], configured: ConfigStatusEnum.Configured,
      results: ['Average Ping Time', '900 ms'] },
    { field: 'avgPingTime', values: [undefined, undefined], configured: ConfigStatusEnum.NA,
      results: ['Average Ping Time', 'N/A'] },
    { field: 'avgUpload', values: [0.000001, 1000000], configured: ConfigStatusEnum.Configured,
      results: ['Average Upload', '1 Gbps', '+1000 Mbps'] },
    { field: 'avgUpload', values: [1000000, 0.000001], configured: ConfigStatusEnum.Configured,
      results: ['Average Upload', '0.000001 Kbps', '-1000 Mbps'] },
    { field: 'avgUpload', values: [1000000, 1000000], configured: ConfigStatusEnum.Configured,
      results: ['Average Upload', '1 Gbps'] },
    { field: 'avgUpload', values: [0, 1000000], configured: ConfigStatusEnum.Configured,
      results: ['Average Upload', '1 Gbps'] },
    { field: 'avgUpload', values: [1000000, 0], configured: ConfigStatusEnum.Configured,
      results: ['Average Upload', '--'] },
    { field: 'avgUpload', values: [1000000, 0], configured: ConfigStatusEnum.NA,
      results: ['Average Upload', 'N/A'] },
    { field: 'avgUpload', values: [undefined, 1000000], configured: ConfigStatusEnum.Configured,
      results: ['Average Upload', '1 Gbps'] },
    { field: 'avgUpload', values: [undefined, undefined], configured: ConfigStatusEnum.NA,
      results: ['Average Upload', 'N/A'] },
    { field: 'avgDownload', values: [2000000, 2000], configured: ConfigStatusEnum.Configured,
      results: ['Average Download', '2 Mbps', '-2 Gbps'] },
    { field: 'avgDownload', values: [2000, 2000000], configured: ConfigStatusEnum.Configured,
      results: ['Average Download', '2 Gbps', '+2 Gbps'] },
    { field: 'avgDownload', values: [2000, 2000], configured: ConfigStatusEnum.Configured,
      results: ['Average Download', '2 Mbps'] },
    { field: 'avgDownload', values: [0, 2000], configured: ConfigStatusEnum.Configured,
      results: ['Average Download', '2 Mbps'] },
    { field: 'avgDownload', values: [2000, 0], configured: ConfigStatusEnum.Configured,
      results: ['Average Download', '--'] },
    { field: 'avgDownload', values: [2000, 0], configured: ConfigStatusEnum.NA,
      results: ['Average Download', 'N/A'] },
    { field: 'avgDownload', values: [undefined, 2000], configured: ConfigStatusEnum.Configured,
      results: ['Average Download', '2 Mbps'] },
    { field: 'avgDownload', values: [undefined, undefined], configured: ConfigStatusEnum.NA,
      results: ['Average Download', 'N/A'] },
    { field: 'passedApsPercent',
      values: [undefined, undefined],
      configured: ConfigStatusEnum.NoData,
      results: [ 'Test Result', '--'] },
    { field: 'avgPingTime', values: [undefined, undefined], configured: ConfigStatusEnum.NoData,
      results: ['Average Ping Time', '--'] },
    { field: 'avgUpload', values: [undefined, undefined], configured: ConfigStatusEnum.NoData,
      results: ['Average Upload', '--'] },
    { field: 'avgDownload', values: [undefined, undefined], configured: ConfigStatusEnum.NoData,
      results: ['Average Download', '--'] }
  ] as (StatusBlockProps & { results: string[] })[]

  samples.forEach(({ results, ...rest }, index) => {
    it(`should render correctly - case ${index + 1}`, () => {
      render(<StatusBlock {...rest}/>)
      results.map(result => expect(screen.queryByText(result)).toBeVisible())
    })
  })
})

describe('Status', () => {
  it('should render correctly', () => {
    const data = {
      configured: {
        passedApsPercent: 'configured',
        avgPingTime: 'configured',
        avgUpload: 'configured',
        avgDownload: 'configured'
      },
      passedApsPercent: [0.4, 0.5],
      avgPingTime: [100, 50],
      avgUpload: [100, 0.000001],
      avgDownload: [0.0000001, 1000000]
    } as unknown as ReturnType<typeof getExecutionSectionData>
    render(<Status details={data}/>)
    expect(screen.queryByText('Test Result')).toBeVisible()
  })
})
