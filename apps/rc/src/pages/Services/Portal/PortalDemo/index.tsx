/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react'

import { Tooltip }                                  from 'antd'
import { defineMessage, FormattedMessage, useIntl } from 'react-intl'

import { Alert }                                      from '@acx-ui/components'
import { QuestionMarkCircleOutlined }                 from '@acx-ui/icons'
import { Demo, GuestNetworkTypeEnum, PortalViewEnum } from '@acx-ui/rc/utils'

import { capativeTypesDescription } from '../../../Networks/NetworkForm/contentsMap'
import { portalViewTypes }          from '../contentsMap'
import * as UI                      from '../styledComponents'

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

  const type= view === PortalViewEnum.ClickThrough? GuestNetworkTypeEnum.ClickThrough :
    (view === PortalViewEnum.GuestPassConnect || view ===PortalViewEnum.GuestPassForgot)?
      GuestNetworkTypeEnum.GuestPass:
      (view === PortalViewEnum.SelfSignIn||view === PortalViewEnum.SelfSignInRegister) ?
        GuestNetworkTypeEnum.SelfSignIn:
        view === PortalViewEnum.HostApproval?
          GuestNetworkTypeEnum.HostApproval:GuestNetworkTypeEnum.ClickThrough
  const viewKeys = Object.keys(PortalViewEnum) as Array<keyof typeof PortalViewEnum>
  return (
    <>
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
            <UI.Label>
              {$t({ defaultMessage: 'View as:' })}
            </UI.Label>
            <UI.Select
              onChange={(data) => {setView(data as PortalViewEnum)}}
              defaultValue={PortalViewEnum.ClickThrough}
              style={{ width: 300 }}>
              {viewKeys.map((key =>
                <Option key={key} value={key}>
                  {$t(portalViewTypes[key])}</Option>
              ))}
            </UI.Select>
          </div>
          <div style={{ flex: '0 0 40px' }}>
            <UI.FieldExtraTooltip>
              <Tooltip
                placement='bottom'
                title={<FormattedMessage
                  {...capativeTypesDescription[type]}
                />}
                children={<QuestionMarkCircleOutlined/>}
              />
            </UI.FieldExtraTooltip>
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
              overlayInnerStyle={{ minWidth: 260 }}
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
          </div>}
        </div>
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
