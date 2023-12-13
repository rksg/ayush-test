import {
  useContext,
  useEffect,
  useState
} from 'react'

import { Form }      from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Button, Modal, Transfer }           from '@acx-ui/components'
import { useGetWifiCallingServiceListQuery } from '@acx-ui/rc/services'

import { WifiCallingSettingContext } from './NetworkControlTab'


export function WifiCallingSettingModal () {
  const form = Form.useFormInstance()
  const { $t } = useIntl()
  const params = useParams()
  const { wifiCallingSettingList, setWifiCallingSettingList }= useContext(WifiCallingSettingContext)
  const { data } = useGetWifiCallingServiceListQuery({
    params: params
  })

  const [visible, setVisible] = useState(false)
  const [targetKeys, setTargetKeys] = useState<string[]>(
    wifiCallingSettingList.length > 0
      ? wifiCallingSettingList.map(item => item.id)
      : [])
  const [selectedKeys, setSelectedKeys] = useState([] as string[])

  const onChange = (nextTargetKeys: string[]) => {
    setTargetKeys(nextTargetKeys)
  }

  const onSelectChange = (sourceSelectedKeys: string[], targetSelectedKeys: string[]) => {
    setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys])
  }

  const transferComponent = <Transfer
    showSearch
    showSelectAll={false}
    listStyle={{
      width: '100%',
      height: 300
    }}
    operations={[$t({ defaultMessage: 'Add' }), $t({ defaultMessage: 'Remove' })]}
    dataSource={data?.map(data => {
      return { ...data, key: data.id }
    }) || []}
    render={item => item.serviceName}
    onChange={onChange}
    onSelectChange={onSelectChange}
    targetKeys={targetKeys}
    selectedKeys={selectedKeys}
    titles={[
      $t({ defaultMessage: 'Available Profiles' }),
      $t({ defaultMessage: 'Selected Profiles' })
    ]}
  />

  const showModal = () => {
    setVisible(true)
  }

  const handleOk = async () => {
    data && setWifiCallingSettingList(data.filter(data => targetKeys.indexOf(data.id) !== -1))
    setVisible(false)
    form.setFieldValue(
      ['wlan', 'advancedCustomization', 'wifiCallingIds'],
      targetKeys
    )
    try {
      await form.validateFields()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleCancel = () => {
    setVisible(false)
    setTargetKeys(wifiCallingSettingList.map(item => item.id))
  }

  useEffect(() => {
    const networkIds = form.getFieldValue(['wlan', 'advancedCustomization', 'wifiCallingIds'])
    if (!wifiCallingSettingList.length && data && networkIds) {
      setWifiCallingSettingList(data.filter(item => networkIds.indexOf(item.id) !== -1))
      setTargetKeys(networkIds)
    }
  }, [data, wifiCallingSettingList.length])

  return (
    <>
      <Button type='link'
        onClick={showModal}
        style={{ height: '34px', marginInlineStart: '15px' }}
      >
        {$t({ defaultMessage: 'Select profiles' })}
      </Button>
      <Modal
        title={$t({ defaultMessage: 'Select Wi-Fi Calling Profiles' })}
        visible={visible}
        okText={$t({ defaultMessage: 'Save' })}
        onCancel={handleCancel}
        onOk={handleOk}
        width={850}
      >
        {transferComponent}
      </Modal>
    </>
  )
}
