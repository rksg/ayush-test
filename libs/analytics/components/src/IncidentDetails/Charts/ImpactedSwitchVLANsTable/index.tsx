import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'

import { Carousel, Popover } from 'antd'
import { CarouselRef }       from 'antd/lib/carousel'
import _                     from 'lodash'
import { useIntl }           from 'react-intl'

import { defaultSort, overlapsRollup, sortProp }                      from '@acx-ui/analytics/utils'
import { Button, Card, Loader, Table, TableProps, NoGranularityText } from '@acx-ui/components'
import { getIntl }                                                    from '@acx-ui/utils'

import { concatMismatchedVlans } from '../ImpactedSwitchVLANDetails'

import {
  ImpactedSwitchPortRow,
  SwitchPortConnectedDevice,
  VLAN,
  useImpactedSwitchVLANsQuery
} from './services'
import * as UI from './styledComponents'

import type { ChartProps } from '../types.d'

export function ImpactedSwitchVLANsTable ({ incident }: ChartProps) {
  const { $t } = useIntl()
  const { id } = incident
  const druidRolledup = overlapsRollup(incident.endTime)

  const response = useImpactedSwitchVLANsQuery({ id },
    { skip: druidRolledup, selectFromResult: (response) => {
      const filteredResponse = response.data?.reduce((agg, row) => {
        const key = [row.portMac, row.connectedDevice.portMac].sort().join('-')
        if (!agg[key]) agg[key] = { ...row, key }
        return agg
      }, {} as Record<string, ImpactedSwitchPortRow>) ?? {}
      const result = Object.values(filteredResponse).map((item, index) => ({ ...item, index }))
      const rows = result.map(concatMismatchedVlans)
      return { ...response, data: rows }
    } })

  const [selected, setSelected] = useState(0)

  return <Loader states={[response]}>
    <Card title={$t({ defaultMessage: 'Impacted Switches' })} type='no-border'>
      {druidRolledup
        ? <NoGranularityText />
        : <>
          <VLANsTable data={response.data!} {...{ selected, onChange: setSelected }} />
          <MismatchConnectionCarousel
            data={response.data!}
            current={selected}
            onChange={setSelected}
          />
        </>
      }
    </Card>
  </Loader>
}



function VLANsTable (props: {
  data: ImpactedSwitchPortRow[]
  selected: number
  onChange: Dispatch<SetStateAction<number>>
}) {
  const { $t, formatList } = useIntl()
  const rows = props.data?.map((item) => ({
    ...item,
    mismatchedVlans: uniqueVlans(item.mismatchedVlans, item.mismatchedUntaggedVlan)
  }))

  const columns: TableProps<ImpactedSwitchPortRow>['columns'] = [{
    key: 'name',
    dataIndex: 'name',
    title: $t({ defaultMessage: 'Local Device' })
  }, {
    key: 'mac',
    dataIndex: 'mac',
    title: $t({ defaultMessage: 'Local Device MAC' })
  }, {
    key: 'portNumber',
    dataIndex: 'portNumber',
    title: $t({ defaultMessage: 'Local Port' })
  }, {
    key: 'mismatchedVlans',
    dataIndex: 'mismatchedVlans',
    title: $t({ defaultMessage: 'Mismatch VLAN' }),
    render: (_, row) => formatList(
      row.mismatchedVlans.map(v => v.id),
      { style: 'narrow', type: 'conjunction' }
    )
  }, {
    key: 'connectedDevicePort',
    dataIndex: ['connectedDevice', 'port'],
    title: $t({ defaultMessage: 'Peer Port' })
  }, {
    key: 'connectedDeviceName',
    dataIndex: ['connectedDevice', 'name'],
    title: $t({ defaultMessage: 'Peer Device' })
  }, {
    key: 'connectedDeviceMac',
    dataIndex: ['connectedDevice', 'mac'],
    title: $t({ defaultMessage: 'Peer Device MAC' })
  }]

  return <Table
    columns={columns}
    rowKey='index'
    dataSource={rows}
    rowSelection={{
      type: 'radio',
      selectedRowKeys: [props.selected],
      onChange ([selected]) { props.onChange(Number(selected)) }
    }}
    tableAlertRender={false}
    pagination={{ defaultPageSize: rows?.length }}
  />
}

function MismatchConnectionCarousel (props: {
  data: ImpactedSwitchPortRow[]
  current: number
  onChange: Dispatch<SetStateAction<number>>
}) {
  const { current } = props
  const ref = useRef<CarouselRef>(null)

  useEffect(() => ref.current?.goTo(current), [current])

  return <UI.CarouselContainer>
    <Carousel
      ref={ref}
      dots={false}
      infinite={false}
      beforeChange={(from, to) => props.onChange(to)}
      arrows
      prevArrow={<UI.PrevIcon />}
      nextArrow={<UI.NextIcon />}
    >
      {props.data?.map(item => <UI.SlideContainer
        key={item.key}
        data-testid={`carousel-slide-${item.index}`}
        data-visible={current === item.index}>
        <UI.SwitchIcon style={{ gridArea: 'from' }} />
        <ImpactedConnection data={item} />
        {item.connectedDevice.isAP
          ? <UI.APIcon style={{ gridArea: 'to' }} />
          : <UI.SwitchIcon style={{ gridArea: 'to' }} />}

        <MismatchedDevice
          gridArea='from-info'
          data={{
            ...item,
            port: item.portNumber,
            isAP: false,
            type: 'Bridge',
            description: ''
          }}
        />
        <MismatchedDevice gridArea='to-info' data={item.connectedDevice} />
      </UI.SlideContainer>)}
    </Carousel>
  </UI.CarouselContainer>
}

