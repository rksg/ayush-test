

import { Descriptions } from 'antd'
import { useIntl }      from 'react-intl'

import { Button, Card, Loader, PageHeader,  GridRow, GridCol, Subtitle, Table, TableProps } from '@acx-ui/components'
import {
  getPolicyListRoutePath,
  getPolicyDetailsLink,
  PolicyType,
  PolicyOperation
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

import { DataConsumptionLabel }          from '../DataConsumptionHelper'
import { VenueLink, PersonaDetailsLink } from '../LinkHelper'
import { RateLimitingTableCell }         from '../RateLimitingHelper'

function ConnectionMeteringDetailsPageHeader (props: {
  id: string
  title?: string
}) {
  const { $t } = useIntl()
  const { id, title } = props

  const extra = [
    <TenantLink
      key='add'
      // eslint-disable-next-line max-len
      to={getPolicyDetailsLink({ type: PolicyType.CONNECTION_METERING, oper: PolicyOperation.EDIT, policyId: id })}
    >
      <Button type='primary'>
        { $t({ defaultMessage: 'Configure' }) }
      </Button>
    </TenantLink>
  ]

  return (
    <PageHeader
      title={title}
      extra={extra}
      breadcrumb={[
        {
          text: $t({ defaultMessage: 'Policies & Profiles' }),
          link: getPolicyListRoutePath(true) }
      ]}
    />
  )
}

interface Unit {
  id: string
  name: string
}

interface Persona {
  id: string
  name: string
  groupId?: string
}

interface Venue {
  id: string
  name: string
}

interface Detail {
  unit: Unit
  personas: Persona[]
  venue: Venue
  segment?: number
}

interface ConnectionMeteringDetailTableProp {
  data?: Detail[]
}

function ConnectionMeteringDetailTable (prop: ConnectionMeteringDetailTableProp) {
  const { $t } = useIntl()
  const colums: TableProps<Detail>['columns'] = [
    {
      title: $t({ defaultMessage: 'Unit' }),
      dataIndex: 'unit',
      key: 'unit',
      render: (_, row)=><span>{row.unit.name}</span>
    },
    {
      title: $t({ defaultMessage: 'Persona' }),
      dataIndex: 'persona',
      key: 'persona',
      render: (_, row)=> {
        return row.personas.map(persona=> <div><PersonaDetailsLink {...persona}/></div>)
      }
    },
    {
      title: $t({ defaultMessage: 'Venue' }),
      dataIndex: 'venue',
      key: 'venue',
      render: (_, row)=><VenueLink venueId={row.venue.id} name={row.venue.name}/>
    },
    {
      title: $t({ defaultMessage: 'Segment #' }),
      dataIndex: 'segment',
      key: 'segment'
    }
  ]

  return(<Table
    columns={colums}
    dataSource={prop.data}
    type={'compact'}
  />)
}


export function ConnectionMeteringDetail () {
  const { $t } = useIntl()
  const basicInfo = [
    {
      title: $t({ defaultMessage: 'Tags' }),
      value: ''
    },
    {
      title: $t({ defaultMessage: 'Rate Limiting' }),
      value: <RateLimitingTableCell uploadRate={20} downloadRate={0} />
    },
    {
      title: $t({ defaultMessage: 'Data Consumption' }),
      value: <DataConsumptionLabel onOffShow='OFF' dataCapacity={0} billingCycleRepeat={false}/>
    }
  ]

  const data: Detail[] = [{
    unit: {
      id: 'id',
      name: 'name'
    },
    personas: [
      {
        id: 'test1',
        name: 'name1'
      },
      {
        id: 'test2',
        name: 'name2'
      }
    ],
    venue: {
      id: 'venueId',
      name: 'name'
    }
  }]

  return <>
    <ConnectionMeteringDetailsPageHeader
      title={'test'}
      id={'test'}
    />
    <GridRow>
      <GridCol col={{ span: 24 }}>
        <Loader>
          <Card type={'solid-bg'}>
            <Descriptions
              layout={'vertical'}
              column={6}
              size={'small'}
              colon={false}
              style={{ padding: '8px 14px' }}
            >
              {
                basicInfo.map(info =>
                  <Descriptions.Item
                    key={info.title}
                    label={info.title}
                  >
                    {info.value}
                  </Descriptions.Item>
                )
              }
            </Descriptions>
          </Card>
        </Loader>
      </GridCol>
      <GridCol col={{ span: 24 }}>
        <div>
          <Subtitle level={3}>
            {/* eslint-disable-next-line max-len */}
            {$t({ defaultMessage: 'Instances' })} ({data?.length ?? 0})
          </Subtitle>
          <ConnectionMeteringDetailTable data={data}/>
        </div>
      </GridCol>
    </GridRow>
  </>
}

