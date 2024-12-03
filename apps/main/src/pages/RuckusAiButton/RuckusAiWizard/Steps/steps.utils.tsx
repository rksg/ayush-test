import { isEmpty } from 'lodash'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const checkHasRegenerated = (originalData: any[], newData: any[]): boolean => {

  if (isEmpty(originalData[0])) {
    return true
  }

  const newId = newData[0]?.id || ''
  return !originalData.some(item => item.id === newId)
}

