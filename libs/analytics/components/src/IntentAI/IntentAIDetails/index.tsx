import { useParams } from '@acx-ui/react-router-dom'

// TODO: should rename to IntentAIDetails
import { CrrmDetails } from '../AIDrivenRRM/IntentAIDetails/CrrmDetails'

const intentAIDetailsMap = {
  'c-crrm-channel24g-auto': CrrmDetails,
  'c-crrm-channel5g-auto': CrrmDetails,
  'c-crrm-channel6g-auto': CrrmDetails
}

type IntentAIFormKey = keyof typeof intentAIDetailsMap

export function IntentAIDetails () {
  const params = useParams()
  const code = params.code as IntentAIFormKey
  const Details = intentAIDetailsMap[code]
  return <Details />
}
