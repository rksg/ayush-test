import { Fragment } from 'react'

import { Divider }            from 'antd'
import { IntlShape, useIntl } from 'react-intl'

import {
  ContentSwitcher,
  ContentSwitcherProps,
  Descriptions,
  Drawer,
  Subtitle
} from '@acx-ui/components'
import { Olt, OltStatusEnum, OltMockdata } from '@acx-ui/olt/utils'
import { transformDisplayText }            from '@acx-ui/rc/utils'
import { TenantLink }                      from '@acx-ui/react-router-dom'

import { OltStatus } from '../../OltStatus'

interface OltDetailsDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  oltDetails?: Olt,
}

type FieldDef<T> = {
  label: React.ReactNode
  key: keyof T
  render?: (value: T[keyof T], item: T) => React.ReactNode
}

type LineCard = {
  status: OltStatusEnum
  model: string
  cages: number
  serialNumber: string
}

type NetworkCard = {
  status: OltStatusEnum
  serialNumber: string
  version: string
  uptime: string
  speed: string
  info: string
  vlans: string
  lag: string
}

const { networkCardInfo, lineCardInfo } = OltMockdata

export const OltDetailsDrawer = (props: OltDetailsDrawerProps) => {
  const { $t } = useIntl()
  const { visible, setVisible, oltDetails } = props

  const onClose = () => {
    setVisible(false)
  }

  const tabDetails: ContentSwitcherProps['tabDetails'] = [{
    label: $t({ defaultMessage: 'Network Card' }),
    value: 'network',
    children: <CardInfo
      title={$t({ defaultMessage: 'Network Card' })}
      items={networkCardInfo as NetworkCard[]}
      fields={getNetworkCardFields($t)}
    />
  }, {
    label: $t({ defaultMessage: 'Line Card' }),
    value: 'line',
    children: <CardInfo
      title={$t({ defaultMessage: 'PON Line Card' })}
      items={lineCardInfo as LineCard[]}
      fields={getLineCardFields($t)}
    />
  }]

  return (
    <Drawer
      title={$t({ defaultMessage: 'Optical Details' })}
      visible={visible}
      onClose={onClose}
      width={480}
      children={<div> {/* TODO */}
        <CardInfo
          title=''
          items={[oltDetails as Olt]}
          fields={getOltDetailsFields($t)}
        />
        {/* <Descriptions labelWidthPercent={50} key='olt-details'>
          <Descriptions.Item
            label={$t({ defaultMessage: 'IP Address' })}
            children={transformDisplayText(oltDetails?.ip)}
          />
          <Descriptions.Item
            label={$t({ defaultMessage: 'Vendor' })}
            children={transformDisplayText(oltDetails?.vendor)}
          />
          <Descriptions.Item
            label={$t({ defaultMessage: 'S/N' })}
            children={transformDisplayText(oltDetails?.serialNumber)}
          />
          <Descriptions.Item
            label={$t({ defaultMessage: 'Model' })}
            children={transformDisplayText(oltDetails?.model)}
          />
          <Descriptions.Item
            label={$t({ defaultMessage: 'Firmware Version' })}
            children={transformDisplayText(oltDetails?.firmware)}
          />
          <Descriptions.Item
            label={$t({ defaultMessage: '<VenueSingular></VenueSingular>' })}
            children={
              oltDetails?.venueId
                ? <TenantLink to={`/venues/${oltDetails?.venueId}/venue-details/overview`}>
                  {oltDetails?.venueName}
                </TenantLink>
                : noDataDisplay
            }
          />
          <Descriptions.Item
            label={$t({ defaultMessage: 'Admin Password' })}
            children={transformDisplayText(oltDetails?.adminPassword)}
          />
        </Descriptions> */}

        <Divider/>

        <ContentSwitcher
          defaultValue='network'
          tabDetails={tabDetails}
          size='small'
          align='center'
        />

      </div>}
    />
  )
}

function CardInfo<T> ({ title, items, fields }: {
  title: string
  items: T[]
  fields: FieldDef<T>[]
}) {
  const { $t } = useIntl()
  return <>
    {items.map((item, index) => (
      <Fragment key={`${title}-${index}`}>
        {title && <Subtitle level={5}>
          {$t({ defaultMessage: '{title} {index}' }, { title, index: index + 1 })}
        </Subtitle>}
        <Descriptions labelWidthPercent={50}>
          {fields.map(({ label, key, render }) => (
            <Descriptions.Item key={String(key)} label={label}>
              {render
                ? render(item[key], item)
                : transformDisplayText(item[key] as unknown as string)
              }
            </Descriptions.Item>
          ))}
        </Descriptions>
        {index + 1 < items.length ? <Divider /> : null}
      </Fragment>
    ))}
  </>
}

function getOltDetailsFields ($t: IntlShape['$t']): FieldDef<Olt>[] {
  return [
    { label: $t({ defaultMessage: 'IP Address' }), key: 'ip' },
    { label: $t({ defaultMessage: 'Vendor' }), key: 'vendor' },
    { label: $t({ defaultMessage: 'S/N' }), key: 'serialNumber' },
    { label: $t({ defaultMessage: 'Model' }), key: 'model' },
    { label: $t({ defaultMessage: 'Firmware Version' }), key: 'firmware' },
    { label: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }), key: 'venueName',
      render: (value, item) => <TenantLink to={`/venues/${item.venueId}/venue-details/overview`}>
        {item.venueName}
      </TenantLink>
    },
    { label: $t({ defaultMessage: 'Admin Password' }), key: 'adminPassword' }
  ]
}

function getNetworkCardFields ($t: IntlShape['$t']): FieldDef<NetworkCard>[] {
  return [
    { label: $t({ defaultMessage: 'S/N' }), key: 'serialNumber' },
    { label: $t({ defaultMessage: 'Software Version' }), key: 'version' },
    { label: $t({ defaultMessage: 'Uptime' }), key: 'uptime' },
    {
      label: $t({ defaultMessage: 'Uplink Ports Status' }),
      key: 'status',
      render: (value) => <OltStatus status={value as OltStatusEnum} showText />
    },
    { label: $t({ defaultMessage: 'Uplink Ports Speed' }), key: 'speed' },
    { label: $t({ defaultMessage: 'Optic Information' }), key: 'info' },
    { label: $t({ defaultMessage: 'VLANs' }), key: 'vlans' },
    { label: $t({ defaultMessage: 'LAG' }), key: 'lag' }
  ]
}

function getLineCardFields ($t: IntlShape['$t']): FieldDef<LineCard>[] {
  return [
    {
      label: $t({ defaultMessage: 'Status' }),
      key: 'status',
      render: (value) => <OltStatus status={value as OltStatusEnum} showText />
    },
    { label: $t({ defaultMessage: 'Model' }), key: 'model' },
    { label: $t({ defaultMessage: 'Cages' }), key: 'cages' },
    { label: $t({ defaultMessage: 'Serial Number' }), key: 'serialNumber' }
  ]
}