import { useEffect, useState } from 'react'

import { Badge, Select, Button, List } from 'antd'
import { useIntl }                     from 'react-intl'

import { LayoutUI, GridRow, GridCol, Drawer }   from '@acx-ui/components'
import { NotificationSolid }                    from '@acx-ui/icons'
import { useDashboardOverviewQuery }            from '@acx-ui/rc/services'
import { useAlarmsListQuery }                   from '@acx-ui/rc/services'
import { Alarm, CommonUrlsInfo, useTableQuery } from '@acx-ui/rc/utils'
import { useParams }                            from '@acx-ui/react-router-dom'
import { formatter }                            from '@acx-ui/utils'

import { ListItem, AcknowledgeCircle, WarningCircle } from './styledComponents'

const defaultArray: Alarm[] = []

const defaultPayload = {
  url: CommonUrlsInfo.getAlarmsList.url,
  fields: [
    'startTime',
    'severity',
    'message',
    'entity_id',
    'id',
    'serialNumber',
    'entityType',
    'entityId',
    'entity_type',
    'venueName',
    'apName',
    'switchName',
    'sourceType'
  ]
}

export default function AlarmsHeaderButton () {
  const params = useParams()
  const { data } = useDashboardOverviewQuery({ params })
  const { $t } = useIntl()

  const [modalState, setModalOpen] = useState<boolean>()

  const getCount = function () {
    if (data?.summary?.alarms?.totalCount) {
      const clearedAlarms = data.summary.alarms.summary?.clear || 0
      return data.summary.alarms.totalCount - clearedAlarms
    } else {
      return 0
    }
  }

  const AlarmsHeaderButton = () => {
    return <>
      <Badge
        count={getCount()}
        overflowCount={9}
        offset={[-3, 0]}
        children={<LayoutUI.ButtonSolid icon={<NotificationSolid />}
          onClick={()=>{
            setModalOpen(true)
          }}/>}
      />
      <Drawer
        width={400}
        title={$t({ defaultMessage: 'Alarms' })}
        visible={modalState}
        onClose={() => {
          setModalOpen(false)
        }}
        mask={true}
        children={<AlarmTable/>}
      />
    </>
  }

  return <AlarmsHeaderButton />
}

const AlarmTable = () => {
  const { $t } = useIntl()
  const [severity, setSeverity] = useState('all')

  const tableQuery = useTableQuery({
    useQuery: useAlarmsListQuery,
    defaultPayload: {
      ...defaultPayload,
      filters: severity==='all' ? undefined : { severity: [severity] } },
    sorter: {
      sortField: 'startTime',
      sortOrder: 'DESC'
    }
  })
  const [tableData, setTableData] = useState(defaultArray)

  useEffect(()=>{
    if (tableQuery.data?.data) {
      setTableData(tableQuery.data.data)
    }
  }, [tableQuery.data])

  return <>
    <GridRow style={{ paddingBottom: 5 }}>
      <GridCol col={{ span: 8 }}>
        <Select value={severity}
          onChange={(val)=>{
            setSeverity(val)
          }}>
          <Select.Option value={'all'}>
            { $t({ defaultMessage: 'All Severities' }) }
          </Select.Option>
          <Select.Option value={'Critical'}>
            { $t({ defaultMessage: 'Critical' }) }
          </Select.Option>
          <Select.Option value={'Major'}>
            { $t({ defaultMessage: 'Major' }) }
          </Select.Option>
        </Select>
      </GridCol>
      <GridCol col={{ span: 9, offset: 7 }} >
        <Button type='link' style={{ height: 20, fontWeight: 700 }}>
          {$t({ defaultMessage: 'Clear all alarms' })}
        </Button>
      </GridCol>
    </GridRow>
    <List
      itemLayout='horizontal'
      pagination={tableQuery.pagination}
      dataSource={tableData}
      renderItem={(item) => (

        <ListItem actions={[<Button
          key='delete'
          role='deleteBtn'
          ghost={true}
          // eslint-disable-next-line max-len
          icon={<AcknowledgeCircle/>}
        />]}>
          <List.Item.Meta
            avatar={<WarningCircle />}
            title={<a href='https://ant.design'>{item.message}</a>}
            description={
              <GridRow>
                <GridCol col={{ span: 5 }}>
                  {item.apName}
                </GridCol>
                <GridCol col={{ span: 9, offset: 10 }}>
                  {formatter('calendarFormat')(item.startTime)}
                </GridCol>
              </GridRow>
            }
          />
        </ListItem>
      )}
    />
  </>
}
