import { Moment } from 'moment-timezone'

import { EnhancedRecommendation } from './IntentAIForm/services'

export type IntentAIFormSpec = Pick<EnhancedRecommendation,
'id' | 'status' | 'preferences' | 'sliceValue' | 'updatedAt' | 'metadata'>

export type IntentAIFormDto = Pick<EnhancedRecommendation,
'status' | 'preferences' | 'sliceValue' | 'updatedAt'> & {
    id?: EnhancedRecommendation['id'],
    settings: {
        date: Moment | null,
        hour: number | null
    }
}