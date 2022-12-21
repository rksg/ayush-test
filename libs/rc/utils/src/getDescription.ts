import { Activity } from './types'

export const getDescription = (
  descriptionTemplate: Activity['descriptionTemplate'],
  descriptionData: Activity['descriptionData']
) => {
  const values = descriptionData?.reduce((agg, data) =>
    ({ ...agg, [data.name]: data.value })
  , {} as Record<string, string>)
  let message = descriptionTemplate
  message && message.match(new RegExp(/@@\w+/, 'g'))?.forEach(match => {
    message = message.replace(match, values[match.replace('@@','')])
  })
  return message
}
