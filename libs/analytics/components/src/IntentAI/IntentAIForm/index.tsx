import { useParams } from '@acx-ui/react-router-dom'

import { AIDrivenRRM } from './AIDrivenRRM'

const intentAIFormMap = {
  aiDrivenRRM: AIDrivenRRM
}

type IntentAIFormKey = keyof typeof intentAIFormMap

export function IntentAIForm () {
  const params = useParams() // eg: aiDrivenRRM-ae1fe928-16bb-4df0-bd30-c8d111108136 TBC
  const [ type ] = params.intentId?.split('-') || [] // aiDrivenRRRM
  const Form = intentAIFormMap[type as IntentAIFormKey]
  return <Form />
}
