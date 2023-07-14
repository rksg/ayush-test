import { MessageDescriptor } from 'react-intl'

import { stages }    from './contents'
import { TestStage } from './types'

export const allStagesKeys = Object.keys(stages) as TestStage[]

export function stage (
  stage: TestStage,
  title?: MessageDescriptor
) {
  return { key: stage, title: title ?? stages[stage] }
}
