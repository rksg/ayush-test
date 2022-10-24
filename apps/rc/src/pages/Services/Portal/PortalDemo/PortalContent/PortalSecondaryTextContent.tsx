import { useState } from 'react'

import { Demo } from '@acx-ui/rc/utils'


import { PortalDemoDefaultSize } from '../../../commonUtils'
import * as UI                   from '../../styledComponents'
import PortalImageTools          from '../PortalImageTools'
import PortalPopover             from '../PortalPopover'

export default function PortalSecondaryTextContent (props: {
  demoValue: Demo,
  updateSecText: (value: { url?: string, size?: number, show?: boolean,
    color?:string, text?:string }) => void
}) {
  const { demoValue, updateSecText } = props
  const dashedOutline = 'dashed 1px var(--acx-neutrals-50)'
  const [cursor, setCursor] = useState('none')
  const [outline, setOutline]=useState('none')
  const [clicked, setClicked] = useState(false)

  const secTools = <PortalImageTools
    showImg={false}
    color={demoValue.secondaryColor}
    size={demoValue.secondarySize}
    defaultSize={PortalDemoDefaultSize.secondarySize}
    updateDemoImg={(data) => {
      updateSecText(data)
    }}
  />
  return (
    <PortalPopover
      content={secTools}
      visible={clicked}
      onVisibleChange={(value) => setClicked(value)}
    ><UI.FieldText
        style={{ cursor: cursor, outline: outline,
          lineHeight: 24 * ((demoValue.secondarySize||
            PortalDemoDefaultSize.secondarySize)/PortalDemoDefaultSize.secondarySize)+'px' ,
          maxWidth: 425, color: demoValue.secondaryColor,
          fontSize: (demoValue.secondarySize||PortalDemoDefaultSize.secondarySize) }}
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
      >{demoValue.secondaryText}</UI.FieldText>
    </PortalPopover>
  )
}


