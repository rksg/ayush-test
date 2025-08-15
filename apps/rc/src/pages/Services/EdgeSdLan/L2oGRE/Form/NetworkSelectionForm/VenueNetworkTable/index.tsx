import { useMemo, useState } from 'react'

import { Space }     from 'antd'
import { get, pick } from 'lodash'
import { AlignType } from 'rc-table/lib/interface'
import { useIntl }   from 'react-intl'

import { Button, Table, TableProps, Tooltip, useStepFormContext } from '@acx-ui/components'
import { EditOutlined }                                           from '@acx-ui/icons-new'
import { transformSdLanScopedVenueMap }                           from '@acx-ui/rc/components'
import {
  arraySizeSort,
  defaultSort,
  EdgeMvSdLanFormModel,
  sortProp
} from '@acx-ui/rc/utils'

import { NetworkActivationType } from '../../../shared/type'
import { useEdgeSdLanContext }   from '../../EdgeSdLanContextProvider'

import { CompatibilityCheck } from './CompatibilityCheck'
import { NetworksDrawer }     from './NetworksDrawer'

export interface VenueTableDataType {
  id: string
  name: string
  address: string
  selectedNetworks: NetworkActivationType['venueId']
}

export interface VenueNetworksTableProps {
  value?: NetworkActivationType
}

export const EdgeSdLanVenueNetworksTable = (props: VenueNetworksTableProps) => {
  const { $t } = useIntl()
  const { value: activated } = props
  const { form: formRef } = useStepFormContext<EdgeMvSdLanFormModel>()
  const { allSdLans, allPins, allSoftGreVenueMap, allVenues } = useEdgeSdLanContext()

  const [networkDrawerVenueId, setNetworkDrawerVenueId] = useState<string|undefined>(undefined)

  const serviceId = formRef.getFieldValue('id')

  // venue list should filter out the venues that already tied to other SDLAN services and PIN services.
  const usedVenueIds = useMemo(() => {
    const sdlanVenueIds = Object.entries(transformSdLanScopedVenueMap(allSdLans))
      .map(([venueId, sdlan]) => {
        return (!!serviceId && sdlan.id === serviceId) ? undefined : venueId
      })
      .filter(i => !!i)

    const pinVenueIds = allPins?.map(pin => pin.venueId).filter(id => !!id) || []

    return [...sdlanVenueIds, ...pinVenueIds]
  }, [allPins, allSdLans, serviceId])

  const availableVenues = allVenues?.filter(venue => {
    return !usedVenueIds.includes(venue.id)
  }).map(item => ({
    ...pick(item, ['id', 'name']),
    address: `${item.country}, ${item.city}`,
    selectedNetworks: get(activated, item.id)
  } as VenueTableDataType)) ?? []

  const columns: TableProps<VenueTableDataType>['columns'] = useMemo(() => ([{
    title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
    key: 'name',
    dataIndex: 'name',
    defaultSortOrder: 'ascend',
    fixed: 'left',
    sorter: { compare: sortProp('name', defaultSort) },
    render: (_, row) => {
      return <Space align='center'>
        {row.name}
        <CompatibilityCheck venueId={row.id} venueName={row.name} />
      </Space>
    }
  }, {
    title: $t({ defaultMessage: 'Address' }),
    width: Infinity,
    key: 'address',
    dataIndex: 'address',
    sorter: { compare: sortProp('address', defaultSort) }
  }, {
    title: $t({ defaultMessage: 'Selected Networks' }),
    key: 'selectedNetworks',
    dataIndex: 'selectedNetworks',
    align: 'center' as AlignType,
    width: 100,
    sorter: { compare: sortProp('selectedNetworks', arraySizeSort) },
    render: (_, row) => {
      const venueNetworks = row.selectedNetworks
      const networkCount = venueNetworks?.length ?? 0
      const networkNames = venueNetworks?.filter(i => i)
        .map(item => <span key={item.networkId}>{item.networkName}</span>)
      return networkCount > 0
        ? <Space>
          <Tooltip dottedUnderline
            title={<Space direction='vertical'>
              {networkNames}
            </Space>}
            children={networkCount}
          />
          <Button
            type='link'
            size='small'
            icon={<EditOutlined />}
            onClick={() => setNetworkDrawerVenueId(row.id)}
          />
        </Space>
        : <Button type='link' onClick={() => setNetworkDrawerVenueId(row.id)}>
          {$t({ defaultMessage: 'Select Networks' })}
        </Button>
    }
  }]), [activated])

  const closeNetworkModal = () => {
    setNetworkDrawerVenueId(undefined)
  }

  const handleNetworkModalSubmit = (
    activatedNetworks: NetworkActivationType
  ) => {
    formRef.setFieldValue('activatedNetworks', activatedNetworks)
    formRef.validateFields(['activatedNetworks'])
    closeNetworkModal()
  }

  const pinNetworkIds = allPins?.flatMap(item => item.tunneledWlans ?? [])
    .map(wlan => wlan?.networkId)
    .filter(networkId => !!networkId)

  return (
    <>
      <Table
        rowKey='id'
        columns={columns}
        dataSource={availableVenues}
      />
      {networkDrawerVenueId && <NetworksDrawer
        visible={true}
        onClose={closeNetworkModal}
        onSubmit={handleNetworkModalSubmit}
        venueId={networkDrawerVenueId!}
        venueName={availableVenues.find(item => item.id === networkDrawerVenueId)?.name}
        activatedNetworks={formRef.getFieldValue('activatedNetworks')}
        pinNetworkIds={pinNetworkIds}
        softGreNetworkIds={(allSoftGreVenueMap?.[networkDrawerVenueId!] ?? [])
          .flatMap(sg => sg.networkIds)}
      />}
    </>
  )
}