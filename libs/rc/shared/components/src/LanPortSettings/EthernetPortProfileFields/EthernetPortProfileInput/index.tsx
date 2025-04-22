import { useEffect } from 'react'

import { Form, Space  } from 'antd'
import { useIntl }      from 'react-intl'

import { Alert, StepsForm }       from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  EthernetPortAuthType,
  EthernetPortProfileMessages,
  EthernetPortProfileViewData,
  EthernetPortType,
  checkVlanMember,
  getEthernetPortTypeString,
  transformDisplayOnOff,
  validateVlanId
} from '@acx-ui/rc/utils'

import EthernetPortProfileOverwriteItem from './EthernetPortProfileOverwriteItem'

interface EthernetPortProfileInputProps {
    currentEthernetPortData?: EthernetPortProfileViewData,
    currentIndex: number,
    isEditable?: boolean,
    onGUIChanged?: (fieldName: string) => void
}

const EthernetPortProfileInput = (props:EthernetPortProfileInputProps) => {
  const { $t } = useIntl()
  const { currentIndex, currentEthernetPortData, isEditable=true,
    onGUIChanged } = props

  const isWiredClientVisibilityEnabled = useIsSplitOn(Features.WIFI_WIRED_CLIENT_VISIBILITY_TOGGLE)

  const form = Form.useFormInstance()
  const currentUntagId = Form.useWatch( ['lan', currentIndex, 'untagId'] ,form)

  useEffect(()=>{
    if (currentEthernetPortData?.type === EthernetPortType.ACCESS) {
      form.setFieldValue(['lan', currentIndex, 'vlanMembers'], currentUntagId)
    }
  }, [currentUntagId])

  return (
    <Space direction='vertical'>
      {isWiredClientVisibilityEnabled &&
       (currentEthernetPortData?.authType === EthernetPortAuthType.OPEN ||
        currentEthernetPortData?.authType === EthernetPortAuthType.MAC_BASED ||
        currentEthernetPortData?.authType === EthernetPortAuthType.PORT_BASED) &&
        <Alert
          data-testid={'client-visibility-banner'}
          showIcon={true}
          style={{ verticalAlign: 'middle', width: '40vw' }}
          message={$t(EthernetPortProfileMessages.WARN_CLIENT_VISIBILITY)}
        />
      }
      <StepsForm.FieldLabel width={'200px'}>
        {$t({ defaultMessage: 'Port Type' })}
        <label>
          {getEthernetPortTypeString(currentEthernetPortData?.type)}
        </label>
      </StepsForm.FieldLabel>

      <EthernetPortProfileOverwriteItem
        title='VLAN Untag ID'
        defaultValue={currentEthernetPortData?.untagId.toString() ?? ''}
        initialData={
          (currentEthernetPortData?.apPortOverwrites
            ?.find(p => p.portId === currentIndex+1)?.overwriteUntagId?.toString()) ??
        (currentEthernetPortData?.untagId.toString() ?? '')}
        isEditable={isEditable}
        fieldName={['lan', currentIndex, 'untagId']}
        currentIndex={currentIndex}
        onGUIChanged={onGUIChanged}
        rules={[
          { validator: (_, value) => validateVlanId(value) }
        ]}
      />
      <EthernetPortProfileOverwriteItem
        title='VLAN Members'
        defaultValue={currentEthernetPortData?.vlanMembers.toString() ?? ''}
        initialData={
          (currentEthernetPortData?.apPortOverwrites
            ?.find(p => p.portId === currentIndex+1)?.overwriteVlanMembers) ??
        (currentEthernetPortData?.vlanMembers.toString() ?? '')}
        isEditable={isEditable &&
        (currentEthernetPortData?.type === EthernetPortType.SELECTIVE_TRUNK)}
        fieldName={['lan', currentIndex, 'vlanMembers']}
        currentIndex={currentIndex}
        onGUIChanged={onGUIChanged}
        rules={[
          { validator: (_, value) => checkVlanMember(value) }
        ]}
      />
      <StepsForm.FieldLabel width={'200px'}>
        {$t({ defaultMessage: '802.1X' })}
        <Form.Item
          children={
            transformDisplayOnOff(
              !(currentEthernetPortData?.authType === EthernetPortAuthType.DISABLED ||
             currentEthernetPortData?.authType === EthernetPortAuthType.OPEN))
          }
        />
      </StepsForm.FieldLabel>
    </Space>
  )
}

export default EthernetPortProfileInput