const filterVlan99999 = (vlans: VLAN[]) => vlans
  .filter(v => v.id !== 99999 && v.name !== 'ID_NAME_LIST_MISMATCHED')
const uniqueVlans = (vlans: VLAN[], untaggedVlan: VLAN | null) => _(filterVlan99999(vlans))
  .concat(untaggedVlan || [])
  .uniqBy('id')
  .sort((a, b) => a.id - b.id)
  .value()

const vlanList = (vlans: VLAN[]) => getIntl().formatList(
  vlans.map(vlan => `VLAN ${vlan.id}`),
  { type: 'conjunction', style: 'narrow' }
)

function ImpactedConnection ({ data }: { data: ImpactedSwitchPortRow }) {
  const { $t } = useIntl()
  const mismatched = uniqueVlans(data.mismatchedVlans, data.mismatchedUntaggedVlan)
  const allDeviceVlans = uniqueVlans(data.connectedDevice.vlans, data.connectedDevice.untaggedVlan)
  const matched = uniqueVlans(data.vlans, data.untaggedVlan)
    .filter(v => !mismatched.some(m => m.id === v.id))
    .filter(v => allDeviceVlans.some(m => m.id === v.id))
  return (
    <UI.ConnectionContainer>
      <UI.MismatchedHighlight title={vlanList(mismatched)}>
        <UI.ConnectionText>
          <UI.WarningIcon />
          <span>{vlanList(mismatched)}</span>
        </UI.ConnectionText>
      </UI.MismatchedHighlight>

      <UI.ConnectionLink />

      <UI.MatchedHighlight {...(!_.isEmpty(matched) && { title: vlanList(matched) })}>
        {_.isEmpty(matched) ? $t({ defaultMessage: 'No matched VLANs' }) : <UI.ConnectionText>
          <UI.CheckIcon />
          <span>{vlanList(matched)}</span>
        </UI.ConnectionText>}
      </UI.MatchedHighlight>
    </UI.ConnectionContainer>
  )
}

function MismatchedDevice ({ data, gridArea }: {
  data: SwitchPortConnectedDevice
  gridArea: 'from-info' | 'to-info'
}) {
  const { $t } = useIntl()
  const render = (item: VLAN, key: keyof VLAN, fallback?: string) => <UI.UntaggedVLANHighlight
    $highlight={item.id === data.untaggedVlan?.id}
    title={item.id === data.untaggedVlan?.id ? $t({ defaultMessage: 'Untagged VLAN' }) : ''}
    children={item[key] || fallback}
  />
  const columns: TableProps<VLAN>['columns'] = [{
    key: 'id',
    dataIndex: 'id',
    width: 60,
    title: $t({ defaultMessage: 'ID' }),
    sorter: { compare: sortProp('id', defaultSort) },
    sortDirections: ['descend', 'ascend', 'descend'],
    render: (_, row) => render(row, 'id')
  }, {
    key: 'name',
    dataIndex: 'name',
    sorter: { compare: sortProp('name', defaultSort) },
    title: $t({ defaultMessage: 'Name' }),
    render: (_, row) => render(row, 'name', $t({ defaultMessage: '(not set)' }))
  }]

  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (!visible) return

    const handler = () => setVisible(false)
    const keyHandler = (e: KeyboardEvent) => { e.key === 'Escape' && setVisible(false) }
    document.addEventListener('click', handler, false)
    document.addEventListener('keyup', keyHandler, false)
    return () => {
      document.removeEventListener('click', handler, false)
      document.removeEventListener('keyup', keyHandler, false)
    }
  }, [visible])

  const listNotMatched = filterVlan99999(data.vlans).length < data.vlans.length
  const content = <UI.PopoverContainer style={{ height: listNotMatched ? 365 : 350 }}>
    <UI.PopoverTitle children={$t({ defaultMessage: 'VLANs' })} />
    <Table
      columns={columns}
      dataSource={uniqueVlans(data.vlans, data.untaggedVlan)}
      rowKey='id'
      pagination={{ defaultPageSize: 5, showSizeChanger: false }}
    />
    {listNotMatched && <UI.FootNote
      // eslint-disable-next-line max-len
      children={$t({ defaultMessage: 'Note that some VLANs could be missing from the list above.' })}
    />}
    <UI.CloseIcon onClick={() => setVisible(false)} />
  </UI.PopoverContainer>

  return <UI.DeviceContainer
    data-testid={gridArea}
    style={{ gridArea }}
    onClick={(e) => e.stopPropagation()}
  >
    <UI.DeviceName title={data.mac} children={data.name} />
    <UI.DevicePort children={data.port} />
    <Popover {...{ content, visible }}
      destroyTooltipOnHide
      trigger='click'
      placement={gridArea === 'from-info' ? 'top' : 'topLeft'}
    >
      <Button
        type='link'
        size='small'
        onClick={() => setVisible(true)}
        children={$t({ defaultMessage: 'More details' })}
      />
    </Popover>
  </UI.DeviceContainer>
}
