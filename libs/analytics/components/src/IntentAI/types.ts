import { EnhancedRecommendation } from './IntentAIForm/services'

export type IntentAIFormDto = Pick<EnhancedRecommendation,
'status' | 'preferences' | 'sliceValue' | 'updatedAt'> & {
    id?: EnhancedRecommendation['id'],
    settings?: {
        date: string,
        hour: number
    }
}