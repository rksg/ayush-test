import { useEffect, useState } from 'react'

import { Col, Row, Tooltip }         from 'antd'
import _                             from 'lodash'
import { FormattedMessage, useIntl } from 'react-intl'

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
  value?: Demo
  onChange?: (data: Demo) => void
}
export default function PortalDemo ({
  isPreview,
  value,
  onChange
}: PortalDemoProps) {
  const [prevValue] = useState(_.cloneDeep(value as Demo))
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
  const [demoValue, setDemoValue]=useState(value as Demo)
  useEffect(()=>{
    if(demoValue){
      onChange?.(demoValue)
    }
  },[demoValue])
  const langContent = <PortalLanguageSettings
    demoValue={demoValue}
    onClose={() => setShowLanguage(false)}
    updateViewContent={(data)=>setDemoValue({ ...demoValue, ...data })}
  />
  const compContent = <PortalComponents
    onClose={() => setShowComponent(false)}
    demoValue={demoValue}
    updateViewContent={(data)=>setDemoValue({ ...demoValue, ...data })}
  />
  return (
    <>
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
                  values={{ p: (chunks) => <p>{chunks}</p> }}
                />}
                children={<UI.Img src={Question} />}
              />
            </UI.FieldExtraTooltip>
          </Col>
          <Col flex='157px'>
            <UI.ImgDesk src={marked.desk?Desk_select:Desk}
              onClick={()=>{
                setScreen('desk')
                setMarked({ desk: true, tablet: false, mobile: false })
              }}/>
            <UI.ImgTablet src={marked.tablet?Tablet_select:Tablet}
              onClick={()=>{
                setScreen('tablet')
                setMarked({ desk: false, tablet: true, mobile: false })
              }}/>
            <UI.ImgMobile src={marked.mobile?Mobile_select:Mobile}
              onClick={()=>{
                setScreen('mobile')
                setMarked({ desk: false, tablet: false, mobile: true })
              }}/>
          </Col>
          {!isPreview&&<Col flex='auto' style={{ textAlign: 'right', paddingRight: 5 }}>
            <UI.Popover
              overlayClassName='uipopover'
              content={langContent}
              trigger='click'
              placement='bottomLeft'
              visible={showLanguage}
              onVisibleChange={(data)=>setShowLanguage(data)}
            ><UI.Button onClick={(e)=>{
                e.preventDefault()
              }}>
                {$t({ defaultMessage: 'Language Settings' })}</UI.Button></UI.Popover>
            <UI.Popover
              overlayClassName='uipopover'
              content={compContent}
              trigger='click'
              placement='bottomLeft'
              visible={showComponent}
              onVisibleChange={(data)=>setShowComponent(data)}
            ><UI.Button onClick={(e)=>{
                e.preventDefault()
              }}>{$t({ defaultMessage: 'Components' })}</UI.Button></UI.Popover>
            <UI.Button onClick={(e)=>{
              e.preventDefault()
              setDemoValue(_.cloneDeep(prevValue as Demo))
            }}>{$t({ defaultMessage: 'Reset' })}</UI.Button>
          </Col>}
        </Row>
      </UI.LayoutHeader>
      <UI.LayoutContent>
        {!isPreview&&<PortalBackground $isDesk={marked.desk}
          backgroundColor={demoValue?.backgroundColor || '#FFFFFF'}
          updateBackgroundImg={(data: string) =>
            setDemoValue({ ...demoValue, backgroundImage: data })}
          updateBackgroundColor={(data: string) =>
            setDemoValue({ ...demoValue, backgroundColor: data })}/>}
        <UI.LayoutView $type={screen}
          style={{ backgroundImage: 'url("'+(isPreview?value:demoValue)?.backgroundImage+'")',
            backgroundColor: (isPreview?value:demoValue)?.backgroundColor }}>
          {isPreview?<PortalViewContentPreview view={view}
            demoValue={value as Demo}/>:
            <PortalViewContent view={view}
              demoValue={demoValue}
              updateViewContent={(data)=>setDemoValue({ ...demoValue, ...data })}
            />}
        </UI.LayoutView>
      </UI.LayoutContent>
    </>)
}
