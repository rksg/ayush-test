
import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { defaultComDisplay, PortalComponentsEnum } from '@acx-ui/rc/utils'

import * as UI from '../styledComponents'
export default function PortalComponents (props:{
  isShow: boolean,
  isReset: boolean,
  onClose: () => void,
  updateComponentDisplay: (value: { [key: string]: boolean; }) => void
}) {
  const { $t } = useIntl()
  const { isShow, onClose, updateComponentDisplay, isReset } = props
  const [ componentStatus, setComponentStatus]=
  useState({ ...defaultComDisplay } as { [key:string]: boolean })
  useEffect(() => {
    if(isReset){
      setComponentStatus({ ...defaultComDisplay })
    }
  },[isReset])
  return (
    <UI.CommonContainer $isShow={isShow}
      onMouseLeave={onClose}>
      <UI.CommonLabel>{$t({ defaultMessage: 'Manage Components' })}</UI.CommonLabel>

      {Object.keys(PortalComponentsEnum).map((key => <UI.CommonLabel key={key+'label'}>
        <UI.ComponentLabel key={key}>
          {PortalComponentsEnum[key as keyof typeof PortalComponentsEnum]}
        </UI.ComponentLabel>
        <UI.Switch checkedChildren={$t({ defaultMessage: 'ON' })}
          key={key+'switch'}
          checked={isReset ? defaultComDisplay[key as keyof typeof PortalComponentsEnum]
            : componentStatus[key]}
          onClick={(value)=>{
            componentStatus[key] = value
            setComponentStatus({ ...componentStatus })
            updateComponentDisplay({ ...componentStatus })
          }}
          unCheckedChildren={$t({ defaultMessage: 'OFF' })}/>
      </UI.CommonLabel>
      ))}
    </UI.CommonContainer>
  )
}
