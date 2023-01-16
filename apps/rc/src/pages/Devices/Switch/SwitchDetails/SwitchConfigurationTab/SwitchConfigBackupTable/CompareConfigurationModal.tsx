/* eslint-disable max-len */
import { useEffect, useRef, useState } from 'react'

import { useIntl } from 'react-intl'

import { Button, Loader, Modal, Table, TableProps, Descriptions }    from '@acx-ui/components'
import { useGetSwitchConfigHistoryQuery }                            from '@acx-ui/rc/services'
import { ConfigurationBackup, ConfigurationHistory, DispatchFailedReason, useTableQuery } from '@acx-ui/rc/utils'

import * as UI         from './styledComponents'
import { CodeMirrorWidget } from '@acx-ui/rc/components'
import { Space, Switch } from 'antd'

export function CompareConfigurationModal (props:{
  configList: ConfigurationBackup[]
  compareData: {left:ConfigurationBackup, right:ConfigurationBackup},
  visible: boolean,
  handleCancel: () => void
}) {
  const { $t } = useIntl()
  const codeMirrorEl = useRef(null as unknown as { highlightLine: Function, removeHighlightLine: Function })
  const { compareData, visible, handleCancel } = props
  const [leftData, setLeftData] = useState('')
  const [rightData, setRightData] = useState('')

  useEffect(() => {
    if(compareData) {
      setLeftData(compareData.left.config)
      setRightData(compareData.right.config)
    }
  }, [compareData])

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
      {/* {
        compareData ? */}
        <>
          <div style={{display: 'flex', position: 'relative'}}>
            <Descriptions labelWidthPercent={25}>
              <Descriptions.Item
                label={$t({ defaultMessage: 'Configuration Name' })}
                children={compareData.left.name} />
              <Descriptions.Item
                label={$t({ defaultMessage: 'Created' })}
                children={compareData.left.createdDate} />
              <Descriptions.Item
                label={$t({ defaultMessage: 'Type' })}
                children={compareData.left.backupType} />
            </Descriptions>
            <Descriptions labelWidthPercent={25}>
              <Descriptions.Item
                label={$t({ defaultMessage: 'Configuration Name' })}
                children={compareData.right.name} />
              <Descriptions.Item
                label={$t({ defaultMessage: 'Created' })}
                children={compareData.right.createdDate} />
              <Descriptions.Item
                label={$t({ defaultMessage: 'Type' })}
                children={compareData.right.backupType} />
            </Descriptions>
            <Space className="merge-scroll-lock">
              <label>Synchronised scrolling</label>
              <Switch />
            </Space>
          </div>
          {
            leftData && rightData &&
            <div className='code-mirror-container'>
              <CodeMirrorWidget type='merge' data={{left:leftData, right: rightData}} />
            </div>
          }
        </>
      {/* } */}
    </UI.CompareModal>
  </>
}