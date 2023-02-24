import { useState } from 'react'

import { RcFile } from 'antd/lib/upload'

import { Demo } from '@acx-ui/rc/utils'


import { PortalDemoDefaultSize, hoverOutline } from '../../../commonUtils'
import * as UI                                 from '../../styledComponents'
import PortalImageTools                        from '../PortalImageTools'
import PortalPopover                           from '../PortalPopover'

export default function PortalPhotoContent (props: {
  demoValue: Demo,
  updatePhoto: (value: { url?: string, size?: number, show?: boolean,
    color?:string, text?:string, file?: RcFile }) => void
}) {
  const { demoValue, updatePhoto } = props
  const [cursor, setCursor] = useState('none')
  const [outline, setOutline]=useState('none')
  const [clicked, setClicked] = useState(false)

  const photoTools = <PortalImageTools
    url={demoValue.photo}
    size={demoValue.photoRatio}
    defaultSize={PortalDemoDefaultSize.photoRatio}
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
        alt='Photo png'
        style={{ cursor: cursor, outline: outline, height: (demoValue.photoRatio||
          PortalDemoDefaultSize.photoRatio) ,
        maxWidth: 425, marginTop: 10 }}
        onMouseOver={()=>{setCursor('pointer')
          setOutline(hoverOutline)}}
        onMouseLeave={()=>{
          if(!clicked){setCursor('none')
            setOutline('none')}}}
        onClick={()=>{setCursor('pointer')
          setClicked(true)
          setOutline(hoverOutline)}}
      />
    </PortalPopover>
  )
}


