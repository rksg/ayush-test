import { useParams } from '@acx-ui/react-router-dom'

import { AIDrivenRRM } from './AIDrivenRRM'

const intentAIFormMap = {
  'c-crrm-channel24g-auto': AIDrivenRRM,
  'c-crrm-channel5g-auto': AIDrivenRRM,
  'c-crrm-channel6g-auto': AIDrivenRRM
}

type IntentAIFormKey = keyof typeof intentAIFormMap

export function IntentAIForm () {
  const params = useParams()
  const code = params.code as IntentAIFormKey
  const Form = intentAIFormMap[code]
  return <Form />
}
