import { EnhancedRecommendation } from './IntentAIForm/services'

export type IntentAIFormDto = Pick<EnhancedRecommendation,
'status' | 'preferences' | 'sliceValue' | 'updatedAt'> & {
    id?: EnhancedRecommendation['id']
    scheduledDate?: string,
    scheduledTime?: string
}