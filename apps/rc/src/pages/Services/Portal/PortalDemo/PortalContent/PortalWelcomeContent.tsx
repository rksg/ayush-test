import { useState } from 'react'

import { Demo } from '@acx-ui/rc/utils'


import { PortalDemoDefaultSize, hoverOutline } from '../../../commonUtils'
import * as UI                                 from '../../styledComponents'
import PortalImageTools                        from '../PortalImageTools'
import PortalPopover                           from '../PortalPopover'

export default function PortalWelcomeContent (props: {
  demoValue: Demo,
  portalLang: { [key:string]:string },
  updateWelcome: (value: { url?: string, size?: number, show?: boolean,
    color?:string, text?:string }) => void
}) {
  const { demoValue, updateWelcome } = props
  const [cursor, setCursor] = useState('none')
  const [outline, setOutline]=useState('none')
  const [clicked, setClicked] = useState(false)
  const welcomeTools = <PortalImageTools
    showImg={false}
    color={demoValue.welcomeColor}
    size={demoValue.welcomeSize as number}
    defaultSize={PortalDemoDefaultSize.welcomeSize}
    updateDemoImg={(data) => {
      updateWelcome({ ...data, text: demoValue.welcomeText })
    }}
  />
  return (
    <PortalPopover
      content={welcomeTools}
      visible={clicked}
      onVisibleChange={(value) => setClicked(value)}
    ><UI.Input type='text'
        maxLength={100}
        value={demoValue.welcomeText||props.portalLang.welcomeText}
        placeholder='welcometext'
        style={{ cursor: cursor, outline: outline, height: 25 * (demoValue.welcomeSize
          /PortalDemoDefaultSize.welcomeSize), fontWeight: 600,
        lineHeight: 20*((demoValue.welcomeSize)
        /PortalDemoDefaultSize.welcomeSize)+'px',
        width: 310*((demoValue.welcomeSize)
        /PortalDemoDefaultSize.welcomeSize), maxWidth: 425, color: demoValue.welcomeColor,
        fontSize: (demoValue.welcomeSize) }}
        onChange={(e) => updateWelcome({ text: e.target.value, show: true })}
        onMouseOver={() => {
          setCursor('pointer')
          setOutline(hoverOutline)
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
          setOutline(hoverOutline)
        }}
      />
    </PortalPopover>
  )
}


