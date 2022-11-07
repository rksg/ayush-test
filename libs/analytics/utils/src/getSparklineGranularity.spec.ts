import { getSparklineGranularity } from './getSparklineGranularity'

it('should return correct granularity for sparkline', () => {
  const data = [{
    input: { start: '2022-01-01T00:00:00+08:00', end: '2022-02-02T00:00:00+08:00' },
    output: 'PT24H'
  },{
    input: { start: '2022-01-01T00:00:00+08:00', end: '2022-01-02T00:00:00+08:00' },
    output: 'PT1H'
  }, {
    input: { start: '2022-01-01T00:00:00+08:00', end: '2022-01-01T01:10:00+08:00' },
    output: 'PT15M'
  }, {
    input: { start: '2022-01-01T00:00:00+08:00', end: '2022-01-01T00:10:00+08:00' },
    output: 'PT180S'
  }]
  data.forEach(({ input, output }) =>
    expect(getSparklineGranularity(input.start, input.end)).toStrictEqual(output)
  )
})
