import { useState } from 'react'

import TextArea from 'antd/lib/input/TextArea'

import { Demo } from '@acx-ui/rc/utils'

import { PortalDemoDefaultSize, hoverOutline } from '../../../commonUtils'
import PortalImageTools                        from '../PortalImageTools'
import PortalPopover                           from '../PortalPopover'



export default function PortalSeconPortalSecondaryTextContentdaryTextContent (props: {
  demoValue: Demo,
  portalLang: { [key:string]:string },
  updateSecText: (value: { url?: string, size?: number, show?: boolean,
    color?:string, text?:string }) => void
}) {
  const { demoValue, updateSecText } = props
  const [cursor, setCursor] = useState('none')
  const [outline, setOutline]=useState('none')
  const [clicked, setClicked] = useState(false)
  const secTools = <PortalImageTools
    showImg={false}
    color={demoValue.secondaryColor}
    size={demoValue.secondarySize}
    defaultSize={PortalDemoDefaultSize.secondarySize}
    updateDemoImg={(data) => {
      updateSecText({ ...data, text: demoValue.secondaryText })
    }}
  />
  return (
    <PortalPopover
      content={secTools}
      visible={clicked}
      onVisibleChange={(value) => setClicked(value)}
    ><TextArea
        value={demoValue.secondaryText!==undefined?
          demoValue.secondaryText:props.portalLang.secondaryText}
        placeholder='sectexthere'
        maxLength={280}
        rows={4}
        style={{ cursor: cursor, outline: outline, resize: 'none', border: 0, textAlign: 'center',
          lineHeight: 16 * ((demoValue.secondarySize||
            PortalDemoDefaultSize.secondarySize)/PortalDemoDefaultSize.secondarySize)+'px' ,
          maxWidth: 425, color: demoValue.secondaryColor, minHeight: 60,
          fontSize: (demoValue.secondarySize||PortalDemoDefaultSize.secondarySize) }}
        onChange={(e) => {
          updateSecText({ text: e.target.value, show: true })}}
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


