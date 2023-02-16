import { useEffect, useState } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Modal, ModalType, showToast, StepsForm } from '@acx-ui/components'
import { TrustedPort }                            from '@acx-ui/rc/utils'

import { VlanSettingInterface } from '../VlanSetting/VlanSettingDrawer/VlanPortsSetting/VlanPortsModal'

import { SelectModelStep }  from './SelectModelStep'
import { TrustedPortsStep } from './TrustedPortsStep'

export function TrustedPortsModal (props: {
  open: boolean,
  onSave:(values: VlanSettingInterface)=>void,
  onCancel?: ()=>void,
  editRecord?: TrustedPort
  currrentRecords?: TrustedPort[]
}) {
  const { $t } = useIntl()
  const { onSave } = props
  const [form] = Form.useForm()
  const [vlanSettingValues, setVlanSettingValues] =
    useState<VlanSettingInterface>({ family: '', model: '', trustedPorts: [] })

  useEffect(()=>{
    form.resetFields()
    if (props.open && props.editRecord) {
      form.setFieldsValue(props.editRecord)
    }
  }, [form, props.open, props.editRecord])

  return (
    <Modal
      visible={props.open}
      maskClosable={true}
      onOk={()=>form.submit()}
      onCancel={props.onCancel}
      destroyOnClose={true}
      type={ModalType.ModalStepsForm}
      title={$t({ defaultMessage: 'Select Ports By Model' })}
    >
      <StepsForm
        onCancel={() => {
          showToast({ type: 'info', content: 'Cancel' })
        }}
        onFinish={async (data) => {
          // const switchFamilyModelsData = data.switchFamilyModels
          onSave(data)
        }}
      >
        <StepsForm.StepForm
          title='Select Model'
          onFinish={async (data) => {
            setVlanSettingValues(data)
            return true
          }}
        >
          <SelectModelStep />
        </StepsForm.StepForm>
        <StepsForm.StepForm
          title='Trusted Ports'
        >
          <TrustedPortsStep vlanSettingValues={vlanSettingValues} />
        </StepsForm.StepForm>
      </StepsForm>
    </Modal>
  )
}