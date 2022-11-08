import { calculateGranularity } from './calculateGranularity'

it('should return correct granularity based on interval and min granularity', () => {
  const data = [{
    input: { start: '2022-01-01T00:00:00+08:00', end: '2022-01-08T00:01:00+08:00' },
    output: 'PT1H'
  }, {
    input: { start: '2022-01-01T00:00:00+08:00', end: '2022-01-05T00:00:00+08:00' },
    output: 'PT15M'
  }, {
    input: { start: '2022-01-01T00:00:00+08:00', end: '2022-01-01T00:10:00+08:00' },
    output: 'PT180S'
  }, {
    input: {
      start: '2022-01-01T00:00:00+08:00',
      end: '2022-01-01T00:10:00+08:00',
      minGranularity: 'PT15M'
    },
    output: 'PT15M'
  }]
  data.forEach(({ input, output }) =>
    expect(
      calculateGranularity(input.start, input.end, input.minGranularity)
    ).toStrictEqual(output)
  )
})
