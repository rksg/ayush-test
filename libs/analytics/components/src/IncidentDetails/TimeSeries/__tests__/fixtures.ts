import { unitOfTime } from 'moment-timezone'

export const noBuffer = {
  front: { value: 0, unit: 'hours' as unitOfTime.Base },
  back: { value: 0, unit: 'hours' as unitOfTime.Base }
}

export const buffer6hr = {
  front: { value: 6, unit: 'hours' as unitOfTime.Base },
  back: { value: 6, unit: 'hours' as unitOfTime.Base }
}

export const buffer10d = {
  front: { value: 10, unit: 'days' as unitOfTime.Base },
  back: { value: 1, unit: 'second' as unitOfTime.Base }
}
