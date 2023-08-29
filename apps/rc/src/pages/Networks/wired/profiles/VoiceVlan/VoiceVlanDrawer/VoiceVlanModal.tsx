import { Form, Input } from 'antd'
import moment          from 'moment-timezone'

import { Modal }                      from '@acx-ui/components'
import { useAddConfigBackupMutation } from '@acx-ui/rc/services'
import { excludeQuoteRegExp, VoiceVlanPort }         from '@acx-ui/rc/utils'
import { useParams }                  from '@acx-ui/react-router-dom'
import { getIntl }                    from '@acx-ui/utils'

export function VoiceVlanModal (props:{
  visible: boolean,
  handleCancel: () => void
  editPorts: VoiceVlanPort[]
  tableData: VoiceVlanPort[]
  setTableData: React.Dispatch<React.SetStateAction<VoiceVlanPort[]>>
}) {
  const { $t } = getIntl()
  const { visible, handleCancel, tableData, setTableData, editPorts } = props
  const [form] = Form.useForm()

  const onOk = () => {
    form.submit()
  }

  const onFinish = async (value: { voiceVlan:string }) => {
    const currentPort = editPorts[0]?.taggedPort
    const currentTableCopy = [...tableData]
    currentTableCopy.forEach(item => {
      if(item.taggedPort == currentPort){
        item.voiceVlan = value.voiceVlan
      }
    })
    setTableData(currentTableCopy)
    handleCancel()
  }

  return <Modal
    title={$t({ defaultMessage: 'Set Voice VLAN' })}
    visible={visible}
    okText={$t({ defaultMessage: 'Set' })}
    onOk={onOk}
    onCancel={handleCancel}
  >
    <Form
      form={form}
      onFinish={onFinish}
      layout='vertical'
      validateTrigger='onBlur'
    >
      <Form.Item
        label={$t({ defaultMessage: 'Voice VLAN' })}
        name='voiceVlan'
        initialValue={''}
        validateFirst
        children={<Input />}
      />
    </Form>
  </Modal>
}