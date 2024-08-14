import { useParams } from '@acx-ui/react-router-dom'

import { AIDrivenRRM } from '../AIDrivenRRM/IntentAIForm'

const intentAIFormMap = {
  'c-crrm-channel24g-auto': AIDrivenRRM,
  'c-crrm-channel5g-auto': AIDrivenRRM,
  'c-crrm-channel6g-auto': AIDrivenRRM
}

export function IntentAIForm () {
  const params = useParams()
  const code = params.code as keyof typeof intentAIFormMap
  const Form = intentAIFormMap[code]
  return <Form />
}
