import { useState } from 'react'

import { useIntl } from 'react-intl'

import { Demo } from '@acx-ui/rc/utils'


import { PortalDemoDefaultSize } from '../../../commonUtils'
import * as UI                   from '../../styledComponents'
import PortalImageTools          from '../PortalImageTools'
import PortalPopover             from '../PortalPopover'

export default function PortalPhotoContent (props: {
  demoValue: Demo,
  updatePhoto: (value: { url?: string, size?: number, show?: boolean,
    color?:string, text?:string }) => void
}) {
  const { $t } = useIntl()
  const { demoValue, updatePhoto } = props
  const dashedOutline = 'dashed 1px var(--acx-neutrals-50)'
  const [cursor, setCursor] = useState('none')
  const [outline, setOutline]=useState('none')
  const [clicked, setClicked] = useState(false)

  const photoTools = <PortalImageTools
    url={demoValue.photo}
    size={demoValue.photoSize}
    defaultSize={PortalDemoDefaultSize.photoSize}
    showText={false}
    showColorPic={false}
    updateDemoImg={(data) => {
      updatePhoto(data)
    }}
  />
  return (
    <PortalPopover
      content={photoTools}
      visible={clicked}
      onVisibleChange={(value) => setClicked(value)}
    ><UI.Img src={demoValue.photo}
        alt={$t({ defaultMessage: 'Photo png' })}
        style={{ cursor: cursor, outline: outline, height: (demoValue.photoSize||
          PortalDemoDefaultSize.photoSize) ,
        maxWidth: 425 }}
        onMouseOver={()=>{setCursor('pointer')
          setOutline(dashedOutline)}}
        onMouseLeave={()=>{
          if(!clicked){setCursor('none')
            setOutline('none')}}}
        onClick={()=>{setCursor('pointer')
          setClicked(true)
          setOutline(dashedOutline)}}
      />
    </PortalPopover>
  )
}


