
import {  Col, Form, Row }   from 'antd'
import { DefaultOptionType } from 'antd/lib/select'
import { useIntl }           from 'react-intl'

import { Drawer }                           from '@acx-ui/components'
import { useCreateDirectoryServerMutation } from '@acx-ui/rc/services'
import { DirectoryServer }                  from '@acx-ui/rc/utils'
import { useParams }                        from '@acx-ui/react-router-dom'

import { DirectoryServerSettingForm } from './DirectoryServerSettingForm'


interface DirectoryServerDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  editMode: boolean
  policyId?:string
  callbackFn?: (option: DefaultOptionType, gatewayIps:string[]) => void
}

export default function DirectoryServerDrawer (props: DirectoryServerDrawerProps) {
  const { visible, setVisible, editMode, policyId, callbackFn } = props // handleSave
  const { $t } = useIntl()
  const params = useParams()
  const [form] = Form.useForm()
  const [ createDirectoryServer ] = useCreateDirectoryServerMutation()

  const handleAdd = async () => {
    try {
      if (!editMode) {
        await form.validateFields()
        const values = form.getFieldsValue()
        const resData = await createDirectoryServer({ params, payload: values }).unwrap()
        if (resData.response?.id) {
          const newOption = {
            value: resData.response?.id, label: values.name
          } as { value: string, label: string }
          // eslint-disable-next-line max-len
          callbackFn && callbackFn(newOption, [values.primaryGatewayAddress, values.secondaryGatewayAddress ?? ''])
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
      title={$t({ defaultMessage: 'Add DirectoryServer' })}
      visible={visible}
      width={450}
      children={visible && <Form<DirectoryServer> layout='vertical' form={form} >
        <Row gutter={20}>
          <Col span={24}>
            <DirectoryServerSettingForm
              editMode={editMode}
              policyId={policyId}
            />
          </Col>
        </Row>
      </Form>}
      onClose={handleClose}
      destroyOnClose={true}
      footer={
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
