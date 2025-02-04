
import { useMemo, useState } from 'react'


import { map }     from 'lodash'
import { useIntl } from 'react-intl'

import { Incident, overlapsRollup, sortProp }                                             from '@acx-ui/analytics/utils'
import type { SortResult }                                                                from '@acx-ui/analytics/utils'
import { Card, Loader, NoGranularityText, Table, Button, TableProps, Tooltip, showToast } from '@acx-ui/components'
import { CopyOutlined }                                                                   from '@acx-ui/icons-new'

import { ImpactedSwitchesDrawer }              from './ImpactedDrawer'
import { useImpactedVlansQuery, ImpactedVlan } from './services'

import type { ChartProps } from '../types'

export function ImpactedVlanTable ({ incident }: ChartProps) {
  const { $t } = useIntl()
  const { id } = incident
  const druidRolledup = overlapsRollup(incident.endTime)
  const response = useImpactedVlansQuery({ id },
    { skip: druidRolledup,
      selectFromResult: ( response) => {
        return {
          ...response,
          data: response?.data?.map((item) => ({ ...item,
            switchesText: map(item.switches, 'name').join(', ') }))
        }
      }
    })

  return <Loader states={[response]}>
    <Card title={$t({ defaultMessage: 'VLANs' })} type='no-border'>
      {druidRolledup
        ? <NoGranularityText />
        : <ImpactedVLANsTable data={response.data!} incident={incident} />
      }
    </Card>
  </Loader>
}

export function useDrawer (init: boolean) {
  const [visible, setVisible] = useState<boolean>(init)
  const [vlan, setVlan] = useState<ImpactedVlan>({} as ImpactedVlan)
  const onClose = () => setVisible(false)
  const onOpen = (vlan: ImpactedVlan) => {
    setVlan(vlan)
    setVisible(true)
  }
  return { visible, vlan, onOpen, onClose }
}

export const vlanSorter = (a: unknown, b: unknown) => Math.sign(Number(a) - Number(b)) as SortResult

function ImpactedVLANsTable (props: {
  data: ImpactedVlan[],
  incident: Incident
}) {
  const { $t } = useIntl()
  const rows = props.data
  const { visible, vlan, onOpen, onClose } = useDrawer(false)

  const columns: TableProps<ImpactedVlan>['columns'] = useMemo(()=>[
    {
      key: 'vlanId',
      dataIndex: 'vlanId',
      width: 80,
      title: $t({ defaultMessage: 'VLAN ID' }),
      sorter: { compare: sortProp('vlanId', vlanSorter) },
      searchable: true,
      render: function (_, row) {
        return <Button
          type='link'
          size='small'
          onClick={()=>{
            onOpen(row)
          }}
        >{row.vlanId}</Button>
      }
    }, {
      key: 'switchesText',
      dataIndex: 'switchesText',
      width: 430,
      title: $t({ defaultMessage: 'Switches' }),
      searchable: true
    },
    {
      key: 'action',
      dataIndex: 'action',
      title: $t({ defaultMessage: 'Action' }),
      render: (_, { switches }) => {
        return (
          <Tooltip
            title={$t({ defaultMessage: 'Copy Switch name{plural} to clipboard.' }
              ,{ plural: switches.length > 1 ? 's' : '' })}
            placement='top'>
            <CopyOutlined
              onClick={() => {
                const switchesText = map(switches, 'name').join(', ')
                navigator.clipboard.writeText(switchesText)
                showToast({
                  type: 'success',
                  content: $t({ defaultMessage: 'Switch name{plural} copied to clipboard.' },
                    { plural: switches.length > 1 ? 's' : '' }
                  )
                })
              }}
              size='sm'
              style={{ cursor: 'pointer' }}/>
          </Tooltip>
        )
      }
    }
  ],[$t, onOpen])

  return <>
    <Table<ImpactedVlan>
      rowKey='vlanId'
      columns={columns}
      dataSource={rows}
      pagination={{ defaultPageSize: 5, pageSize: 5 }}
    />
    { visible && <ImpactedSwitchesDrawer
      visible={visible}
      vlan={vlan}
      sliceType={props.incident.sliceType}
      path={props.incident.path}
      onClose={onClose}
      impactedCount={vlan.switches?.length}
    /> }
  </>
}

