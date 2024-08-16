import { Moment } from 'moment-timezone'

import { EnhancedIntent } from './IntentAIForm/services'



// export type IntentAIFormSpec = Pick<EnhancedRecommendation,
// 'id' | 'status' | 'preferences' | 'sliceValue' | 'updatedAt'> & {
//     metadata: {
//         scheduledAt?: string
//     }
// }

export type IntentAIFormDto = Pick<EnhancedIntent,
'status' | 'preferences' | 'sliceValue' | 'updatedAt'> & {
    id?: EnhancedIntent['id'],
    settings: {
        date: Moment | null,
        hour: number | null
    }
}