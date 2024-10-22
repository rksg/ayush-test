/* eslint-disable max-len */
import { useEffect, useState } from 'react'

import { Typography, Space }            from 'antd'
import { cloneDeep, findIndex, remove } from 'lodash'
import { useIntl }                      from 'react-intl'

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
  const idx = findIndex(newSelected, { venueId: data.venueId, edgeClusterId: data.edgeClusterId })

  if (checked) {
    idx === -1 && newSelected.push(data)
  } else {
    remove(newSelected, idx)
  }

  return newSelected
}

export interface EdgeClustersDrawerProps {
  onClose: () => void,
  onSubmit: (updates: EdgeMdnsProxyActivation[] | undefined) => void,
  activations: EdgeMdnsProxyActivation[],
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
  }, [visible, activations])

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
    onSubmit(updateContent)
  }

  console.log(updateContent)
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