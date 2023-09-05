/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useContext, useEffect, useState } from 'react'

import { defineMessage, FormattedMessage, useIntl } from 'react-intl'

import { Alert, Tooltip }                                     from '@acx-ui/components'
import { useGetPortalLangMutation }                           from '@acx-ui/rc/services'
import { Demo, GuestNetworkTypeEnum, Portal, PortalViewEnum } from '@acx-ui/rc/utils'
import { useParams }                                          from '@acx-ui/react-router-dom'

import { captiveTypesDescription } from '../../../Networks/wireless/NetworkForm/contentsMap'
import { portalViewTypes }         from '../contentsMap'
import PortalFormContext           from '../PortalForm/PortalFormContext'
import PortalPreviewModal          from '../PortalPreviewModal'
import * as UI                     from '../styledComponents'

import PortalBackground         from './PortalBackground'
import PortalComponents         from './PortalComponents'
import PortalLanguageSettings   from './PortalLanguageSettings'
import PortalViewContent        from './PortalViewContent'
import PortalViewContentPreview from './PortalViewContentPreview'

type PortalDemoProps = {
  networkSocial?: { [key:string]:boolean },
  networkViewType?: GuestNetworkTypeEnum,
  fromNetwork?: boolean,
  isPreview?: boolean,
  value?: Demo,
  resetDemo?: () => void,
  onChange?: (data: Demo) => void,
  viewPortalLang?: { [key:string]:string },
}
export default function PortalDemo ({
  networkSocial,
  networkViewType,
  fromNetwork,
  isPreview,
  value,
  resetDemo,
  onChange,
  viewPortalLang
}: PortalDemoProps) {
  const { $t } = useIntl()
  const { Option } = UI.Select
  const [screen, setScreen] = useState('desk')
  const [marked, setMarked] = useState({
    desk: true,
    tablet: false,
    mobile: false
  })
  const {
    portalData,
    setPortalData,
    setCurrentLang
  } = useContext(PortalFormContext)
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
  const type= view === PortalViewEnum.ClickThrough? GuestNetworkTypeEnum.ClickThrough :
    (view === PortalViewEnum.GuestPassConnect || view ===PortalViewEnum.GuestPassForgot)?
      GuestNetworkTypeEnum.GuestPass:
      (view === PortalViewEnum.SelfSignIn||view === PortalViewEnum.SelfSignInRegister) ?
        GuestNetworkTypeEnum.SelfSignIn:
        view === PortalViewEnum.HostApproval?
          GuestNetworkTypeEnum.HostApproval:GuestNetworkTypeEnum.ClickThrough
  const viewKeys = Object.keys(PortalViewEnum) as Array<keyof typeof PortalViewEnum>
  const params = useParams()
  const [getPortalLang] = useGetPortalLangMutation()
  const [portalLang, setPortalLang]=useState(viewPortalLang || {} as { [key:string]:string })
  useEffect(()=>{
    if(!isPreview && demoValue.displayLangCode){
      getPortalLang({ params: { ...params, messageName:
      demoValue.displayLangCode+'.json' } }).unwrap().then((res)=>{
        setPortalLang(res)
        setCurrentLang?.(res)
      })
    }
  }, [demoValue.displayLangCode])
  useEffect(()=>{
    if(isPreview&&viewPortalLang)setPortalLang(viewPortalLang)
  },[viewPortalLang])
  return (
    <div style={isPreview? { width: '100%', minWidth: 1100, height: '100%' } : {
      width: '95%', minWidth: 1100 }}>
      <UI.PopoverStyle />
      {demoValue.componentDisplay.wifi4eu && !demoValue.wifi4EUNetworkId?.trim()
        && <Alert style={{ width: 400, position: 'absolute', height: 30, left: 37, top: -33 }}
          message={$t(defineMessage({
            defaultMessage: 'WiFi4EU is enabled but not configured!' }))}
          type='error'
          showIcon/>}
      {demoValue.componentDisplay.termsConditions && !demoValue.termsCondition?.trim()
        && <Alert style={{ width: 400, position: 'absolute', height: 30, left: 37, top: -33 }}
          message={$t(defineMessage({
            defaultMessage: 'Terms & conditions is enabled but not configured!' }))}
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
                  {$t(portalViewTypes[key])}</Option>
              ))}
            </UI.Select></div>}
          </div>
          <div style={{ flex: '0 0 40px' }}>
            {!networkPreview &&<UI.FieldExtraTooltip>
              <Tooltip.Question
                placement='bottom'
                title={<FormattedMessage
                  {...captiveTypesDescription[type]}
                />}
              />
            </UI.FieldExtraTooltip>}
          </div>
          <div style={{ flex: 'auto', textAlign: 'center' }}>
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
          <div
            style={{ flex: '0 0 513px', textAlign: 'right', paddingRight: 5 }}>
            {!isPreview&&<div>
              {langContent}
              <UI.Button type='default' size='small'>
                <UI.Popover
                  overlayClassName={UI.popoverClassName}
                  overlayInnerStyle={{ minWidth: 260 }}
                  getPopupContainer={()=>document.getElementById('democontent') as HTMLElement}
                  content={compContent}
                  trigger='click'
                  placement='bottomLeft'
                  visible={showComponent}
                  onVisibleChange={(data)=>setShowComponent(data)}
                >
                  {$t({ defaultMessage: 'Components' })}
                </UI.Popover>
              </UI.Button>
              <PortalPreviewModal demoValue={demoValue} portalLang={portalLang}/>
              <UI.Button type='default'
                size='small'
                onClick={()=>{
                  resetDemo?.()
                }}>{$t({ defaultMessage: 'Reset' })}</UI.Button>
            </div>}
          </div>
        </div>
      </UI.LayoutHeader>
      <UI.LayoutContent id={networkPreview?'noid':'democontent'} $isPreview={isPreview}>
        {!isPreview&&<PortalBackground $isDesk={marked.desk}
          backgroundColor={demoValue.bgColor}
          updateBackgroundImg={({ url, file }) =>{
            setPortalData?.({ ...portalData as Portal, bgFile: file })
            onChange?.({ ...demoValue, bgImage: url })}}
          updateBackgroundColor={(data: string) =>
            onChange?.({ ...demoValue, bgColor: data })}/>}
        <UI.LayoutView $type={screen}
          style={{ backgroundImage: 'url("'+(isPreview?value:demoValue)?.bgImage+'")',
            backgroundColor: (isPreview?value:demoValue)?.bgColor }}>
          <div>
            {isPreview?<PortalViewContentPreview view={view}
              networkSocial={networkSocial}
              networkViewType={networkViewType}
              portalLang={portalLang}
              demoValue={value as Demo}/>:
              <PortalViewContent view={view}
                portalLang={portalLang}
                demoValue={demoValue}
                updateViewContent={(data)=>onChange?.({ ...demoValue, ...data })}
              />}
          </div>
        </UI.LayoutView>
      </UI.LayoutContent>
    </div>)
}
