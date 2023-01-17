/* eslint-disable max-len */
import { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { Space, Switch, Form, Select } from 'antd'

import { Button, Descriptions }    from '@acx-ui/components'
import { CodeMirrorWidget } from '@acx-ui/rc/components'
import { ConfigurationBackup } from '@acx-ui/rc/utils'

import * as UI         from './styledComponents'

export function CompareConfigurationModal (props:{
  configList: ConfigurationBackup[]
  compareData: {left:ConfigurationBackup, right:ConfigurationBackup},
  visible: boolean,
  handleCancel: () => void
}) {
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const { compareData, configList, visible, handleCancel } = props
  const [leftData, setLeftData] = useState('')
  const [rightData, setRightData] = useState('')
  
  useEffect(() => {
    if(compareData) {
      setLeftData(compareData.left.config)
      setRightData(compareData.right.config)
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
    let leftConfig: ConfigurationBackup
    let rightConfig
    configList.every(item => {
      if (item.id === data.leftConfig) {
        leftConfig = item;
        setLeftData(leftConfig?.config)
        findFlag++;
      }
      if (item.id === data.rightConfig) {
        rightConfig = item
        setRightData(rightConfig?.config)
        findFlag++;
      }
      return findFlag < 2 ? true : false;
    })
  }

  return <>
    <UI.CompareModal
      title={$t({ defaultMessage: 'Compare Configurations' })}
      visible={visible}
      onCancel={handleCancel}
      width={1150}
      footer={<Button key='back' type='secondary' onClick={handleCancel}>
        {$t({ defaultMessage: 'Close' })}
      </Button>
      }
    >
     
     <Form layout='vertical' wrapperCol={{ span: 14 }} form={form}>
          <div style={{display: 'flex', position: 'relative'}}>
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
                  children={compareData.left.createdDate} />
                <Descriptions.Item
                  label={$t({ defaultMessage: 'Type' })}
                  children={compareData.left.backupType} />
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
                children={compareData.right.createdDate} />
              <Descriptions.Item
                label={$t({ defaultMessage: 'Type' })}
                children={compareData.right.backupType} />
            </Descriptions>
          </div>
           
            <Space className="merge-scroll-lock">
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
              <CodeMirrorWidget type='merge' data={{left:leftData, right: rightData}} />
            </div>
          }
         </Form>
    </UI.CompareModal>
  </>
}