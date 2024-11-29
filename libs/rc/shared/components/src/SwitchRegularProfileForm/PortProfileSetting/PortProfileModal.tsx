import { useEffect, useState } from 'react'

import { Form, Typography } from 'antd'
import { useIntl }          from 'react-intl'

import { Modal, ModalType, StepsForm } from '@acx-ui/components'
import { SwitchModelPortData }         from '@acx-ui/rc/utils'

import { PortProfileStep } from './PortProfileStep'
import { SelectModelStep } from './SelectModelStep'

export function PortProfileModal (props: {
  visible: boolean,
  editMode: boolean,
  onSave:(values: SwitchModelPortData)=>void,
  onCancel?: ()=>void
}) {
  const { $t } = useIntl()
  const { visible, editMode, onSave, onCancel } = props
  const [form] = Form.useForm()
  const [noModelMsg, setNoModelMsg] = useState(false)

  useEffect(()=>{
    form.resetFields()
  }, [form, visible])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSaveModel = async (data: any) => {
    if(data.model && data.model.length > 0){
      setNoModelMsg(false)
      return true
    }
    setNoModelMsg(true)
    return false
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onFinish = async (data: any) => {
    const switchFamilyModelsData = {
      ...data.switchFamilyModels,
      title: '',
      vlanConfigName: ''
    }
    switchFamilyModelsData.model = data.family + '-' + data.model
    onSave(switchFamilyModelsData)
  }

  return (
    <Modal
      visible={visible}
      maskClosable={true}
      onOk={()=>form.submit()}
      onCancel={onCancel}
      destroyOnClose={true}
      closable={true}
      type={ModalType.ModalStepsForm}
      title={$t({ defaultMessage: 'Select Ports By Model' })}
      data-testid='PortProfileSettingModal'
    >
      <StepsForm
        editMode={editMode}
        onCancel={onCancel}
        onFinish={onFinish}
        style={{ paddingBlockEnd: 0 }}
      >
        <StepsForm.StepForm
          title={$t({ defaultMessage: 'Select Models' })}
          onFinish={onSaveModel}
        >
          <div>
            <label style={{ color: 'var(--acx-neutrals-60)' }}>
              {$t({ defaultMessage: 'Select family and model to be configured:' })}
            </label>
          </div>
          {noModelMsg &&
              <Typography.Text type='danger'>
                {$t({ defaultMessage: 'No model selected' })}
              </Typography.Text>
          }
          <SelectModelStep />
        </StepsForm.StepForm>
        <StepsForm.StepForm
          title={$t({ defaultMessage: 'Port Profile' })}
        >
          <PortProfileStep />
        </StepsForm.StepForm>
      </StepsForm>
    </Modal>
  )
}