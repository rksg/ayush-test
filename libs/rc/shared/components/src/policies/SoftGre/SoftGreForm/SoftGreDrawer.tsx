
import {  Col, Form, Row }   from 'antd'
import { DefaultOptionType } from 'antd/lib/select'
import { useIntl }           from 'react-intl'

import { Drawer }                                             from '@acx-ui/components'
import { useCreateSoftGreMutation, useUpdateSoftGreMutation } from '@acx-ui/rc/services'
import { useParams }                                          from '@acx-ui/react-router-dom'

import { SoftGreSettingForm } from './SoftGreSettingForm'


interface SoftGreDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  editMode: boolean
  readMode: boolean
  policyId?:string
  policyName?: string
  callbackFn?: (option: DefaultOptionType) => void
}

export default function SoftGreDrawer (props: SoftGreDrawerProps) {
  const { visible, setVisible, readMode, editMode, policyId, policyName, callbackFn } = props // handleSave
  const { $t } = useIntl()
  const params = useParams()
  const [form] = Form.useForm()
  const [ updateSoftGre ] = useUpdateSoftGreMutation()
  const [ createSoftGre ] = useCreateSoftGreMutation()

  const handleAdd = async () => {
    try {
      await form.validateFields()
      const values = form.getFieldsValue()
      if (editMode) {
        await updateSoftGre({ params, payload: values }).unwrap()
      } else {
        const resData = await createSoftGre({ params, payload: values }).unwrap()
        if (resData.response?.id) {
          const newOption = {
            value: resData.response?.id, label: values.name
          } as { value: string, label: string }
          callbackFn && callbackFn(newOption)
        }
      }
      setVisible(false)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleClose = () => {
    setVisible(false)
    form.resetFields()
  }

  return (
    <Drawer
      title={readMode
        ? $t({ defaultMessage: 'Profile Details: {name}' }, { name: policyName })
        : $t({ defaultMessage: 'Add SoftGRE' })
      }
      visible={visible}
      width={450}
      children={<Form layout='vertical' form={form} >
        <Row gutter={20}>
          <Col span={24}>
            <SoftGreSettingForm
              editMode={editMode}
              readMode={readMode}
              policyId={policyId}
            />
          </Col>
        </Row>
      </Form>}
      onClose={handleClose}
      destroyOnClose={true}
      footer={!readMode &&
        <Drawer.FormFooter
          buttonLabel={{
            save: $t({ defaultMessage: 'Add' })
          }}
          onCancel={handleClose}
          onSave={handleAdd}
        />
      }
    />
  )
}