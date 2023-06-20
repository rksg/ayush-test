import { formatter } from '@acx-ui/formatter'

export type ConfigChangeConfig = {
  apiMetric: string
  format: ReturnType<typeof formatter> | ((x: number) => string)
}

export function hasConfigChange <RecordType> (
  column: RecordType | RecordType & { configChange?: ConfigChangeConfig }
): column is RecordType & { configChange: ConfigChangeConfig } {
  return !!(column as RecordType & { configChange: ConfigChangeConfig }).configChange
}

// export function kpiDelta (
//   before: number,
//   after: number,
//   sign: string,
//   format:ReturnType<typeof formatter>,
// ) {
//   const tolerance = 5 / 100 // 5%

//   let value = null
//   let label = noDataSymbol
//   if (!_.isNumber(before) || !_.isNumber(after)) return { value, label }
//   let d = after - before
//   if (format === 'percentFormat') {
//     d = parseFloat(d.toFixed(4), 10)
//   }
//   const percentChange = format === 'percentFormat' || before === 0 ? d : (d / before)
//   const formatted = formatter('percentFormat')(Math.abs(percentChange))

//   label = d > 0
//     ? `+${formatted}`
//     : d < 0
//       ? `-${formatted}`
//       : '='

//   switch (true) {
//     case percentChange >= tolerance:
//       value = sign === '+' ? '1' : '-1'
//       break
//     case percentChange <= -tolerance:
//       value = sign === '+' ? '-1' : '1'
//       break
//     default:
//       value = '0'
//   }

//   return { value, label }
// }
