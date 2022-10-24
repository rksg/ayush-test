import { useIntl } from 'react-intl'

import { Demo, PortalComponentsEnum } from '@acx-ui/rc/utils'


import * as UI from '../styledComponents'

import PortalTermsModal   from './PortalTermsModal'
import PortalWifi4euModal from './PortalWifi4euModal'
export default function PortalComponents (props:{
  onClose: () => void,
  demoValue:Demo,
  updateViewContent:(value:Demo)=>void,
}) {

  const { $t } = useIntl()
  const { onClose, updateViewContent, demoValue } = props
  return (
    <div
      onMouseLeave={onClose}>
      <UI.CommonLabel>{$t({ defaultMessage: 'Manage Components' })}</UI.CommonLabel>

      {Object.keys(PortalComponentsEnum).map((key => <UI.CommonLabel key={key+'label'}>
        <UI.ComponentLabel key={key}>
          {PortalComponentsEnum[key as keyof typeof PortalComponentsEnum]}
        </UI.ComponentLabel>
        <UI.Switch checkedChildren={$t({ defaultMessage: 'ON' })}
          key={key+'switch'}
          checked={demoValue?.componentDisplay?.[key]}
          onClick={(value)=>{
            demoValue.componentDisplay[key] = value
            updateViewContent({ ...demoValue })
          }}
          unCheckedChildren={$t({ defaultMessage: 'OFF' })}/>
        {key === 'TermsConditions'&&<PortalTermsModal
          terms={demoValue?.termsCondition}
          updateTermsConditions={(value)=>
            updateViewContent({ ...demoValue, termsCondition: value })}/>}
        {key === 'WiFi4EU'&&<PortalWifi4euModal wifi4eu={demoValue?.wifi4EU}
          updateWiFi4EU={(value)=> updateViewContent({ ...demoValue, wifi4EU: value })}/>}
      </UI.CommonLabel>
      ))}
    </div>
  )
}
