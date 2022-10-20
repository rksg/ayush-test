import { unitOfTime } from 'moment-timezone'

export const noBuffer = {
  front: { value: 0, unit: 'hours' as unitOfTime.Base },
  back: { value: 0, unit: 'hours' as unitOfTime.Base }
}

export const buffer6hr = {
  front: { value: 6, unit: 'hours' as unitOfTime.Base },
  back: { value: 6, unit: 'hours' as unitOfTime.Base }
}
