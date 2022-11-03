import { useState } from 'react'

import { Col, Row, Tooltip }                        from 'antd'
import { defineMessage, FormattedMessage, useIntl } from 'react-intl'

import { Alert }                from '@acx-ui/components'
import { Demo, PortalViewEnum } from '@acx-ui/rc/utils'

import Mobile        from '../../../../assets/images/portal-demo/mobile.svg'
import Mobile_select from '../../../../assets/images/portal-demo/mobile_selected.svg'
import Tablet        from '../../../../assets/images/portal-demo/pad.svg'
import Tablet_select from '../../../../assets/images/portal-demo/pad_selected.svg'
import Desk          from '../../../../assets/images/portal-demo/pc.svg'
import Desk_select   from '../../../../assets/images/portal-demo/pc_selected.svg'
import Question      from '../../../../assets/images/portal-demo/question.svg'
import * as UI       from '../styledComponents'

import PortalBackground         from './PortalBackground'
import PortalComponents         from './PortalComponents'
import PortalLanguageSettings   from './PortalLanguageSettings'
import PortalViewContent        from './PortalViewContent'
import PortalViewContentPreview from './PortalViewContentPreview'



type PortalDemoProps = {
  isPreview?: boolean
  value?: Demo,
  resetDemo?: () => void,
  onChange?: (data: Demo) => void
}
export default function PortalDemo ({
  isPreview,
  value,
  resetDemo,
  onChange
}: PortalDemoProps) {
  const { $t } = useIntl()
  const { Option } = UI.Select
  const [screen, setScreen] = useState('desk')
  const [marked, setMarked] = useState({
    desk: true,
    tablet: false,
    mobile: false
  })
  const [showLanguage, setShowLanguage] = useState(false)
  const [showComponent, setShowComponent] = useState(false)
  const [view, setView] = useState(PortalViewEnum.ClickThrough)
  const demoValue = value as Demo
  const langContent = <PortalLanguageSettings
    demoValue={demoValue}
    updateViewContent={(data)=>onChange?.({ ...demoValue, ...data })}
  />
  const compContent = <PortalComponents
    demoValue={demoValue}
    updateViewContent={(data)=>onChange?.({ ...demoValue, ...data })}
  />
  return (
    <>
      {demoValue.componentDisplay.WiFi4EU && !demoValue.wifi4EU
        && <Alert style={{ width: 400, position: 'absolute', height: 30, left: 37, top: -33 }}
          message={$t(defineMessage({
            defaultMessage: 'WiFi4EU is enabled but not configured!' }))}
          type='error'
          showIcon/>}
      <UI.LayoutHeader>
        <Row >
          <Col flex={isPreview? '305px':'345px'}>
            <UI.Label>
              {$t({ defaultMessage: 'View as:' })}
            </UI.Label>
            <UI.Select
              onChange={(data) => {setView(data as PortalViewEnum)}}
              defaultValue={PortalViewEnum.ClickThrough}
              style={{ width: isPreview? 250:300 }}>
              {Object.keys(PortalViewEnum).map((key =>
                <Option key={key} value={PortalViewEnum[key as keyof typeof PortalViewEnum]}>
                  {PortalViewEnum[key as keyof typeof PortalViewEnum]}</Option>
              ))}
            </UI.Select>
          </Col>
          <Col flex='20px'>
            <UI.FieldExtraTooltip>
              <Tooltip
                placement='bottom'
                title={<FormattedMessage
                  defaultMessage={`tips here
                `}
                />}
                children={<UI.Img src={Question} />}
              />
            </UI.FieldExtraTooltip>
          </Col>
          <Col flex='157px'>
            <UI.ImgDesk src={marked.desk?Desk_select:Desk}
              alt='deskicon'
              onClick={()=>{
                setScreen('desk')
                setMarked({ desk: true, tablet: false, mobile: false })
              }}/>
            <UI.ImgTablet src={marked.tablet?Tablet_select:Tablet}
              alt='tableticon'
              onClick={()=>{
                setScreen('tablet')
                setMarked({ desk: false, tablet: true, mobile: false })
              }}/>
            <UI.ImgMobile src={marked.mobile?Mobile_select:Mobile}
              alt='mobileicon'
              onClick={()=>{
                setScreen('mobile')
                setMarked({ desk: false, tablet: false, mobile: true })
              }}/>
          </Col>
          {!isPreview&&<Col flex='auto' style={{ textAlign: 'right', paddingRight: 5 }}>
            <UI.Popover
              overlayClassName='uipopover'
              overlayInnerStyle={{ maxHeight: 500 , overflowY: 'auto' }}
              getPopupContainer={()=>document.getElementById('democontent') as HTMLElement}
              content={langContent}
              trigger='click'
              placement='bottomLeft'
              visible={showLanguage}
              onVisibleChange={(data)=>setShowLanguage(data)}
            ><UI.Button type='link'>
                {$t({ defaultMessage: 'Language Settings' })}</UI.Button></UI.Popover>
            <UI.Popover
              overlayClassName='uipopover'
              getPopupContainer={()=>document.getElementById('democontent') as HTMLElement}
              content={compContent}
              trigger='click'
              placement='bottomLeft'
              visible={showComponent}
              onVisibleChange={(data)=>setShowComponent(data)}
            ><UI.Button type='link'>{$t({ defaultMessage: 'Components' })}</UI.Button></UI.Popover>
            <UI.Button type='link'
              onClick={()=>{
                resetDemo?.()
              }}>{$t({ defaultMessage: 'Reset' })}</UI.Button>
          </Col>}
        </Row>
      </UI.LayoutHeader>
      <UI.LayoutContent id='democontent'>
        {!isPreview&&<PortalBackground $isDesk={marked.desk}
          backgroundColor={demoValue.backgroundColor}
          updateBackgroundImg={(data: string) =>
            onChange?.({ ...demoValue, backgroundImage: data })}
          updateBackgroundColor={(data: string) =>
            onChange?.({ ...demoValue, backgroundColor: data })}/>}
        <UI.LayoutView $type={screen}
          style={{ backgroundImage: 'url("'+(isPreview?value:demoValue)?.backgroundImage+'")',
            backgroundColor: (isPreview?value:demoValue)?.backgroundColor }}>
          {isPreview?<PortalViewContentPreview view={view}
            demoValue={value as Demo}/>:
            <PortalViewContent view={view}
              demoValue={demoValue}
              updateViewContent={(data)=>onChange?.({ ...demoValue, ...data })}
            />}
        </UI.LayoutView>
      </UI.LayoutContent>
    </>)
}
