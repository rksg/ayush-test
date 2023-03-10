import { useState } from 'react'

import TextArea from 'antd/lib/input/TextArea'

import { Demo } from '@acx-ui/rc/utils'

import { PortalDemoDefaultSize, hoverOutline } from '../../../commonUtils'
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
  const [changed, setChanged] = useState(false)
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
    ><TextArea
        maxLength={100}
        value={changed?demoValue.welcomeText:(demoValue.welcomeText||props.portalLang.welcomeText)}
        placeholder='welcometext'
        style={{ cursor: cursor, outline: outline, height: 25 * (demoValue.welcomeSize
          /PortalDemoDefaultSize.welcomeSize), fontWeight: 600, resize: 'none', minHeight: 60,
        lineHeight: 20*((demoValue.welcomeSize)
        /PortalDemoDefaultSize.welcomeSize)+'px', border: 0,
        width: 310*((demoValue.welcomeSize)
        /PortalDemoDefaultSize.welcomeSize), maxWidth: 425, color: demoValue.welcomeColor,
        fontSize: (demoValue.welcomeSize) }}
        onChange={(e) => {
          setChanged(true)
          updateWelcome({ text: e.target.value, show: true })}}
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


