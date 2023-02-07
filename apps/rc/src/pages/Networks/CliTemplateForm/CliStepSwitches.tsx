import { useContext, useState, useEffect } from 'react'

import { Col, Collapse, Form, Input, Row, Space, Typography } from 'antd'
import _                                                      from 'lodash'
import { useIntl, FormattedMessage }                          from 'react-intl'

import { cssStr, StepsForm, Table, TableProps, Loader } from '@acx-ui/components'
import { PlusSquareOutlined, MinusSquareOutlined }      from '@acx-ui/icons'
import { useLazyGetSwitchListQuery }                    from '@acx-ui/rc/services'
import { useGetVenuesQuery }                            from '@acx-ui/rc/services'
import { CliTemplateVenueSwitches }                     from '@acx-ui/rc/utils'
import { useParams }                                    from '@acx-ui/react-router-dom'


import CliTemplateFormContext from './CliTemplateFormContext'
import * as UI                from './styledComponents'

interface Switch {
  name: string
  model: string
  uptime: string
}

interface VenueSwitch {
  id: string
  switches?: string[]
}

type SelectedSwitches = Record<string, React.Key[]>[]

export function CliStepSwitches () {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const form = Form.useFormInstance()

  const { data: venues } = useGetVenuesQuery({
    params: { tenantId }, payload: {
      fields: ['name', 'switches', 'id'],
      sortField: 'name',
      sortOrder: 'ASC'
    }
  })

  const [venueSwitches, setVenueSwitches] = useState([] as VenueSwitch[])
  const [selectedSwitches, setSelectedSwitches] = useState([] as any)
  const [getSwitchList] = useLazyGetSwitchListQuery()
  const { editMode, data } = useContext(CliTemplateFormContext)

  const getSwitchListPayload = (venueId: string) => ({
    fields: [
      'check-all', 'name', 'id', 'serialNumber', 'isStack', 'formStacking',
      'venueId', 'switchName', 'model', 'uptime', 'configReady',
      'syncedSwitchConfig', 'operationalWarning', 'venueName'
    ],
    pageSize: 9999,
    filters: {
      venueId: [venueId],
      // deviceStatus: ['ONLINE'], //
      syncedSwitchConfig: [true],
      configReady: [true]
    }
  })

  useEffect(() => {
    if (editMode && data) {
      console.log(data)
      const selected = data.venueSwitches?.reduce((result: any, v: any) => ({
        ...result,
        [v.venueId]: v.switches
      }), {})

      setSelectedSwitches(selected)
      form?.setFieldValue('venueSwitches', selected)
    }
  }, [data])

  useEffect(() => {
    if (venues?.data) {
      setVenueSwitches(venues?.data
        .filter((v) => v.switches)
        .map((v) => ({ id: v.id }))
      )
    }
  }, [venues])

  const columns: TableProps<Switch>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Switch' }),
      dataIndex: 'name',
      sorter: true
    },
    {
      key: 'model',
      title: $t({ defaultMessage: 'Model' }),
      dataIndex: 'model',
      sorter: true
    },
    {
      key: 'uptime',
      title: $t({ defaultMessage: 'Uptime' }),
      dataIndex: 'uptime',
      sorter: true
    }
  ]

  return <Row gutter={24}>
    <Col span={18}>
      <StepsForm.Title>{$t({ defaultMessage: 'Switches' })}</StepsForm.Title>
      <Typography.Text style={{
        display: 'block', marginBottom: '15px', fontSize: '14px',
        color: cssStr('--acx-primary-black')
      }}>
        {<FormattedMessage
          defaultMessage={`
          - Select the venues or specific switches that will have this configuration applied onto them<br></br>
          - Only operational switches are displayed here`}
          values={{
            br: () => <br />
          }}
        />}
      </Typography.Text>
      <Form.Item
        hidden={true}
        name='venueSwitches'
        children={<Input />}
      />
      <UI.Collapse
        bordered={false}
        expandIcon={(panelProps) => panelProps?.isActive
          ? <MinusSquareOutlined /> : <PlusSquareOutlined />
        }
        onChange={async (key) => {
          const expandRowKey = key?.[key.length - 1]
          const expandRow = venueSwitches?.filter(v => v.id === expandRowKey)?.[0]

          if (expandRow && !expandRow?.switches) {
            const list = (await getSwitchList({
              params: { tenantId: tenantId }, payload: getSwitchListPayload(expandRow.id)
            }, false)).data?.data || []

            const switches = venueSwitches.map(v => {
              return v.id === expandRowKey
                ? { id: expandRowKey, switches: list }
                : v
            })

            setVenueSwitches(switches as VenueSwitch[])
          }
        }}
      >
        {
          venues?.data?.map((v) => {
            return <Collapse.Panel
              header={<Space>
                {/* TODO: Select All */}
                {/* <Form.Item
                  noStyle
                  name={`selectAll_${v.id}`}
                  valuePropName='checked'
                >
                  <Checkbox />
                </Form.Item> */}
                <Space>{v?.name}</Space>
                <Space>{v?.switches}{$t({ defaultMessage: 'Switches' })}</Space>
              </Space>}
              collapsible={v?.switches ? 'header' : 'disabled'}
              key={v?.id}
            >
              <Loader states={[{
                isLoading: !getVenueSwitches(v.id, venueSwitches)
              }]}>
                <Table
                  rowKey='id'
                  rowSelection={{
                    type: 'checkbox',
                    ...(selectedSwitches?.hasOwnProperty(v?.id)
                      && { selectedRowKeys: selectedSwitches?.[v?.id] ?? [] }
                    ),
                    onChange: (keys: React.Key[]) => {
                      setSelectedSwitches({ ...selectedSwitches, [v.id]: keys })
                      form?.setFieldValue('venueSwitches', {
                        ...selectedSwitches,
                        [v.id]: keys
                      })
                    }
                  }}
                  tableAlertRender={false}
                  dataSource={getVenueSwitches(v.id, venueSwitches)}
                  columns={columns}
                />
              </Loader>
            </Collapse.Panel>
          })
        }
      </UI.Collapse>
    </Col>
  </Row>
}

function getVenueSwitches (venueId: string, venueSwitches: any) {
  return venueSwitches.filter((venue: any) => venue.id === venueId)?.[0]?.switches ?? null
}