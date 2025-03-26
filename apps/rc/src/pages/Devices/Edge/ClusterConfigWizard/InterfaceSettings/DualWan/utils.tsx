import { getIntl } from '@acx-ui/utils'

export const getDisplayPortString = (nodeName:string, portName: string) => {
  return (nodeName || portName) ? `${nodeName} / ${portName}` : ''
}

export const getDisplayWanRole = (priority: number) => {
  const { $t } = getIntl()
  if (priority === 0) return ''
  return priority === 1 ? $t({ defaultMessage: 'Active' }) : $t({ defaultMessage: 'Backup' })
}