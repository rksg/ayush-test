/* eslint-disable max-len */
import { useEffect, useRef, useState } from 'react'

import { useIntl } from 'react-intl'

import { Button, Loader, Modal, Table, TableProps, Descriptions }    from '@acx-ui/components'
import { useGetSwitchConfigHistoryQuery }                            from '@acx-ui/rc/services'
import { ConfigurationBackup, ConfigurationHistory, DispatchFailedReason, useTableQuery } from '@acx-ui/rc/utils'

import * as UI         from './styledComponents'
import { CodeMirrorWidget } from '@acx-ui/rc/components'

export function ViewConfigurationModal (props:{
  data: ConfigurationBackup,
  visible: boolean,
  handleCancel: () => void
}) {
  const { $t } = useIntl()
  const codeMirrorEl = useRef(null as unknown as { highlightLine: Function, removeHighlightLine: Function })
  const { data, visible, handleCancel } = props
  const [showError, setShowError] = useState(true)
  const [showClis, setShowClis] = useState(true)
  const [collapseActive, setCollapseActive] = useState(false)
  const [dispatchFailedReason, setDispatchFailedReason] = useState([] as DispatchFailedReason[])
  const [selectedRow, setSelectedRow] = useState(null as unknown as ConfigurationHistory)


  return <>
    <UI.ViewModal
      title={$t({ defaultMessage: 'View Configuration' })}
      visible={visible}
      onCancel={handleCancel}
      width={600}
      footer={<Button key='back' type='secondary' onClick={handleCancel}>
        {$t({ defaultMessage: 'Close' })}
      </Button>
      }
    >
      {
        data &&
        <>
          <Descriptions labelWidthPercent={30}>
            <Descriptions.Item
              label={$t({ defaultMessage: 'Configuration Name' })}
              children={data.name} />
            <Descriptions.Item
              label={$t({ defaultMessage: 'Created' })}
              children={data.createdDate} />
            <Descriptions.Item
              label={$t({ defaultMessage: 'Type' })}
              children={data.backupType} />
          </Descriptions>
          <div className='code-mirror-container'>
            <CodeMirrorWidget type='single' data={{...data, clis: data.config}} />
          </div>
        </>
      }
    </UI.ViewModal>
  </>
}