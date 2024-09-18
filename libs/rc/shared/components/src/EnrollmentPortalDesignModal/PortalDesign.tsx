import { forwardRef, Ref, useEffect, useImperativeHandle, useRef, useState } from 'react'

import { Form, Switch }                              from 'antd'
import _                                             from 'lodash'
import { MessageDescriptor, defineMessage, useIntl } from 'react-intl'

import { Loader }                                                                                                                                               from '@acx-ui/components'
import { useGetUIConfigurationQuery, useUpdateUIConfigurationMutation, useLazyGetUIConfigurationLogoImageQuery, useLazyGetUIConfigurationBackgroundImageQuery } from '@acx-ui/rc/services'
import { DefaultUIConfiguration, UIConfiguration }                                                                                                              from '@acx-ui/rc/utils'


import { BackgroundContent } from './BackgroundContent'
import { BodyContent }       from './BodyContent'
import { ButtonContent }     from './ButtonContent'
import Wifi4eu               from './images/WiFi4euBanner.svg'
import { LogoContent }       from './LogoContent'
import { PopOver }           from './PopOver'
import { PoweredByContent }  from './PoweredByContent'
import * as UI               from './styledComponents'
import { TitleContent }      from './TitleContent'
import WiFi4euModal          from './Wifi4euModal'
export interface PortalDesignProps {
  id: string
}


enum PortalComponentEnum {
  logo = 'logo',
  poweredBy = 'poweredby',
  wifi4eu ='wifi4eu'
}

const PortalComponents: Record<PortalComponentEnum, MessageDescriptor> = {
  [PortalComponentEnum.logo]: defineMessage({ defaultMessage: 'Logo' }),
  [PortalComponentEnum.poweredBy]: defineMessage({ defaultMessage: 'Powered By' }),
  [PortalComponentEnum.wifi4eu]: defineMessage({ defaultMessage: 'WiFi4EU Snippet' })
}

function PortalComponentList (props: {
  display: Map<keyof typeof PortalComponentEnum, boolean>
  onDisplayChange: (v:Map<keyof typeof PortalComponentEnum, boolean>) =>void
  value: UIConfiguration
  onValueChange: (v:UIConfiguration) => void
}) {
  const { display, onDisplayChange, value, onValueChange } = props
  const valueKeys = Object.keys(PortalComponentEnum) as Array<keyof typeof PortalComponentEnum>
  const { $t } = useIntl()
  return (
    <Form layout='vertical'>
      <Form.Item
        name='manageComponents'
        label={$t({ defaultMessage: 'Manage Components' })}
        children={<div>
          {valueKeys.map((key => <UI.CommonLabel key={key+'label'}>
            <UI.ComponentLabel key={key}>
              {$t(PortalComponents[PortalComponentEnum[key]])}
            </UI.ComponentLabel>
            <Switch
              key={key+'switch'}
              checked={display.get(key)}
              onClick={(v) => {
                onDisplayChange(new Map(display).set(key, v))
              }}
            />
            {PortalComponentEnum[key] ===PortalComponentEnum.wifi4eu &&
               <WiFi4euModal wifi4eu={value.wifi4EUNetworkId}
                 onChange={(v) => onValueChange({ ...value, wifi4EUNetworkId: v })}/>
            }
          </UI.CommonLabel>
          ))}
        </div>}
      />
    </Form>
  )
}


