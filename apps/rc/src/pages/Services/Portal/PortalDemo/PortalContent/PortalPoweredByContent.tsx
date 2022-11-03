import { useState } from 'react'

import { useIntl } from 'react-intl'

import { Demo } from '@acx-ui/rc/utils'


import { PortalDemoDefaultSize } from '../../../commonUtils'
import * as UI                   from '../../styledComponents'
import PortalImageTools          from '../PortalImageTools'
import PortalPopover             from '../PortalPopover'

export default function PortalPoweredByContent (props: {
  demoValue: Demo,
  updatePoweredBy:(value: { url?:string,size?:number,show?:boolean,text?:string,
    textsize?:number,bgcolor?:string,color?:string }) => void
}) {
  const { $t } = useIntl()
  const { demoValue, updatePoweredBy } = props
  const dashedOutline = 'dashed 1px var(--acx-neutrals-50)'
  const [cursorTwo, setCursorTwo] = useState('none')
  const [outlineTwo, setOutlineTwo] = useState('none')
  const [cursorTwoText, setCursorTwoText] = useState('none')
  const [outlineTwoText, setOutlineTwoText] = useState('none')
  const [cursorTwoImg, setCursorTwoImg] = useState('none')
  const [outlineTwoImg, setOutlineTwoImg] = useState('none')
  const [poweredClicked, setPoweredClicked] = useState(false)
  const [poweredTextClicked, setPoweredTextClicked] = useState(false)
  const [poweredImgClicked, setPoweredImgClicked] = useState(false)
  const closeDivPopover = ()=>{
    setCursorTwo('none')
    setOutlineTwo('none')
    setPoweredClicked(false)
  }
  const poweredImgTools = <PortalImageTools
    showEye={false}
    showText={false}
    showColorPic={false}
    url={demoValue.poweredImg as string}
    size={demoValue.poweredImgSize as number}
    defaultSize={PortalDemoDefaultSize.poweredImgSize}
    updateDemoImg={(data)=>{
      updatePoweredBy({ ...data, textsize: demoValue.poweredSize,
        bgcolor: demoValue.poweredBackgroundColor })
    }}
  />
  const poweredTextTools = <PortalImageTools
    showEye={false}
    showImg={false}
    size={demoValue.poweredSize as number}
    defaultSize={PortalDemoDefaultSize.poweredSize}
    color={demoValue.poweredColor}
    updateDemoImg={(data) => {
      updatePoweredBy({ ...data, size: demoValue.poweredImgSize,
        bgcolor: demoValue.poweredBackgroundColor, textsize: data.size })
    }}
  />
  const poweredTools = <PortalImageTools
    showText={false}
    showImg={false}
    color={demoValue.poweredBackgroundColor}
    updateDemoImg={(data) => {
      updatePoweredBy({ ...data,bgcolor: data.color, color: demoValue.poweredColor })
    }}
  />
  return (
    <UI.SelectedDiv style={{ paddingLeft: Math.min(200/(demoValue.poweredImgSize
      /PortalDemoDefaultSize.poweredImgSize),
    200/((demoValue.poweredSize)
      /PortalDemoDefaultSize.poweredSize))+'px' }}
    ><PortalPopover
        content={poweredTools}
        visible={poweredClicked}
        onVisibleChange={(value) => setPoweredClicked(value)}
      ><div style={{ outline: outlineTwo, cursor: cursorTwo,
          backgroundColor: demoValue.poweredBackgroundColor }}
        onMouseOver={() => {
          setCursorTwo('pointer')
          setOutlineTwo(dashedOutline)
        }}
        placeholder='poweredbackground'
        onMouseLeave={() => {
          if (!poweredClicked) {
            setCursorTwo('none')
            setOutlineTwo('none')
          }
        }}
        onClick={() => {
          setOutlineTwoText('none')
          setOutlineTwoImg('none')
          setCursorTwo('pointer')
          setPoweredClicked(true)
          setOutlineTwo(dashedOutline)
        }}>
          {demoValue.componentDisplay?.PoweredBy &&
        <PortalPopover
          content={poweredTextTools}
          visible={poweredTextClicked}
          onVisibleChange={(value) => setPoweredTextClicked(value)}>
          <UI.FieldText style={{ fontSize: demoValue.poweredSize,
            width: 152*(demoValue.poweredSize
          /PortalDemoDefaultSize.poweredSize)+'px' ,
            lineHeight: 24 * (demoValue.poweredSize
          /PortalDemoDefaultSize.poweredSize)+'px' ,
            maxWidth: 425, color: demoValue.poweredColor,textAlign: 'left',
            cursor: cursorTwoText, outline: outlineTwoText
          }}
          placeholder='poweredtext'
          onMouseOver={(e)=>{
            e.stopPropagation()
            closeDivPopover()
            setCursorTwoText('pointer')
            setOutlineTwoText(dashedOutline)
          }}
          onMouseLeave={(e) => {
            e.stopPropagation()
            if (!poweredTextClicked) {
              setCursorTwoText('none')
              setOutlineTwoText('none')
            }
          }}
          onClick={(e) => {
            e.stopPropagation()
            closeDivPopover()
            setOutlineTwoImg('none')
            setCursorTwoText('pointer')
            setPoweredTextClicked(true)
            setOutlineTwoText(dashedOutline)
          }}
          >
            {$t({ defaultMessage: 'Powered By' })}</UI.FieldText></PortalPopover>}
          {demoValue.componentDisplay?.PoweredBy && <PortalPopover
            content={poweredImgTools}
            visible={poweredImgClicked}
            onVisibleChange={(value) => setPoweredImgClicked(value)}>
            <UI.Img src={demoValue.poweredImg}
              alt={$t({ defaultMessage: 'poweredimage' })}
              style={{
                marginLeft: 50,
                cursor: cursorTwoImg, outline: outlineTwoImg,
                height: demoValue.poweredImgSize,
                maxWidth: 425
              }}
              onMouseOver={(e)=>{
                e.stopPropagation()
                closeDivPopover()
                setCursorTwoImg('pointer')
                setOutlineTwoImg(dashedOutline)
              }}
              onMouseLeave={(e) => {
                e.stopPropagation()
                if (!poweredImgClicked) {
                  setCursorTwoImg('none')
                  setOutlineTwoImg('none')
                }
              }}
              onClick={(e) => {
                e.stopPropagation()
                setOutlineTwoText('none')
                closeDivPopover()
                setCursorTwoImg('pointer')
                setPoweredImgClicked(true)
                setOutlineTwoImg(dashedOutline)
              }}
            ></UI.Img></PortalPopover>}</div></PortalPopover></UI.SelectedDiv>
  )
}


