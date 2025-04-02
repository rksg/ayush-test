import { useMemo, useState } from 'react'

import { Space }     from 'antd'
import { get, pick } from 'lodash'
import { AlignType } from 'rc-table/lib/interface'
import { useIntl }   from 'react-intl'

import { Button, Loader, Table, TableProps, Tooltip, useStepFormContext } from '@acx-ui/components'
import { Features, useIsSplitOn }                                         from '@acx-ui/feature-toggle'
import { EditOutlined }                                                   from '@acx-ui/icons-new'
import { tansformSdLanScopedVenueMap }                                    from '@acx-ui/rc/components'
import { useVenuesListQuery }                                             from '@acx-ui/rc/services'
import {
  arraySizeSort,
  defaultSort,
  EdgeMvSdLanFormModel,
  sortProp
} from '@acx-ui/rc/utils'

import { useEdgeSdLanContext } from '../../EdgeSdLanContextProvider'

import { CompatibilityCheck }                    from './CompatibilityCheck'
import { NetworkActivationType, NetworksDrawer } from './NetworksDrawer'

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
  const isEdgeCompatibilityEnabled = useIsSplitOn(Features.EDGE_COMPATIBILITY_CHECK_TOGGLE)

  const { $t } = useIntl()
  const { value: activated } = props
  const { form: formRef } = useStepFormContext<EdgeMvSdLanFormModel>()
  const { allSdLans, allPins } = useEdgeSdLanContext()

  const [networkDrawerVenueId, setNetworkDrawerVenueId] = useState<string|undefined>(undefined)

  const serviceId = formRef.getFieldValue('id')

  // venue list should filter out the venues that already tied to other SDLAN services and PIN services.
  const usedVenueIds = useMemo(() => {
    const sdlanVenueIds = Object.entries(tansformSdLanScopedVenueMap(allSdLans))
      .map(([venueId, sdlan]) => {
        return (!!serviceId && sdlan.id === serviceId) ? undefined : venueId
      })
      .filter(i => !!i)

    const pinVenueIds = allPins?.map(pin => pin.venueId).filter(id => !!id) || []

    return [...sdlanVenueIds, ...pinVenueIds]
  }, [allPins, allSdLans, serviceId])

  const { availableVenues, isLoading, isFetching } = useVenuesListQuery({
    payload: {
      fields: ['name', 'country', 'city', 'id'],
      pageSize: 10000,
      sortField: 'name',
      sortOrder: 'ASC'
    }
  }, {
    selectFromResult: ({ data, isLoading, isFetching }) => ({
      isLoading,
      isFetching,
      availableVenues: data?.data.filter(venue => {
        return !usedVenueIds.includes(venue.id)
      }).map(item => ({
        ...pick(item, ['id', 'name']),
        address: `${item.country}, ${item.city}`,
        selectedNetworks: get(activated, item.id)
      } as VenueTableDataType)) ?? []
    })
  })


  const columns: TableProps<VenueTableDataType>['columns'] = useMemo(() => ([{
    title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
    key: 'name',
    dataIndex: 'name',
    defaultSortOrder: 'ascend',
    fixed: 'left',
    sorter: { compare: sortProp('name', defaultSort) },
    render: (_, row) => {
      return isEdgeCompatibilityEnabled
        ? <Space align='center'>
          {row.name}
          <CompatibilityCheck venueId={row.id} venueName={row.name} />
        </Space>
        : row.name
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
    venueId: string,
    activatedNetworks: NetworkActivationType['venueId']
  ) => {
    formRef.setFieldValue('activatedNetworks', {
      ...formRef.getFieldValue('activatedNetworks'),
      [venueId]: activatedNetworks
    })
    formRef.validateFields(['activatedNetworks'])
    closeNetworkModal()
  }

  const pinNetworkIds = allPins?.flatMap(item => item.tunneledWlans ?? [])
    .map(wlan => wlan?.networkId)
    .filter(networkId => !!networkId)

  return (
    <>
      <Loader states={[ { isLoading, isFetching } ]}>
        <Table
          rowKey='id'
          columns={columns}
          dataSource={availableVenues}
        />
      </Loader>
      {networkDrawerVenueId && <NetworksDrawer
        visible={true}
        onClose={closeNetworkModal}
        onSubmit={handleNetworkModalSubmit}
        venueId={networkDrawerVenueId!}
        venueName={availableVenues.find(item => item.id === networkDrawerVenueId)?.name}
        tunneledNetworks={formRef.getFieldValue('activatedNetworks')?.[networkDrawerVenueId]}
        pinNetworkIds={pinNetworkIds}
      />}
    </>
  )
}