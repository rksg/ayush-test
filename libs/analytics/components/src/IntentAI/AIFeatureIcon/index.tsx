
import { useIntl } from 'react-intl'

import { Button } from '@acx-ui/components'

import { AIDrivenRRMIcon, AIOperationIcon, AirFlexAIIcon, EcoFlexAIIcon } from './styledComponents'


export type AIFeatureIconProps = {
    text: string,
    onClick?: () => void
  }

export const AIFeatureIcon = (props: AIFeatureIconProps) => {
  const { $t } = useIntl()
  const { text, onClick } = props

  const drivenRRMText = 'AI-Driven RRM'
  const airFlexAIText = 'AirFlexAI'
  const aiOpsText = 'AI Operations'
  const ecoFlexAIText = 'EcoFlexAI'

  const aiDrivenRRM = $t({
    defaultMessage: drivenRRMText
  })

  const airFlexAI = $t({
    defaultMessage: airFlexAIText
  })

  const aiOps = $t({
    defaultMessage: aiOpsText
  })

  const ecoFlex = $t({
    defaultMessage: ecoFlexAIText
  })

  if (text === drivenRRMText) {
    return (
      <Button
        type='link'
        onClick={onClick}>
        <AIDrivenRRMIcon /> {aiDrivenRRM}
      </Button>
    )
  }
  else if (text === airFlexAIText) {
    return (
      <Button
        type='link'
        onClick={onClick}>
        <AirFlexAIIcon /> {airFlexAI}
      </Button>
    )
  }
  else if (text === aiOpsText) {
    return (
      <Button
        type='link'
        onClick={onClick}>
        <AIOperationIcon /> {aiOps}
      </Button>
    )
  } else if (text === ecoFlexAIText) {
    return (
      <Button
        type='link'
        onClick={onClick}>
        <EcoFlexAIIcon /> {ecoFlex}
      </Button>
    )
  } else {
    return (
      <>
      </>
    )
  }

}
