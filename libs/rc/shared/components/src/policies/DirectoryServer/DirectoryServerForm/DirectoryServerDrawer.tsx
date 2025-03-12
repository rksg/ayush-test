
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
  readMode?: boolean
  policyId?:string
  policyName?: string
  callbackFn?: (option: DefaultOptionType) => void
}

export default function DirectoryServerDrawer (props: DirectoryServerDrawerProps) {
  const { visible, setVisible, readMode=false, policyId, policyName, callbackFn } = props
  const { $t } = useIntl()
  const params = useParams()
  const [form] = Form.useForm()
  const [ createDirectoryServer ] = useCreateDirectoryServerMutation()

  const handleAdd = async () => {
    try {
      if (!readMode) {
        await form.validateFields()
        const values = form.getFieldsValue()
        const resData = await createDirectoryServer({ params, payload: values }).unwrap()
        if (resData.response?.id) {
          const newOption = {
            value: resData.response?.id,
            label: `${values.name} (${values.type})`
          } as { value: string, label: string }
          callbackFn && callbackFn(newOption)
        }
        form.resetFields()
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
        ? $t({ defaultMessage: 'Directory Server Details: {name}' }, { name: policyName })
        : $t({ defaultMessage: 'Add Directory Server' })
      }
      visible={visible}
      width={450}
      children={visible &&
      <Form<DirectoryServer>
        {...(readMode ? { labelAlign: 'left' } : {})}
        layout='vertical'
        form={form} >
        <Row gutter={20}>
          <Col span={24}>
            <DirectoryServerSettingForm
              readMode={readMode}
              policyId={policyId}
            />
          </Col>
        </Row>
      </Form>}
      onClose={handleClose}
      destroyOnClose={true}
      footer={
        !readMode && <Drawer.FormFooter
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
