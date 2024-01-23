import { useMemo, useRef, useState } from 'react'

import { AlignType } from 'rc-table/lib/interface'
import { useIntl }   from 'react-intl'


import { TableProps }                                                   from '@acx-ui/components'
import { EdgeSdLanActivatedNetworksTable, ActivateNetworkSwitchButton } from '@acx-ui/rc/components'
import { useUpdateEdgeSdLanPartialMutation }                            from '@acx-ui/rc/services'
import {
  networkTypes,
  NetworkSaveData,
  sortProp,
  defaultSort
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'
import { hasAccess }             from '@acx-ui/user'

interface EdgeSdLanServiceProps {
  serviceId: string;
  activatedNetworkIds: string[];
}

export const NetworkTable = (props: EdgeSdLanServiceProps) => {
  const { $t } = useIntl()
  const { venueId } = useParams()
  const { serviceId, activatedNetworkIds } = props
  const [isActivateUpdating, setIsActivateUpdating] = useState<boolean>(false)
  const activtaedNetworkTableRef = useRef<{
    dataSource: NetworkSaveData[]
  }>(null)
  const [
    updateEdgeSdLan,
    { isLoading: isActivateRequesting }
  ] = useUpdateEdgeSdLanPartialMutation()

  // eslint-disable-next-line max-len
  const handleActivateChange = async (_data: NetworkSaveData, _checked: boolean, activated: NetworkSaveData[]) => {
    try {
      const newNetworkIds = activated.map(item => item.id)
      const payload = {
        networkIds: newNetworkIds
      }

      setIsActivateUpdating(true)
      await updateEdgeSdLan({
        params: { serviceId },
        payload,
        callback: () => {
          setIsActivateUpdating(false)
        } }).unwrap()

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
    align: 'center' as AlignType,
    width: 80,
    render: (_: unknown, row: NetworkSaveData) => {
      return <ActivateNetworkSwitchButton
        row={row}
        rows={activtaedNetworkTableRef.current?.dataSource ?? []}
        activated={activatedNetworkIds}
        disabled={hasAccess() === false}
        onChange={handleActivateChange}
      />
    }
  }]), [$t, activatedNetworkIds])

  return (
    <EdgeSdLanActivatedNetworksTable
      ref={activtaedNetworkTableRef}
      venueId={venueId!}
      columns={columns}
      isUpdating={isActivateUpdating || isActivateRequesting}
    />
  )
}
