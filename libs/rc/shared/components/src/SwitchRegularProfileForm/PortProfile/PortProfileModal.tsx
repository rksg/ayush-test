import { useContext, useEffect, useState } from 'react'

import { Form, Typography } from 'antd'
import { useIntl }          from 'react-intl'

import { Modal, ModalType, StepsForm } from '@acx-ui/components'
import { PortProfileUI }               from '@acx-ui/rc/utils'


import PortProfileContext  from './PortProfileContext'
import { PortProfileStep } from './PortProfileStep'
import { SelectModelStep } from './SelectModelStep'

export function PortProfileModal (props: {
  visible: boolean,
  onSave:(values: PortProfileUI)=>void,
  onCancel?: ()=>void
}) {
  const { $t } = useIntl()
  const { visible, onSave, onCancel } = props
  const [form] = Form.useForm()
  const [noModelMsg, setNoModelMsg] = useState(false)
  const { setPortProfileSettingValues, editMode } = useContext(PortProfileContext)

  useEffect(()=>{
    form.resetFields()
  }, [form, visible])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSaveModel = async (data: PortProfileUI) => {
    if(data.models && data.models.length > 0){
      if(!editMode){
        setPortProfileSettingValues({ ...data })
      }
      setNoModelMsg(false)
      return true
    }
    setNoModelMsg(true)
    return false
  }

  const onFinish = async (data: PortProfileUI) => {
    onSave(data)
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
      data-testid='PortProfileModal'
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