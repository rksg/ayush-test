import { useMemo } from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'

import { TableProps }                                                   from '@acx-ui/components'
import { ActivateNetworkSwitchButton, EdgeSdLanActivatedNetworksTable } from '@acx-ui/rc/components'
import { useUpdateEdgeSdLanPartialMutation }                            from '@acx-ui/rc/services'
import {
  networkTypes,
  NetworkSaveData,
  sortProp,
  defaultSort
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'

interface EdgeSdLanServiceProps {
  serviceId: string;
  activatedNetworkIds: string[];
}

export const NetworkTable = (props: EdgeSdLanServiceProps) => {
  const { $t } = useIntl()
  const { venueId } = useParams()
  const { serviceId, activatedNetworkIds } = props
  const [
    updateEdgeSdLan,
    { isLoading: isActivateUpdating }
  ] = useUpdateEdgeSdLanPartialMutation()

  const handleActivateChange = async (data: NetworkSaveData, checked: boolean) => {
    try {
      let newNetworkIds
      if (checked) {
        newNetworkIds = _.union(activatedNetworkIds, [data.id])
      } else {
        newNetworkIds = [...activatedNetworkIds]
        _.remove(newNetworkIds, (i) => i === data.id)
      }

      const payload = {
        networkIds: newNetworkIds
      }

      await updateEdgeSdLan({ params: { serviceId }, payload }).unwrap()
    } catch(err) {
      // eslint-disable-next-line no-console
      console.log(err)
    }
  }

  const columns: TableProps<NetworkSaveData>['columns'] = useMemo(() => ([{
    title: $t({ defaultMessage: 'Network' }),
    key: 'name',
    dataIndex: 'name',
    defaultSortOrder: 'ascend',
    fixed: 'left',
    sorter: { compare: sortProp('name', defaultSort) },
    render: (_, row) => (
      <TenantLink to={`/networks/wireless/${row.id}/network-details/overview`}>
        {row.name}
      </TenantLink>)
  }, {
    title: $t({ defaultMessage: 'Network Type' }),
    key: 'type',
    dataIndex: 'type',
    sorter: { compare: sortProp('type', defaultSort) },
    render: (_, row) => {
      return $t(networkTypes[row.type!])
    }
  }, {
    title: $t({ defaultMessage: 'Active' }),
    key: 'action',
    dataIndex: 'action',
    align: 'center',
    width: 80,
    render: (_, row) => {
      return <ActivateNetworkSwitchButton
        row={row}
        activated={activatedNetworkIds}
        onChange={handleActivateChange}
      />
    }
  }]), [$t, activatedNetworkIds])

  return (
    <EdgeSdLanActivatedNetworksTable
      venueId={venueId!}
      columns={columns}
      activated={activatedNetworkIds}
      isUpdating={isActivateUpdating}
    />
  )
}