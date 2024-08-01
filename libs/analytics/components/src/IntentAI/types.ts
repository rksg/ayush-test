import { EnhancedRecommendation } from './IntentAIForm/services'

// export type ScheduleSetting = {
//     date: string,
//     hour: string
// }

export type IntentAIFormDto = Pick<EnhancedRecommendation,
'status' | 'preferences' | 'sliceValue' | 'updatedAt'> & {
    id?: EnhancedRecommendation['id'],
    settings?: {
        date: string,
        hour: string
    }
}