import { useEffect } from 'react'

import { Form  }   from 'antd'
import { useIntl } from 'react-intl'

import { StepsForm } from '@acx-ui/components'
import {
  EthernetPortAuthType,
  EthernetPortProfileViewData,
  EthernetPortType,
  checkVlanMember,
  getEthernetPortTypeString,
  validateVlanId
} from '@acx-ui/rc/utils'

import EthernetPortProfileOverwriteItem from './EthernetPortProfileOverwriteItem'

interface EthernetPortProfileInputProps {
    currentEthernetPortData?: EthernetPortProfileViewData,
    currentIndex: number,
    isEditable?: boolean
}

const EthernetPortProfileInput = (props:EthernetPortProfileInputProps) => {
  const { $t } = useIntl()
  const { currentIndex, currentEthernetPortData, isEditable=true } = props
  const form = Form.useFormInstance()
  const currentUntagId = Form.useWatch( ['lan', currentIndex, 'untagId'] ,form)

  useEffect(()=>{
    if (currentEthernetPortData?.type === EthernetPortType.ACCESS) {
      form.setFieldValue(['lan', currentIndex, 'vlanMembers'], currentUntagId)
    }
  }, [currentUntagId])

  // useEffect(()=> {
  //   if (currentPortOverwirte && currentEthernetPortData) {
  //     form.setFieldValue(['lan', currentIndex, 'untagId'],
  //       currentPortOverwirte.overwriteUntagId ?? currentEthernetPortData?.untagId)
  //     form.setFieldValue(['lan', currentIndex, 'vlanMembers'],
  //       currentPortOverwirte.overwriteVlanMembers ?? currentEthernetPortData?.vlanMembers)
  //   }
  // }, [currentEthernetPortData, currentPortOverwirte])

  return (<>
    <StepsForm.FieldLabel width={'200px'}>
      {$t({ defaultMessage: 'Port Type' })}
      <label>
        {getEthernetPortTypeString(currentEthernetPortData?.type)}
      </label>
    </StepsForm.FieldLabel>

    <EthernetPortProfileOverwriteItem
      title='VLAN Untag ID'
      defaultValue={
        (currentEthernetPortData?.apPortOverwrites &&
          currentEthernetPortData?.apPortOverwrites
          .find(p => p.portId === currentIndex)?.overwriteUntagId?.toString()) ??
        (currentEthernetPortData?.untagId.toString() ?? '')}
      isEditable={isEditable}
      fieldName={['lan', currentIndex, 'untagId']}
      rules={[
        { validator: (_, value) => validateVlanId(value) }
      ]}
    />
    <EthernetPortProfileOverwriteItem
      title='VLAN Members'
      defaultValue={
        (currentEthernetPortData?.apPortOverwrites &&
          currentEthernetPortData?.apPortOverwrites
          .find(p => p.portId === currentIndex)?.overwriteVlanMembers) ??
        (currentEthernetPortData?.vlanMembers.toString() ?? '')}
      isEditable={isEditable &&
        (currentEthernetPortData?.type === EthernetPortType.SELECTIVE_TRUNK)}
      fieldName={['lan', currentIndex, 'vlanMembers']}
      rules={[
        { validator: (_, value) => checkVlanMember(value) }
      ]}
    />
    <StepsForm.FieldLabel width={'200px'}>
      {$t({ defaultMessage: '802.1X' })}
      <Form.Item
        children={
          (currentEthernetPortData?.authType === EthernetPortAuthType.DISABLED)?
            'Off': 'On'
        }
      />
    </StepsForm.FieldLabel>
  </>
  )
}

export default EthernetPortProfileInput