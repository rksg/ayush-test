import { useState, useEffect } from 'react'

import { Col, Collapse, Form, Input, Row, Space, Switch, Typography } from 'antd'
import { useIntl, FormattedMessage }                                  from 'react-intl'

import { cssStr, StepsForm, Table, TableProps, Loader, useStepFormContext } from '@acx-ui/components'
import { PlusSquareOutlined, MinusSquareOutlined }                          from '@acx-ui/icons'
import { useGetVenuesQuery, useLazyGetSwitchListQuery }                     from '@acx-ui/rc/services'
import { ApplySwitch, CliTemplateVenueSwitches, SwitchViewModel }           from '@acx-ui/rc/utils'
import { useParams }                                                        from '@acx-ui/react-router-dom'
import { hasAccess }                                                        from '@acx-ui/user'

import * as UI from './styledComponents'

export function CliStepSwitches () {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const { form, editMode } = useStepFormContext()

  const { data: venues } = useGetVenuesQuery({
    params: { tenantId }, payload: {
      fields: ['name', 'id', 'operationalSwitches'],
      pageSize: 9999,
      sortField: 'name',
      sortOrder: 'ASC'
    }
  })

  const [venueSwitches, setVenueSwitches] = useState([] as CliTemplateVenueSwitches[])
  const [selectedSwitches, setSelectedSwitches] = useState([] as Map<React.Key, React.Key[]>[])
  const [getSwitchList] = useLazyGetSwitchListQuery()
  const [applySwitches, setApplySwitches] = useState({} as Record<string, ApplySwitch[]>)

  const getSwitchListPayload = (venueId: string) => ({
    fields: [
      'check-all', 'name', 'id', 'serialNumber', 'isStack', 'formStacking',
      'venueId', 'switchName', 'model', 'uptime', 'configReady',
      'syncedSwitchConfig', 'operationalWarning', 'venueName'
    ],
    pageSize: 9999,
    filters: {
      venueId: [venueId],
      deviceStatus: ['ONLINE'],
      syncedSwitchConfig: [true],
      configReady: [true]
    }
  })

  useEffect(() => {
    const selected = form.getFieldValue('venueSwitches')
    setSelectedSwitches(selected)
  }, [])

  useEffect(() => {
    if (venues?.data) {
      const switches = venues?.data.filter((v) => v.operationalSwitches)
        .map((v) => ({ id: v.id })) as CliTemplateVenueSwitches[]
      setVenueSwitches(switches)
    }
  }, [venues])

  const checkToggleDisabled = (selectedSwitches: Map<React.Key, React.Key[]>[]) => {
    return !Object.values(selectedSwitches ?? {}).flat().length
  }

  const columns: TableProps<SwitchViewModel>['columns'] = [{
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
  }]

  return <Row gutter={24}>
    <Col span={18}>
      <StepsForm.Title children={$t({ defaultMessage: 'Switches' })} />
      <Typography.Text style={{
        display: 'block', marginBottom: '15px', fontSize: '14px',
        color: cssStr('--acx-primary-black')
      }}>
        {<FormattedMessage
          defaultMessage={`
          - Select the venues or specific switches that will have this
          configuration applied onto them<br></br>
          - Only operational switches are displayed here`}
          values={{
            br: () => <br />
          }}
        />}
      </Typography.Text>

      <Form.Item
        children={<>
          <Form.Item
            noStyle
            name='applyNow'
            valuePropName='checked'
            children={<Switch disabled={checkToggleDisabled(selectedSwitches)} />}
          />
          <Typography.Text style={{ fontSize: '12px' }}>
            {$t({ defaultMessage: 'Apply the CLI template after {action} it' }, {
              action: editMode ? $t({ defaultMessage: 'saving' }) : $t({ defaultMessage: 'adding' })
            })}
          </Typography.Text>
        </>}
      />

      <Form.Item
        hidden={true}
        name='venueSwitches'
        children={<Input />}
      />
      <Form.Item
        hidden={true}
        name='applySwitches'
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

            const switches = venueSwitches.map(v =>
              v.id === expandRowKey ? { id: expandRowKey, switches: list } : v
            )

            setVenueSwitches(switches as CliTemplateVenueSwitches[])
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
                <Space>{v?.operationalSwitches ?? 0}{$t({ defaultMessage: 'Switches' })}</Space>
              </Space>}
              collapsible={v?.operationalSwitches ? 'header' : 'disabled'}
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
                      && { selectedRowKeys: (
                        (selectedSwitches)?.[v?.id as unknown as number] ?? []
                        ) as unknown as React.Key[]
                      }
                    ),
                    onChange: (keys: React.Key[], rows) => {
                      const venueSwitch = { ...selectedSwitches, [v.id as React.Key]: keys }
                      const applySwitch = {
                        ...applySwitches,
                        [v.id]: rows.map((s) => ({
                          id: s.id, name: s.switchName, venueName: v?.name
                        }))
                      }

                      setApplySwitches?.(applySwitch)
                      setSelectedSwitches(venueSwitch)
                      form?.setFieldsValue({
                        venueSwitches: venueSwitch,
                        applySwitch: applySwitch
                      })

                      if (checkToggleDisabled(venueSwitch)) {
                        form?.setFieldValue('applyNow', false)
                      }
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

function getVenueSwitches (venueId: string, venueSwitches: CliTemplateVenueSwitches[]) {
  return (
    venueSwitches.filter((venue) => venue.id === venueId)?.[0]?.switches ?? null
  ) as unknown as SwitchViewModel[]
}
