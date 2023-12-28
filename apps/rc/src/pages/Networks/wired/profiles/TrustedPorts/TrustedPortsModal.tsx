import { useEffect, useState } from 'react'

import { Form, Typography } from 'antd'
import { useIntl }          from 'react-intl'

import { Modal, ModalType, StepsForm } from '@acx-ui/components'
import { TrustedPort }                 from '@acx-ui/rc/utils'

import { SelectModelStep }  from './SelectModelStep'
import { TrustedPortsStep } from './TrustedPortsStep'

import { VlanTrustPortInterface } from './index'

export function TrustedPortsModal (props: {
  open: boolean,
  onSave:(values: VlanTrustPortInterface)=>void,
  onCancel?: ()=>void,
  editRecord?: TrustedPort
  currrentRecords?: TrustedPort[]
}) {
  const { $t } = useIntl()
  const { open, editRecord, onSave, onCancel } = props
  const [form] = Form.useForm()
  const [noModelMsg, setNoModelMsg] = useState(false)
  const [vlanSettingValues, setVlanSettingValues] =
    useState<VlanTrustPortInterface>({ family: '', model: '', trustedPorts: [] })

  useEffect(()=>{
    if (form && open){
      form.resetFields()
    }
    if (form && open && editRecord) {
      form.setFieldsValue(editRecord)
      const family = editRecord.model.split('-')[0]
      const model = editRecord.model.split('-')[1]
      setVlanSettingValues({
        family,
        model,
        trustedPorts: [editRecord]
      })
    }
  }, [form, open, editRecord])

  return (
    <Modal
      visible={open}
      maskClosable={true}
      onOk={()=>form.submit()}
      onCancel={onCancel}
      destroyOnClose={true}
      closable={true}
      type={ModalType.ModalStepsForm}
      title={$t({ defaultMessage: 'Select Ports By Model' })}
      data-testid='trustedPortModal'
    >
      <StepsForm
        editMode={!!editRecord}
        onCancel={onCancel}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onFinish={async (data: any) => {
          if(data.trustedPorts.trustPorts){
            onSave(data)
            return true
          }
          return false
        }}
        form={form}
        buttonLabel={{ submit: editRecord ?
          $t({ defaultMessage: 'Save' }) : $t({ defaultMessage: 'Add' }) }}
      >
        <StepsForm.StepForm
          title={$t({ defaultMessage: 'Select Model' })}
          onFinish={async (data: VlanTrustPortInterface) => {
            if(data.family && data.model){
              setNoModelMsg(false)
              setVlanSettingValues(data)
              return true
            }
            setNoModelMsg(true)
            return false
          }}
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
          <SelectModelStep editRecord={editRecord}/>
        </StepsForm.StepForm>
        <StepsForm.StepForm
          title={$t({ defaultMessage: 'Trusted Ports' })}
        >
          <TrustedPortsStep vlanSettingValues={vlanSettingValues} editRecord={editRecord} />
        </StepsForm.StepForm>
      </StepsForm>
    </Modal>
  )
}
