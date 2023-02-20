import { Form, Switch } from 'antd'
import { useIntl }      from 'react-intl'

import { Demo, PortalComponentsEnum } from '@acx-ui/rc/utils'


import { portalComponentsValue } from '../contentsMap'
import * as UI                   from '../styledComponents'

import PortalTermsModal   from './PortalTermsModal'
import PortalWifi4euModal from './PortalWifi4euModal'
export default function PortalComponents (props:{
  demoValue:Demo,
  updateViewContent:(value:Demo)=>void,
}) {
  const valueKeys = Object.keys(PortalComponentsEnum) as Array<keyof typeof PortalComponentsEnum>
  const { $t } = useIntl()
  const { updateViewContent, demoValue } = props
  return (
    <Form layout='vertical'>
      <Form.Item
        name='manageComponents'
        label={$t({ defaultMessage: 'Manage Components' })}
        children={<div>
          {valueKeys.map((key => <UI.CommonLabel key={key+'label'}>
            <UI.ComponentLabel key={key}>
              {$t(portalComponentsValue[PortalComponentsEnum[key]])}
            </UI.ComponentLabel>
            <Switch
              key={key+'switch'}
              checked={demoValue?.componentDisplay?.[PortalComponentsEnum[key]]}
              onClick={(value)=>{
                updateViewContent({ ...demoValue, componentDisplay:
                  { ...demoValue.componentDisplay, [PortalComponentsEnum[key]]: value } })
              }}
            />
            {PortalComponentsEnum[key] === PortalComponentsEnum.TermsConditions&&<PortalTermsModal
              terms={demoValue?.termsCondition}
              updateTermsConditions={(value)=>
                updateViewContent({ ...demoValue, termsCondition: value })}/>}
            {PortalComponentsEnum[key] === PortalComponentsEnum.Wifi4eu&&<PortalWifi4euModal
              wifi4eu={demoValue?.wifi4EUNetworkId}
              updateWiFi4EU={(value)=> updateViewContent({
                ...demoValue, wifi4EUNetworkId: value })}/>}
          </UI.CommonLabel>
          ))}
        </div>}
      />
    </Form>
  )
}
