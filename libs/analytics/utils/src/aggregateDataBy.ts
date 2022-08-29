import { isEqual, get, groupBy } from 'lodash'

/**
 * Aggregate data into array based on key generated with
 * stringify value of `aggregators`
 * @example
 * const data = [
 *   { key: 'a', a: '1', b: '3' },
 *   { key: 'a', a: '2', b: '2' },
 *   { key: 'a', a: '3', b: '1' }
 * ]
 * aggregateDataBy('key') //= [{ key: ['a'], a: ['1','2','3'], b:['3','2','1'] }]
 * aggregateDataBy(v => v.key) //= [{ key: ['a'], a: ['1','2','3'], b:['3','2','1'] }]
 */
export function aggregateDataBy<T extends Object> (
  ...aggregators: (string|((row: T) => void))[]
) {
  return function (data: T[]) {
    const dataGroupedBy = data.reduce((acc, row) => {
      const aggregatorsValues = aggregators.map((aggregator) =>
        typeof aggregator === 'function'
          ? aggregator(row)
          : row[aggregator as keyof T]
      )
      const aggregationKey = JSON.stringify(aggregatorsValues)

      // aggregate data with same key into array
      acc[aggregationKey] = Object
        .entries(row)
        .reduce((agg, [attribute, value]) => {
          const set: Array<T[keyof T]> = agg[attribute as keyof T] = get(agg, attribute, [])
          if (!set.some((x: T[keyof T]) => isEqual(x, value))) set.push(value)
          return agg
        }, get(acc, aggregationKey, {}) as Record<keyof T, Array<T[keyof T]>>)

      // move 'Unknown' to the back of aggregated array
      acc[aggregationKey] =
        sortPreference(acc[aggregationKey]) as Record<keyof T, (Array<T[keyof T]>)>

      return acc
    }, {} as Record<string, Record<keyof T, Array<T[keyof T]>>>)

    return Object.values(dataGroupedBy)
  }
}
const lowPreferenceList = [ '0.0.0.0', '0', 'Unknown' ]

export function sortPreference<T extends Object> (
  data: Record<keyof T, (Array<T[keyof T]>|T[keyof T])>
) {
  return Object
    .entries(data)
    .reduce((agg, [key, values]) => {
      if (Array.isArray(values)) {
        const {
          knows = [],
          ...rest
        } = groupBy(values, x => (lowPreferenceList.includes(x as unknown as string) ? x : 'knows'))
        agg[key as keyof T] = knows.concat(...lowPreferenceList.map(item => rest[item] || []))
      } else {
        agg[key as keyof T] = values as T[keyof T]
      }
      return agg
    }, {} as Record<keyof T, Array<T[keyof T]>|T[keyof T]>)
}
