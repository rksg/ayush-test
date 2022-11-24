import { Demo } from '@acx-ui/rc/utils'

import * as UI from '../styledComponents'

import PortalButtonContent from './PortalContent/PortalButtonContent'
export default function PortalViewSelfSignRegister (props:{
  demoValue: Demo,
  isPreview?:boolean,
  updateBtn?: (value: { url?: string, size?: number, show?: boolean,
    color?:string, text?:string }) => void
}) {
  const { demoValue, updateBtn, isPreview } = props
  return (
    <UI.ViewSectionNoBorder>
      <UI.ViewSectionTabsBig
        defaultActiveKey='register'
        type='card'
        size={'middle'}
      >
        <UI.ViewSectionTabsBig.TabPane tab={'Register'} key='register'>
          <UI.FieldText style={{ marginLeft: 5 }}>
            {'Enter your details to receive your password'}
          </UI.FieldText>
          <UI.ViewSectionSpan>*</UI.ViewSectionSpan><UI.ViewSectionUserOutlined/><UI.FieldInputSmall
            placeholder={'Your Name'}></UI.FieldInputSmall><br/>
          <UI.ViewSectionSpan>*</UI.ViewSectionSpan>
          <UI.ViewSectionMobileOutlined/><UI.FieldInputSmall
            placeholder={'Mobile Phone Number'}></UI.FieldInputSmall>
          <UI.ViewSectionText style={{ marginLeft: -56 }}>
            {'Your password will be sent to this number'}
          </UI.ViewSectionText>
          <UI.ViewSectionMailOutlined/><UI.FieldInputSmall
            placeholder={'Your Email'}></UI.FieldInputSmall>
          <PortalButtonContent
            isPreview={isPreview}
            demoValue={demoValue}
            updateButton={(data)=>updateBtn?.(data)}
          >{'Register'}</PortalButtonContent>
          <UI.ViewSectionText style={{ marginLeft: 68, display: 'flex' }}>{
            'By registering, you are accepting the'
          }&nbsp;&nbsp;
          <UI.FieldTextLink>
            {'terms & conditions'}
          </UI.FieldTextLink></UI.ViewSectionText>
        </UI.ViewSectionTabsBig.TabPane>
        <UI.ViewSectionTabsBig.TabPane tab={'Login'} key='login'>
          <UI.FieldText>{'Enter your password to connect'}</UI.FieldText>
          <UI.FieldInput></UI.FieldInput>
          <UI.ViewSectionLink>
            {'Forgot your password?'}</UI.ViewSectionLink>
          <PortalButtonContent
            demoValue={demoValue}
            isPreview={isPreview}
            updateButton={(data)=>updateBtn?.(data)}
          >{'Connect To Wi-Fi'}</PortalButtonContent>
        </UI.ViewSectionTabsBig.TabPane>
      </UI.ViewSectionTabsBig>
      <UI.FieldTextLink>{'Back'}</UI.FieldTextLink>
    </UI.ViewSectionNoBorder>

  )
}