const PortalDesign = forwardRef(function PortalDesign (props: PortalDesignProps,
  ref: Ref<{ onFinish: ()=> void }>){
  const{ id } = props
  const { $t } = useIntl()
  const [marked, setMarked] = useState({
    desk: true,
    tablet: false,
    mobile: false
  })
  const [screen, setScreen] = useState('desk')
  const [showComponent, setShowComponent] = useState(false)
  const original = useRef<UIConfiguration>(DefaultUIConfiguration)
  const [value, setValue] = useState<UIConfiguration>(DefaultUIConfiguration)
  const [display, setDisplay] = useState<Map<keyof typeof PortalComponentEnum, boolean>>(new Map([
    ['logo', value.uiStyleSchema.logoImageFileName !== undefined],
    ['poweredBy', !value.disablePoweredBy],
    ['wifi4eu', value.wifi4EUNetworkId !== undefined]
  ]))

  const reset = () => {
    setValue(original.current!!)
    setDisplay(new Map([
      ['logo', original.current!!.uiStyleSchema.logoImageFileName !== undefined],
      ['poweredBy', !(original.current!!.disablePoweredBy)],
      ['wifi4eu', original.current!!.wifi4EUNetworkId !== undefined]
    ]))
  }

  const configurationQuery = useGetUIConfigurationQuery({ params: { id: id } })
  const [updateConfiguration] = useUpdateUIConfigurationMutation()
  const [getUIConfigLogoImage] = useLazyGetUIConfigurationLogoImageQuery()
  const [getUIConfigBackgroundImage] = useLazyGetUIConfigurationBackgroundImageQuery()
  const fetchImage = async (imageType: string) => {
    if (imageType === 'logoImages')
      return getUIConfigLogoImage({ params: { id: id } } ).unwrap()
    else if (imageType === 'backgroundImages')
      return getUIConfigBackgroundImage({ params: { id: id } } ).unwrap()
    return Promise.resolve()
  }

  useEffect(()=>{
    if (configurationQuery.isLoading) return
    if (configurationQuery.data) {
      original.current = configurationQuery.data
      if(configurationQuery.data.uiStyleSchema.logoImageFileName) {
        fetchImage('logoImages')
          .then(res => {
            if (res) {
              original.current= { ...original.current, logoImage: res.fileUrl }
              setValue(original.current)
            }
          })
      }

      if (configurationQuery.data.uiStyleSchema.backgroundImageName) {
        fetchImage('backgroundImages')
          .then(res => {
            if (res) {
              original.current= { ...original.current, backgroundImage: res.fileUrl }
              setValue(original.current)
            }
          })
      }
      setValue(configurationQuery.data)
      setDisplay(new Map([
        ['logo', configurationQuery.data.uiStyleSchema.logoImageFileName !== undefined],
        ['poweredBy', !(configurationQuery.data.disablePoweredBy)],
        ['wifi4eu', configurationQuery.data.wifi4EUNetworkId !== undefined]
      ]))
    }
  }, [configurationQuery])

  const handleSubmit = async () => {
    if (!value) return
    let data: UIConfiguration = { ...value }
    if (!display.get('wifi4eu')) {
      data.wifi4EUNetworkId = undefined
    }
    if (!display.get('logo')) {
      data.logoImage = undefined
      data.uiStyleSchema = {
        ...data.uiStyleSchema,
        logoImageFileName: undefined
      }
    } else if (!data.logoImage && original.current.uiStyleSchema.logoImageFileName) {
      data.uiStyleSchema = {
        ...data.uiStyleSchema,
        logoImageFileName: undefined
      }
    }

    if (!display.get('poweredBy')) {
      data.disablePoweredBy = true
    }

    if (!_.isEqual(data, original.current)) {
      if (data.backgroundImage === original.current.backgroundImage) {
        data.backgroundImage = undefined
      } else if (!data.backgroundImage && original.current.backgroundImage) {
        data.backgroundImage = undefined
      }

      if (data.logoImage === original.current.logoImage) {
        data.logoImage = undefined
      }

      data.welcomeName = 'name'
      data.welcomeTitle ='welcome'
      const formData = new FormData()
      // eslint-disable-next-line max-len
      const blob = new Blob([JSON.stringify(_.omit(data, ['backgroundImage', 'logoImage']))], { type: 'application/json' })
      formData.append('uiConfiguration', blob )
      if (data.backgroundImage && data.backgroundImageFile) {
        formData.append('backgroundImage', data.backgroundImageFile)
      }

      if (data.logoImage && data.logoFile) {
        formData.append('logoImage', data.logoFile)
      }

      await updateConfiguration({ params: { id: id }, payload: formData })
        .unwrap()
        .catch((e)=> {
          // eslint-disable-next-line no-console
          console.log(e)
        })
    }
  }

  useImperativeHandle(ref, ()=> ({
    onFinish () {
      handleSubmit()
    }
  }))


  return (
    <Loader states={[configurationQuery]}>
      <div style={{ width: '100%', minWidth: 1100, height: '100%', minHeight: 800 }}>
        <UI.PopoverStyle />
        <UI.LayoutHeader>
          <div style={{ display: 'flex' }}>
            <div
              style={{ flex: '0 0 345px', paddingTop: 4 }}>
              <div style={{ fontSize: 16, color: 'var(--acx-primary-black)', fontWeight: 600 }}>
                {$t({ defaultMessage: 'Portal Design' })}
              </div>
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
              style={{
                flex: '0 0 513px',
                textAlign: 'right',
                verticalAlign: 'middle',
                paddingRight: 50,
                paddingTop: 4
              }}>
              {<div>
                <UI.Button type='default' size='small'>
                  <PopOver overlayInnerStyle={{ minWidth: 260 }}
                    content={<PortalComponentList
                      display={display}
                      onDisplayChange={setDisplay}
                      value={value}
                      onValueChange={setValue}/>}
                    visible={showComponent}
                    placement='bottomLeft'
                    onVisibleChange={(v)=>setShowComponent(v)}
                  >
                    {$t({ defaultMessage: 'Components' })}
                  </PopOver>
                </UI.Button>
                <UI.Button type='default'
                  size='small'
                  onClick={()=>{reset()}}>{$t({ defaultMessage: 'Reset' })}
                </UI.Button>
              </div>}
            </div>
          </div>
        </UI.LayoutHeader>
        <UI.LayoutContent id={'democontent'}
          $isPreview={true}
          style={{ minHeight: 750, height: '100%' }}>
          {<BackgroundContent
            $isDesk={marked.desk}
            value={value}
            onColorChange={(color)=> {
              setValue({ ...value, uiColorSchema: {
                ...value.uiColorSchema,
                backgroundColor: color
              } })
            }}
            onImageChange={(url, file)=> {
              setValue({ ...value,
                backgroundImage: url,
                backgroundImageFile: file
              })
            }}
          />}
          <UI.LayoutView $type={screen}
            style={{ backgroundImage: 'url("'+ value.backgroundImage+'")',
              backgroundColor: value.uiColorSchema.backgroundColor }}>
            <div>
              <UI.LayoutViewContent
                $isbg={value?.backgroundImage !== undefined ? true : false}
                style={display.get('logo') || display.get('wifi4eu') ? {}: { paddingTop: '15' }}
              >
                {display.get('wifi4eu') && <UI.Img src={Wifi4eu} alt={'Wifi4eu'} height={120}/> }
                {display.get('logo') && <LogoContent
                  value={value}
                  onDisabled={()=> {
                    setDisplay(new Map(display).set('logo', false))
                    setValue({ ...value, logoImage: undefined })
                  }}
                  onLogoChange={(url, file)=>
                    setValue({ ...value, logoImage: url, logoFile: file })}
                  onRatioChange={(v)=> setValue({ ...value,
                    uiStyleSchema: { ...value.uiStyleSchema, logoRatio: v } })}
                />}
                <div style={{ marginTop: 10 }}>
                  <TitleContent value={value}
                    onColorChange={(v)=> setValue({ ...value,
                      uiColorSchema: { ...value.uiColorSchema, fontHeaderColor: v } })}
                    onSizeChange={(v)=> setValue({ ...value,
                      uiStyleSchema: { ...value.uiStyleSchema, titleFontSize: v } })}
                  />
                </div>
                <div style={{ marginTop: 10 }}>
                  <BodyContent value={value}
                    onColorChange={(v)=> setValue({ ...value,
                      uiColorSchema: { ...value.uiColorSchema, fontColor: v } })}
                  />
                </div>
                <div style={{ marginTop: 10 }}>
                  <ButtonContent value={value}
                    onButtonColorChange={(v)=> setValue({ ...value,
                      uiColorSchema: { ...value.uiColorSchema, buttonColor: v } })}
                    onFontColorChange={(v)=> setValue({ ...value,
                      uiColorSchema: { ...value.uiColorSchema, buttonFontColor: v } })}
                  />
                </div>
                {display.get('poweredBy') &&
                <div style={{ marginTop: 10 }}><PoweredByContent/></div>}
              </UI.LayoutViewContent>
            </div>
          </UI.LayoutView>
        </UI.LayoutContent>
      </div>
    </Loader>
  )
})

export default PortalDesign
