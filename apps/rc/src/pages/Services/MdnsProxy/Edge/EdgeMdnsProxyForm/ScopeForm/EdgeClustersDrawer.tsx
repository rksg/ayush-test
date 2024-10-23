/* eslint-disable max-len */
import { useEffect, useState } from 'react'

import { Typography, Space }                  from 'antd'
import { cloneDeep, findIndex, pick, remove } from 'lodash'
import { useIntl }                            from 'react-intl'

import { Drawer }                  from '@acx-ui/components'
import { EdgeMdnsProxyActivation } from '@acx-ui/rc/utils'

import { messageMappings } from '../messageMappings'

import { EdgeClustersTable } from './EdgeClustersTable'

import { VenueTableDataType } from '.'

const toggleItemFromSelected = (
  checked: boolean,
  data: EdgeMdnsProxyActivation,
  selectedClusters: EdgeMdnsProxyActivation[]
) => {
  let newSelected: EdgeMdnsProxyActivation[] = cloneDeep(selectedClusters)
  const condition = pick(data, ['venueId', 'edgeClusterId'])
  const idx = findIndex(newSelected, condition)

  if (checked) {
    idx === -1 && newSelected.push(data)
  } else {
    remove(newSelected, condition)
  }

  return newSelected
}

export interface EdgeClustersDrawerProps {
  onClose: () => void,
  onSubmit: (venueId:string, updates: EdgeMdnsProxyActivation[] | undefined) => void,
  activations: EdgeMdnsProxyActivation[] | undefined,
  venueId?: string,
  availableVenues?: VenueTableDataType[]
}

export const EdgeClustersDrawer = (props: EdgeClustersDrawerProps) => {
  const { $t } = useIntl()
  const {
    onClose,
    onSubmit,
    activations,
    venueId,
    availableVenues
  } = props

  const visible = Boolean(venueId)
  const venueName = availableVenues?.find(item => item.id === venueId)?.name

  const [updateContent, setUpdateContent] = useState<EdgeMdnsProxyActivation[] | undefined>(undefined)

  useEffect(() => {
    if (visible) {
      setUpdateContent(activations?.filter(item => item.venueId === venueId))
    }
  }, [visible, venueId, activations])

  const handleActivateChange = (checked: boolean, edgeClusterId: string, edgeClusterName: string) => {
    setUpdateContent((prev) => {
      return toggleItemFromSelected(checked, {
        venueId: venueId!,
        venueName: venueName ?? '',
        edgeClusterId,
        edgeClusterName
      }, prev ?? [])
    })
  }

  const handleSubmit = async () => {
    onSubmit(venueId!, updateContent)
  }

  return (
    <Drawer
      title={$t({ defaultMessage: '{venueName}: Select RUCKUS Edge Clusters' }, { venueName })}
      width={500}
      visible={visible}
      onClose={onClose}
      footer={
        <Drawer.FormFooter
          buttonLabel={{
            save: $t({ defaultMessage: 'OK' })
          }}
          onCancel={onClose}
          onSave={handleSubmit}
        />
      }
    >
      <Space direction='vertical' size={0}>
        <Typography.Paragraph>
          { $t(messageMappings.drawer_table_description, { venueName }) }
        </Typography.Paragraph>
        {visible && venueId && <EdgeClustersTable
          venueId={venueId}
          activated={updateContent?.map(item => item.edgeClusterId)}
          onActivateChange={handleActivateChange}
        />}
      </Space>
    </Drawer>
  )
}