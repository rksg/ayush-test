import { useParams } from '@acx-ui/react-router-dom'

import { AIDrivenRRM } from './AIDrivenRRM'

const intentAIFormMap = {
  aiDrivenRRM: AIDrivenRRM
}

type IntentAIFormKey = keyof typeof intentAIFormMap

export function IntentAIForm () {
  const params = useParams()
  const id = params.intentId as IntentAIFormKey
  const Form = intentAIFormMap[id]
  return <Form />
}
