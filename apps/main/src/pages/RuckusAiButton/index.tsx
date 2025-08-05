import { useState } from 'react'

import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { OnboardingAssistantDog }                   from '@acx-ui/icons'
import { RuckusAiDog }                              from '@acx-ui/icons-new'

import AICanvasModal            from '../AICanvas'
import OnboardingAssistantModal from '../OnboardingAssistant'

import * as UI from './styledComponents'

export default function RuckusAiButton () {
  const isInCanvasPlmList = useIsTierAllowed(Features.CANVAS)
  const isCanvasEnabled = useIsSplitOn(Features.CANVAS) || isInCanvasPlmList
  const isCanvasQ3Enabled = useIsSplitOn(Features.CANVAS_Q3)

  const [visible, setVisible] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)


  return <>
    { isCanvasEnabled ? <UI.AiButton
      onClick={() => {
        if(isCanvasQ3Enabled) {
          setIsModalOpen(true)
        }else {
          setVisible(!visible)
        }
      }}
    ><RuckusAiDog /></UI.AiButton>
      : <UI.ButtonSolid
        icon={<OnboardingAssistantDog />}
        onClick={() => {
          setVisible(!visible)
        }}
      />
    }
    {
      isCanvasQ3Enabled &&
        <AICanvasModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen}/>
    }
    <OnboardingAssistantModal
      visible={visible}
      setVisible={setVisible} />
  </>
}

export {
  RuckusAiButton
}
