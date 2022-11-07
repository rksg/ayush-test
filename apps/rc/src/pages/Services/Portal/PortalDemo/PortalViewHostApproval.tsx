import { useIntl } from 'react-intl'

import { Demo } from '@acx-ui/rc/utils'

import * as UI from '../styledComponents'

import PortalButtonContent from './PortalContent/PortalButtonContent'
export default function PortalViewHostApproval (props:{
  demoValue: Demo,
  isPreview?:boolean,
  updateBtn?: (value: { url?: string, size?: number, show?: boolean,
    color?:string, text?:string }) => void
}) {
  const { $t } = useIntl()
  const { demoValue, updateBtn, isPreview } = props
  return (
    <UI.ViewSectionNoBorder>
      <UI.ViewSectionTabsBig
        defaultActiveKey='register'
        type='card'
        size={'middle'}
      >
        <UI.ViewSectionTabsBig.TabPane tab={$t({ defaultMessage: 'Register' })} key='register'>
          <UI.FieldText style={{ marginLeft: 5 }}>
            {$t({ defaultMessage: 'Enter your details to receive your password' })}
          </UI.FieldText>
          <UI.ViewSectionSpan>*</UI.ViewSectionSpan><UI.ViewSectionUserOutlined/><UI.FieldInputSmall
            placeholder={$t({ defaultMessage: 'Your Name' })}></UI.FieldInputSmall><br/>
          <UI.ViewSectionSpan>*</UI.ViewSectionSpan>
          <UI.ViewSectionMobileOutlined/><UI.FieldInputSmall
            placeholder={$t({ defaultMessage: 'Mobile Phone Number' })}></UI.FieldInputSmall>
          <UI.ViewSectionText style={{ marginLeft: -56 }}>
            {$t({ defaultMessage: 'Your password will be sent to this number' })}
          </UI.ViewSectionText>
          <UI.ViewSectionSpan>*</UI.ViewSectionSpan><UI.ViewSectionMailOutlined/><UI.FieldInputSmall
            placeholder={$t({ defaultMessage: 'Your host\'s Email' })}></UI.FieldInputSmall>
          <UI.ViewSectionText style={{ marginLeft: -8 }}>
            {$t({ defaultMessage: 'Your host will be asked to approve your registration' })}
          </UI.ViewSectionText>
          <UI.ViewSectionEditOutlined/><UI.FieldInputSmall
            placeholder={$t({ defaultMessage: 'Optional: add a short note to your host' })}>
          </UI.FieldInputSmall>
          <UI.ViewSectionText style={{ marginLeft: -94 }}>{$t({
            defaultMessage: 'Maximum length is 200 characters'
          })}</UI.ViewSectionText>
          <PortalButtonContent
            demoValue={demoValue}
            isPreview={isPreview}
            updateButton={(data)=>updateBtn?.(data)}
          >{$t({ defaultMessage: 'Register' })}</PortalButtonContent>

        </UI.ViewSectionTabsBig.TabPane>
        <UI.ViewSectionTabsBig.TabPane tab={$t({ defaultMessage: 'Login' })} key='login'>
          <UI.FieldText>{$t({ defaultMessage: 'Enter your password to connect' })}</UI.FieldText>
          <UI.FieldInput></UI.FieldInput>
          <UI.ViewSectionLink>
            {$t({ defaultMessage: 'Forgot your password?' })}</UI.ViewSectionLink>
          <PortalButtonContent
            demoValue={demoValue}
            isPreview={isPreview}
            updateButton={(data)=>updateBtn?.(data)}
          >{$t({ defaultMessage: 'Connect To Wi-Fi' })}</PortalButtonContent>
        </UI.ViewSectionTabsBig.TabPane>
      </UI.ViewSectionTabsBig>
    </UI.ViewSectionNoBorder>

  )
}

