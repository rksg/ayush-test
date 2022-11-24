/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react'

import { Tooltip }                                  from 'antd'
import { defineMessage, FormattedMessage, useIntl } from 'react-intl'

import { Alert }                                                          from '@acx-ui/components'
import { QuestionMarkCircleOutlined }                                     from '@acx-ui/icons'
import { Demo, GuestNetworkTypeEnum, PortalLanguageEnum, PortalViewEnum } from '@acx-ui/rc/utils'

import { captiveTypesDescription } from '../../../Networks/NetworkForm/contentsMap'
import { getLanguage }             from '../../commonUtils'
import { portalViewTypes }         from '../contentsMap'
import * as UI                     from '../styledComponents'

import PortalBackground         from './PortalBackground'
import PortalComponents         from './PortalComponents'
import PortalLanguageSettings   from './PortalLanguageSettings'
import PortalViewContent        from './PortalViewContent'
import PortalViewContentPreview from './PortalViewContentPreview'



type PortalDemoProps = {
  fromNetwork?: boolean,
  isPreview?: boolean,
  value?: Demo,
  resetDemo?: () => void,
  onChange?: (data: Demo) => void
}
export default function PortalDemo ({
  fromNetwork,
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
  const networkPreview = (isPreview && fromNetwork)
  const [networkDisplayLang, setNetworkDisplayLang] = useState(demoValue.displayLang)
  const type= view === PortalViewEnum.ClickThrough? GuestNetworkTypeEnum.ClickThrough :
    (view === PortalViewEnum.GuestPassConnect || view ===PortalViewEnum.GuestPassForgot)?
      GuestNetworkTypeEnum.GuestPass:
      (view === PortalViewEnum.SelfSignIn||view === PortalViewEnum.SelfSignInRegister) ?
        GuestNetworkTypeEnum.SelfSignIn:
        view === PortalViewEnum.HostApproval?
          GuestNetworkTypeEnum.HostApproval:GuestNetworkTypeEnum.ClickThrough
  useEffect(()=>{
    if(networkPreview){
      setNetworkDisplayLang(demoValue.displayLang)
    }
  },[demoValue])
  const viewKeys = Object.keys(PortalViewEnum) as Array<keyof typeof PortalViewEnum>
  const alternativeLang = demoValue.alternativeLang
  const displayLang = getLanguage(demoValue.displayLang as keyof typeof PortalLanguageEnum)
  let langs = [] as string[]
  const langKeys = Object.keys(alternativeLang || {}) as Array<keyof typeof PortalLanguageEnum>
  langKeys.map((key) =>{
    if(alternativeLang?.[key]) langs.push(getLanguage(key))
    return langs
  }
  )
  return (
    <>
      <UI.PopoverStyle />
      {demoValue.componentDisplay.WiFi4EU && !demoValue.wifi4EU
        && <Alert style={{ width: 400, position: 'absolute', height: 30, left: 37, top: -33 }}
          message={$t(defineMessage({
            defaultMessage: 'WiFi4EU is enabled but not configured!' }))}
          type='error'
          showIcon/>}
      <UI.LayoutHeader>
        <div style={{ display: 'flex' }}>
          <div
            style={{ flex: '0 0 345px' }}>
            {!networkPreview &&<div><UI.Label>
              {$t({ defaultMessage: 'View as:' })}
            </UI.Label>
            <UI.Select
              onChange={(data) => {setView(data as PortalViewEnum)}}
              defaultValue={PortalViewEnum.ClickThrough}
              style={{ width: 300 }}>
              {viewKeys.map((key =>
                <Option key={key} value={key}>
                  {$t(portalViewTypes[key])}}</Option>
              ))}
            </UI.Select></div>}
          </div>
          <div style={{ flex: '0 0 40px' }}>
            {!networkPreview &&<UI.FieldExtraTooltip>
              <Tooltip
                placement='bottom'
                title={<FormattedMessage
                  {...captiveTypesDescription[type]}
                />}
                children={<QuestionMarkCircleOutlined/>}
              />
            </UI.FieldExtraTooltip>}
          </div>
          <div style={{ flex: '0 0 190px', marginTop: -5 }}>
            <UI.DesktopOutlined $marked={marked.desk}
              title='deskicon'
              onClick={()=>{
                setScreen('desk')
                setMarked({ desk: true, tablet: false, mobile: false })
              }}/>
            <UI.TabletOutlined $marked={marked.tablet}
              title='tableticon'
              onClick={()=>{
                setScreen('tablet')
                setMarked({ desk: false, tablet: true, mobile: false })
              }}/>
            <UI.MobileOutlined $marked={marked.mobile}
              title='mobileicon'
              onClick={()=>{
                setScreen('mobile')
                setMarked({ desk: false, tablet: false, mobile: true })
              }}/>
          </div>
          {!isPreview&&<div
            style={{ flex: 'auto', textAlign: 'right', paddingRight: 5 }}>
            <UI.Popover
              overlayClassName={UI.popoverClassName}
              overlayInnerStyle={{ maxHeight: 500 , overflowY: 'auto' }}
              getPopupContainer={()=>document.getElementById('democontent') as HTMLElement}
              content={langContent}
              trigger='click'
              placement='bottomLeft'
              visible={showLanguage}
              onVisibleChange={(data)=>setShowLanguage(data)}
            ><UI.Button type='default' size='small'>
                {$t({ defaultMessage: 'Language Settings' })}</UI.Button></UI.Popover>
            <UI.Popover
              overlayClassName={UI.popoverClassName}
              overlayInnerStyle={{ minWidth: 260 }}
              getPopupContainer={()=>document.getElementById('democontent') as HTMLElement}
              content={compContent}
              trigger='click'
              placement='bottomLeft'
              visible={showComponent}
              onVisibleChange={(data)=>setShowComponent(data)}
            ><UI.Button type='default' size='small'>{$t({ defaultMessage: 'Components' })}
              </UI.Button></UI.Popover>
            <UI.Button type='default'
              size='small'
              onClick={()=>{
                resetDemo?.()
              }}>{$t({ defaultMessage: 'Reset' })}</UI.Button>
          </div>}
          {(isPreview||networkPreview)&&<div
            style={{ flex: 'auto', textAlign: 'right', paddingRight: 40 }}>
            <UI.Select defaultValue={displayLang} style={{ width: 250, textAlign: 'left' }}>
              <Option key={displayLang}>
                {displayLang}
              </Option>
              {langs.map(
                key =><Option key={key}>{key}</Option>
              )}
            </UI.Select>
          </div>
          }
        </div>
      </UI.LayoutHeader>
      <UI.LayoutContent id={networkPreview?'noid':'democontent'}>
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
