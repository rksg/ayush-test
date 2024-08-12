import { Moment } from 'moment-timezone'

import { EnhancedRecommendation } from './IntentAIForm/services'

export type IntentAIFormDto = Pick<EnhancedRecommendation,
'status' | 'preferences' | 'sliceValue' | 'updatedAt'> & {
    id?: EnhancedRecommendation['id'],
    settings?: {
        date: Moment,
        hour: number
    }
}