import { useState } from 'react'

import { Demo } from '@acx-ui/rc/utils'


import * as UI          from '../../styledComponents'
import PortalImageTools from '../PortalImageTools'
import PortalPopover    from '../PortalPopover'

export default function PortalButtonContent (props: {
  demoValue: Demo,
  children?: string,
  isPreview?:boolean,
  updateButton: (value: { url?: string, size?: number, show?: boolean,
    color?:string, text?:string }) => void
}) {
  const { demoValue, updateButton, isPreview } = props
  const dashedOutline = 'dashed 1px var(--acx-neutrals-50)'
  const [cursor, setCursor] = useState('none')
  const [outline, setOutline]=useState('none')
  const [clicked, setClicked] = useState(false)

  const btnTools = <PortalImageTools
    showImg={false}
    showEye={false}
    showText={false}
    color={demoValue.buttonColor}
    updateDemoImg={(data) => {
      updateButton(data)
    }}
  />
  return (
    isPreview?<UI.PortalButton
      style={{ backgroundColor: demoValue.buttonColor }}
    >{props.children}</UI.PortalButton>:<PortalPopover
      content={btnTools}
      visible={clicked}
      onVisibleChange={(value) => setClicked(value)}
    ><UI.PortalButton
        style={{ cursor: cursor, outline: outline,backgroundColor: demoValue.buttonColor }}
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
      >{props.children}</UI.PortalButton>
    </PortalPopover>
  )
}


