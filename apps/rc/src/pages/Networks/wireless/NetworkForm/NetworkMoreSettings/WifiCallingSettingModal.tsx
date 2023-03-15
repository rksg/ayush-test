import React, {
  useContext,
  useEffect,
  useState
} from 'react'

import {
  Form, Transfer
} from 'antd'
import { useIntl } from 'react-intl'

import { Button, Modal }                     from '@acx-ui/components'
import { useGetWifiCallingServiceListQuery } from '@acx-ui/rc/services'
import { useTableQuery }                     from '@acx-ui/rc/utils'

import { WifiCallingSettingContext } from './ServicesForm'

const defaultPayload = {
  searchString: '',
  fields: [
    'id',
    'name',
    'qosPriority',
    'tenantId',
    'epdgs',
    'networkIds'
  ]
}

export function WifiCallingSettingModal () {
  const form = Form.useFormInstance()
  const { $t } = useIntl()
  const { wifiCallingSettingList, setWifiCallingSettingList }= useContext(WifiCallingSettingContext)
  const tableQuery = useTableQuery({
    useQuery: useGetWifiCallingServiceListQuery,
    defaultPayload
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
    listStyle={{
      width: '100%',
      height: '100%'
    }}
    operations={[$t({ defaultMessage: 'Add' }), $t({ defaultMessage: 'Remove' })]}
    dataSource={tableQuery.data?.data.map(data => {
      return { ...data, key: data.id }
    })}
    render={item => item.name ?? ''}
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
    tableQuery.data && setWifiCallingSettingList(
      tableQuery.data.data.filter(data => targetKeys.indexOf(data.id) !== -1)
    )
    setVisible(false)
    form.setFieldValue(
      ['wlan', 'advancedCustomization', 'wifiCallingIds'],
      targetKeys
    )
    await form.validateFields()
  }

  const handleCancel = () => {
    setVisible(false)
    setTargetKeys(wifiCallingSettingList.map(item => item.id))
  }

  useEffect(() => {
    const networkIds = form.getFieldValue(['wlan', 'advancedCustomization', 'wifiCallingIds'])
    if (!wifiCallingSettingList.length && tableQuery.data && networkIds) {
      setWifiCallingSettingList(
        tableQuery.data.data.filter(item => networkIds.indexOf(item.id) !== -1)
      )
      setTargetKeys(networkIds)
    }
  }, [tableQuery, wifiCallingSettingList.length])

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
