import { useState } from 'react'

import { Demo } from '@acx-ui/rc/utils'


import { PortalDemoDefaultSize } from '../../../commonUtils'
import * as UI                   from '../../styledComponents'
import PortalImageTools          from '../PortalImageTools'
import PortalPopover             from '../PortalPopover'

export default function PortalWelcomeContent (props: {
  demoValue: Demo,
  updateWelcome: (value: { url?: string, size?: number, show?: boolean,
    color?:string, text?:string }) => void
}) {
  const { demoValue, updateWelcome } = props
  const dashedOutline = 'dashed 1px var(--acx-neutrals-50)'
  const [cursor, setCursor] = useState('none')
  const [outline, setOutline]=useState('none')
  const [clicked, setClicked] = useState(false)

  const welcomeTools = <PortalImageTools
    showImg={false}
    color={demoValue.welcomeColor}
    size={demoValue.welcomeSize as number}
    defaultSize={PortalDemoDefaultSize.welcomeSize}
    updateDemoImg={(data) => {
      updateWelcome(data)
    }}
  />
  return (
    <PortalPopover
      content={welcomeTools}
      visible={clicked}
      onVisibleChange={(value) => setClicked(value)}
    ><UI.Input type='text'
        defaultValue={demoValue.welcomeText}
        style={{ cursor: cursor, outline: outline, height: 25 * ((demoValue.welcomeSize||
          PortalDemoDefaultSize.welcomeSize)/PortalDemoDefaultSize.welcomeSize) ,
        width: 280*((demoValue.welcomeSize||PortalDemoDefaultSize.welcomeSize)
        /PortalDemoDefaultSize.welcomeSize), maxWidth: 425, color: demoValue.welcomeColor,
        fontSize: (demoValue.welcomeSize||PortalDemoDefaultSize.welcomeSize) }}
        onChange={(e) => updateWelcome({ text: e.target.value, show: true })}
        onMouseOver={() => {
          setCursor('pointer')
          setOutline(dashedOutline)
        }}
        onMouseLeave={() => {
          if (!clicked){
            setCursor('none')
            setOutline('none')
          }
        }}
        onClick={() => {
          setCursor('pointer')
          setClicked(true)
          setOutline(dashedOutline)
        }}
      />
    </PortalPopover>
  )
}


