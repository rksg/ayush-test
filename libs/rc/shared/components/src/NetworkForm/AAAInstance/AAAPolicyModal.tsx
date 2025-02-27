import { useState } from 'react'

import { useIntl } from 'react-intl'

import { Button, Drawer }                                                                                 from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                         from '@acx-ui/feature-toggle'
import { AAAPolicyType, AAA_LIMIT_NUMBER, PolicyOperation, PolicyType, useTemplateAwarePolicyPermission } from '@acx-ui/rc/utils'

import { AAAForm } from '../../policies/AAAForm'


export default function AAAPolicyModal (props:{
  type?: string,
  updateInstance: (value:AAAPolicyType) => void,
  aaaCount: number,
  disabled?: boolean,
  forceDisableRadsec?: boolean
}) {
  const { updateInstance, aaaCount, type, forceDisableRadsec } = props
  const { $t } = useIntl()
  const hasPermission = useTemplateAwarePolicyPermission(PolicyType.AAA, PolicyOperation.CREATE)
  const radiusMaxiumnNumber = useIsSplitOn(Features.WIFI_INCREASE_RADIUS_INSTANCE_1024)
    ? 1024
    : AAA_LIMIT_NUMBER
  const onClose = () => {
    setVisible(false)
  }
  const [ visible, setVisible ] = useState(false)
  const getContent = <AAAForm networkView={true}
    edit={false}
    type={type}
    forceDisableRadsec={forceDisableRadsec}
    backToNetwork={(data)=>{
      onClose()
      if(data)updateInstance(data)
    }}/>

  if (!hasPermission) return null

  return (
    <>
      <Button type='link'
        onClick={()=>setVisible(true)}
        disabled={aaaCount>=radiusMaxiumnNumber || props.disabled}>
        {$t({ defaultMessage: 'Add Server' })}
      </Button>
      <Drawer
        title={$t({ defaultMessage: 'Add AAA Server' })}
        adjustStepsFormFooterStyle={true}
        visible={visible}
        mask={true}
        children={getContent}
        destroyOnClose={true}
        onClose={onClose}
        width={500}
      />
    </>
  )
}
