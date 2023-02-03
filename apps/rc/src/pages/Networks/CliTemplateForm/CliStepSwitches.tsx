import { useState, useEffect } from 'react'

import { Col, Collapse, Form, Input, Row, Space, Typography } from 'antd'
import _                                                      from 'lodash'
import { useIntl, FormattedMessage }                          from 'react-intl'

import { cssStr, StepsForm, Table, TableProps, Loader } from '@acx-ui/components'
import { PlusSquareOutlined, MinusSquareOutlined }      from '@acx-ui/icons'
import { useLazyGetSwitchListQuery }                    from '@acx-ui/rc/services'
import { useGetVenuesQuery }                            from '@acx-ui/rc/services'
import { useParams }                                    from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

export enum VariableType {
  ADDRESS = 'ADDRESS',
  RANGE = 'RANGE',
  STRING = 'STRING'
}

export interface Variable {
  name: string
  type: string
  value: string
}

export function CliStepSwitches (props: {
  formRef: any
}) {
  const { $t } = useIntl()
  const { tenantId } = useParams()

  const { data: venues } = useGetVenuesQuery({
    params: { tenantId }, payload: {
      fields: ['name', 'switches', 'id'],
      sortField: 'name',
      sortOrder: 'ASC'
    }
  })

  const { formRef } = props
  const [venueSwitches, setVenueSwitches] = useState([] as any)
  const [selectedSwitchs, setSelectedSwitchs] = useState([] as any)
  const [getSwitchList] = useLazyGetSwitchListQuery()

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
    if (venues?.data) {
      setVenueSwitches(venues?.data
        .filter((v: any) => v.switches)
        .map((v: any) => ({ id: v.id }))
      )
    }
  }, [venues])

  const columns: TableProps<any>['columns'] = [
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
        display: 'block', marginBottom: '20px',
        color: cssStr('--acx-neutrals-60')
      }}>
        {<FormattedMessage
          defaultMessage={`
              <ul>
                <li>Select the venues or specific switches that will have this configuration applied onto them</li>
                <li>Only operational switches are displayed here</li>
              </ul>`}
          values={{
            ul: (text: string) => <ul>{text}</ul>,
            li: (text: string) => <li>{text}</li>
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
          const expandRow = venueSwitches?.filter((v: any) => v.id === expandRowKey)?.[0]
          console.log(expandRow)
          if (expandRow && !expandRow?.switches) {
            const list = (await getSwitchList({
              params: { tenantId: tenantId }, payload: getSwitchListPayload(expandRow.id)
            }, false
            )).data?.data || []

            const switches = venueSwitches.map((v: any) => {
              return v.id === expandRowKey
                ? { id: expandRowKey, switches: list }
                : v
            })

            setVenueSwitches(switches)
          }
        }}
      >
        {
          venues?.data?.map((v: any) => {
            return <Collapse.Panel
              header={<Space>
                {/* TODO */}
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
                isLoading: !getVenueSwitches(v.id, venueSwitches) /////
              }]}>
                <Table
                  rowKey='id'
                  rowSelection={{
                    type: 'checkbox', onChange: (keys: React.Key[], rows: any) => {
                      setSelectedSwitchs({ ...selectedSwitchs, [v.id]: keys })
                      formRef?.current?.setFieldValue('venueSwitches', {
                        ...selectedSwitchs,
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
  return venueSwitches.filter((venue: any) => venue.id === venueId)?.[0]?.switches
}