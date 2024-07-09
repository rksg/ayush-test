import {
  useContext,
  useEffect,
  useState
} from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Button, Modal, Transfer }                    from '@acx-ui/components'
import { Features, useIsSplitOn }                     from '@acx-ui/feature-toggle'
import {
  useGetEnhancedWifiCallingServiceListQuery,
  useGetEnhancedWifiCallingServiceTemplateListQuery
} from '@acx-ui/rc/services'
import { useConfigTemplateQueryFnSwitcher } from '@acx-ui/rc/utils'

import { WifiCallingSettingContext } from './NetworkControlTab'

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
  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const { wifiCallingSettingList, setWifiCallingSettingList }= useContext(WifiCallingSettingContext)
  const { data } = useConfigTemplateQueryFnSwitcher({
    useQueryFn: useGetEnhancedWifiCallingServiceListQuery,
    useTemplateQueryFn: useGetEnhancedWifiCallingServiceTemplateListQuery,
    payload: defaultPayload,
    enableRbac
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
    dataSource={data?.data.map(data => {
      return { ...data, key: data.id }
    }) || []}
    render={item => item.name}
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
    data && setWifiCallingSettingList(data.data.filter(data => targetKeys.indexOf(data.id) !== -1))
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
      setWifiCallingSettingList(data.data.filter(item => networkIds.indexOf(item.id) !== -1))
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
        width={500}
      >
        {transferComponent}
      </Modal>
    </>
  )
}
