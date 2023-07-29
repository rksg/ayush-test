/* eslint-disable max-len */
import { useEffect, useState } from 'react'

import { Space, Switch, Form, Select } from 'antd'
import { useIntl }                     from 'react-intl'

import { Button, Descriptions } from '@acx-ui/components'
import { CodeMirrorWidget }     from '@acx-ui/rc/components'
import { ConfigurationBackup }  from '@acx-ui/rc/utils'

import * as UI from './styledComponents'

export function CompareConfigurationModal (props:{
  configList: ConfigurationBackup[]
  compareData: { left:ConfigurationBackup, right:ConfigurationBackup },
  visible: boolean,
  handleCancel: () => void
}) {
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const { compareData, configList, visible, handleCancel } = props
  const [leftData, setLeftData] = useState(null as unknown as ConfigurationBackup)
  const [rightData, setRightData] = useState(null as unknown as ConfigurationBackup)

  useEffect(() => {
    if(compareData) {
      setLeftData(compareData.left)
      setRightData(compareData.right)
      form.setFieldsValue({
        leftConfig: compareData.left.id,
        rightConfig: compareData.right.id
      })
    }
  }, [compareData])

  const onScrollSyncClick = () => {
    const t = document.getElementsByClassName('CodeMirror-merge-scrolllock')[0] as HTMLElement
    t.click()
  }

  const onConfigChange = () => {
    const data = form.getFieldsValue()
    let findFlag = 0
    configList.every(item => {
      if (item.id === data.leftConfig) {
        setLeftData(item)
        findFlag++
      }
      if (item.id === data.rightConfig) {
        setRightData(item)
        findFlag++
      }
      return findFlag < 2 ? true : false
    })
  }

  return <UI.CompareModal
    title={$t({ defaultMessage: 'Compare Configurations' })}
    visible={visible}
    onCancel={handleCancel}
    width={1150}
    footer={<Button key='back' type='primary' onClick={handleCancel}>
      {$t({ defaultMessage: 'Close' })}
    </Button>
    }
  >

    <Form layout='vertical' wrapperCol={{ span: 14 }} form={form}>
      <div style={{ display: 'flex', position: 'relative' }}>
        <div>
          <Form.Item
            name='leftConfig'
            label={$t({ defaultMessage: 'Configuration Name' })}
            children={<Select
              options={configList?.map(i => ({ label: i.name, value: i.id }))}
              onChange={onConfigChange}
            />}
          />
          <Descriptions labelWidthPercent={25}>
            <Descriptions.Item
              label={$t({ defaultMessage: 'Created' })}
              children={leftData?.createdDate} />
            <Descriptions.Item
              label={$t({ defaultMessage: 'Type' })}
              children={leftData?.backupType} />
          </Descriptions>
        </div>

        <div>
          <Form.Item
            name='rightConfig'
            label={$t({ defaultMessage: 'Configuration Name' })}
            children={<Select
              options={configList?.map(i => ({ label: i.name, value: i.id }))}
              onChange={onConfigChange}
            />}
          />
          <Descriptions labelWidthPercent={25}>
            <Descriptions.Item
              label={$t({ defaultMessage: 'Created' })}
              children={rightData?.createdDate} />
            <Descriptions.Item
              label={$t({ defaultMessage: 'Type' })}
              children={rightData?.backupType} />
          </Descriptions>
        </div>

        <Space className='merge-scroll-lock'>
          <label>Synchronised scrolling</label>
          <Switch
            defaultChecked={true}
            onChange={onScrollSyncClick}
          />
        </Space>
      </div>
      {
        leftData && rightData &&
            <div className='code-mirror-container'>
              <CodeMirrorWidget type='merge' data={{ left: leftData.config, right: rightData.config }} />
            </div>
      }
    </Form>
  </UI.CompareModal>
}
