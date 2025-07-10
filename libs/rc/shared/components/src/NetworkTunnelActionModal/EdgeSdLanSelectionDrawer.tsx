import { useEffect, useState } from 'react'

import { Key as AntdTableKeyType } from 'antd/lib/table/interface'
import { useIntl }                 from 'react-intl'

import {
  Table,
  TableProps,
  Drawer,
  Alert
} from '@acx-ui/components'
import {
  EdgeMvSdLanViewData
} from '@acx-ui/rc/utils'

import { messageMappings } from './messageMappings'

interface EdgeSdLanSelectionDrawerProps {
  sdLanOptions: EdgeMvSdLanViewData[] | undefined
  visible: boolean
  onClose: () => void
  onSubmit: (sdLanId: string | undefined) => void
}

export const EdgeSdLanSelectionDrawer = (props: EdgeSdLanSelectionDrawerProps) => {
  const { sdLanOptions, visible, onClose, onSubmit } = props
  const { $t } = useIntl()
  const [selectedSdLanId, setSelectedSdLanId] = useState<string | undefined>(undefined)

  const columns: TableProps<EdgeMvSdLanViewData>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      render: (_, row) => {
        return row.name
      }
    },
    {
      title: $t({ defaultMessage: 'Destination Cluster' }),
      key: 'edgeClusterId',
      dataIndex: 'edgeClusterId',
      sorter: true,
      render: (_, row) => {
        return row.edgeClusterName
      }
    },
    {
      title: $t({ defaultMessage: 'Tunnel Profile (AP to Cluster)' }),
      key: 'tunnelProfileId',
      dataIndex: 'tunnelProfileId',
      sorter: true,
      render: (_, row) => {
        return row.tunnelProfileName
      }
    }
  ]

  const handleSubmit = async () => {
    onSubmit(selectedSdLanId)
  }

  const handleRowSelectChange =(selectedRowKeys: AntdTableKeyType[]) => {
    // update the selected row keys
    setSelectedSdLanId(selectedRowKeys[0] as string)
  }

  useEffect(() => {
    if (visible) {
      setSelectedSdLanId(undefined)
    }
  }, [visible])

  return <Drawer
    title={$t({ defaultMessage: 'Select SD-LAN Service' })}
    visible={visible}
    onClose={onClose}
    width={600}
    footer={<Drawer.FormFooter
      buttonLabel={{ save: $t({ defaultMessage: 'Apply' }) }}
      onCancel={onClose}
      onSave={handleSubmit}
    />}
  >
    <Alert message={$t(messageMappings.sd_lan_table_drawer_description)} />
    <Table
      rowKey='id'
      columns={columns}
      dataSource={sdLanOptions}
      rowSelection={{
        type: 'radio',
        onChange: handleRowSelectChange,
        selectedRowKeys: selectedSdLanId ? [selectedSdLanId] : undefined
      }}
    />
  </Drawer>

}
