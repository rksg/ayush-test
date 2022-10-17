import { useState } from 'react'

import {
  QuestionCircleOutlined
} from '@ant-design/icons'
import { Col, Row, Tooltip }         from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'

import { defaultComDisplay, PortalViewEnum } from '@acx-ui/rc/utils'

import * as UI from '../styledComponents'

import PortalBackground       from './PortalBackground'
import PortalComponents       from './PortalComponents'
import PortalLanguageSettings from './PortalLanguageSettings'
import PortalViewContent      from './PortalViewContent'

export default function PortalDemo () {
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
  const [backgroundImg, setBackgroundImg] = useState('')
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF')
  const [view, setView] = useState(PortalViewEnum.ClickThrough)
  const [componentDisplay, setComponentDisplay] =
    useState({ ...defaultComDisplay } as { [key:string]: boolean })
  const [alternativeLang, setAlternativeLang] = useState({})
  const [isReset, setIsReset] = useState(false)
  return (
    <>
      <UI.LayoutHeader>
        <Row >
          <Col flex='345px'>
            <UI.Label>
              {$t({ defaultMessage: 'View as:' })}
            </UI.Label>
            <UI.Select
              onChange={(value) => {setView(value as PortalViewEnum)}}
              defaultValue={PortalViewEnum.ClickThrough}
              style={{ width: 300 }}>
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
                  defaultMessage={`test
                `}
                  values={{ p: (chunks) => <p>{chunks}</p> }}
                />}
                children={<QuestionCircleOutlined />}
              />
            </UI.FieldExtraTooltip>
          </Col>
          <Col flex='157px'>
            <UI.DesktopOutlined $marked={marked.desk}
              onClick={()=>{
                setScreen('desk')
                setMarked({ desk: true, tablet: false, mobile: false })
              }}/>
            <UI.TabletOutlined $marked={marked.tablet}
              onClick={()=>{
                setScreen('tablet')
                setMarked({ desk: false, tablet: true, mobile: false })
              }}/>
            <UI.MobileOutlined $marked={marked.mobile}
              onClick={()=>{
                setScreen('mobile')
                setMarked({ desk: false, tablet: false, mobile: true })
              }}/>
          </Col>
          <Col flex='auto' style={{ textAlign: 'right', paddingRight: 5 }}>
            <UI.Button onClick={(e)=>{
              e.preventDefault()
              setShowLanguage(true)
              setShowComponent(false)
              setIsReset(false)
            }}>
              {$t({ defaultMessage: 'Language Settings' })}</UI.Button>
            <UI.Button onClick={(e)=>{
              e.preventDefault()
              setShowComponent(true)
              setShowLanguage(false)
              setIsReset(false)
            }}>{$t({ defaultMessage: 'Components' })}</UI.Button>
            <UI.Button onClick={(e)=>{
              e.preventDefault()
              setComponentDisplay(defaultComDisplay)
              setAlternativeLang({})
              setIsReset(true)
            }}>{$t({ defaultMessage: 'Reset' })}</UI.Button>
          </Col>
        </Row>
      </UI.LayoutHeader>
      <UI.LayoutContent>
        <PortalBackground $isDesk={marked.desk}
          backgroundColor={backgroundColor}
          updateBackgroundImg={(value: string) => setBackgroundImg(value)}
          updateBackgroundColor={(value: string) => setBackgroundColor(value)}/>
        <UI.LayoutView $type={screen}
          style={{ backgroundImage: 'url("'+backgroundImg+'")',
            backgroundColor: backgroundColor }}>
          <PortalViewContent view={view}
            componentDisplay={componentDisplay}
            alternativeLang={alternativeLang}/>
        </UI.LayoutView>
        <div style={{ width: '95%', position: 'absolute' }}>
          <PortalLanguageSettings isShow={showLanguage}
            isReset={isReset}
            onClose={() => setShowLanguage(false)}
            updateAlternativeLanguage={(value) => setAlternativeLang(value)}
          />
          <PortalComponents isShow={showComponent}
            isReset={isReset}
            onClose={() => setShowComponent(false)}
            updateComponentDisplay={(value) => setComponentDisplay(value)}
          />
        </div>
      </UI.LayoutContent>
    </>)
}
