import { getBarChartSeriesData } from './index'

const seriesMapping = [
  { x: 'name',
    y: 'poeUtilization'
  }
]

const sample = [{
  mac: 'C0:C5:20:AA:33:1B',
  name: 'FEK3224R09M',
  poeUtilization: 31077200,
  poeUtilizationPct: 0.12419354838709677
},
{
  mac: 'D4:C1:9E:84:59:4A',
  name: 'FEK3233P0J4',
  poeUtilization: 25209800,
  poeUtilizationPct: 0.12419354838709677
},
{
  mac: 'C0:C5:20:AA:32:31',
  name: 'FEK3224R0AP-0801-1',
  poeUtilization: 24578400,
  poeUtilizationPct: 0.12419354838709677
}]

describe('getBarChartSeriesData', () => {
  it('should return correct format', ()=>{
    expect(getBarChartSeriesData(sample, seriesMapping))
      .toEqual({
        dimensions: [
          'mac',
          'name',
          'poeUtilization',
          'poeUtilizationPct'
        ],
        seriesEncode: [
          {
            x: 'name',
            y: 'poeUtilization'
          }
        ],
        source: [
          [
            'C0:C5:20:AA:32:31',
            'FEK3224R0AP-0801-1',
            24578400,
            0.12419354838709677
          ],
          [
            'D4:C1:9E:84:59:4A',
            'FEK3233P0J4',
            25209800,
            0.12419354838709677
          ],
          [
            'C0:C5:20:AA:33:1B',
            'FEK3224R09M',
            31077200,
            0.12419354838709677
          ]
        ]
      })
  })
})
