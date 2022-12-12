import React, { useRef, useState } from 'react'

import {
  Form,
  Input,
  List,
  Select,
  Switch,
  Typography
} from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import {
  Button,
  Drawer,
  Loader,
  PageHeader,
  StepsForm,
  StepsFormInstance,
  Subtitle,
  Table,
  TableProps
} from '@acx-ui/components'
import { useGetAccessSwitchesQuery, useVenuesListQuery } from '@acx-ui/rc/services'
import {
  AccessSwitch,
  useTableQuery,
  Venue,
  WebAuthTemplate
} from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { NetworkSegAuthSummary } from './NetworkSegAuthDetail'
import NetworkSegAuthFormContext from './NetworkSegAuthFormContext'
import * as UI                   from './styledComponents'

export const defaultTemplateData = {
  name: 'Default',
  id: 'xxx',
  webAuth_password_label: 'DPSK Password',
  webAuth_custom_title: 'Enter your Password below and press the button',
  webAuth_custom_top: 'Welcome to Ruckus Networks Web Authentication Homepage',
  webAuth_custom_login_button: 'Login',
  webAuth_custom_bottom: `This network is restricted to authorized users only.
    Violators may be subjected to legal prosecution.
    Acitvity on this network is monitored and may be used as evidence in a court of law.
    Copyright 2022 Ruckus Networks`,
  tag: ''
}

const venueMockData = [
  'Venue-1 (2 AS)',
  'Venue-2 (As-100)',
  'Venue-3 (5 AS)'
]

const defaultPayload = {
  fields: [
    'check-all', 'name', 'description', 'city', 'country', 'networks',
    'switches', 'switchClients', 'clients', 'cog', 'latitude', 'longitude', 'status', 'id'
  ],
  filters: {},
  sortField: 'name',
  sortOrder: 'ASC'
}

export default function NetworkSegAuthForm () {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const servicesPath = useTenantLink('/services')

  const editMode = params.action === 'edit'

  const formRef = useRef<StepsFormInstance<WebAuthTemplate>>()

  const [saveState, updateSaveState] = useState<WebAuthTemplate>(defaultTemplateData)

  const [currentVenue, setCurrentVenue] = useState<Venue>()

  const [visible, setVisible] = useState(false)
  const onClose = () => {
    setVisible(false)
  }

  const venuesQuery = useTableQuery({
    useQuery: useVenuesListQuery,
    defaultPayload
  })

  const asQuery = useTableQuery({
    useQuery: useGetAccessSwitchesQuery,
    apiParams: { venueId: currentVenue?.id || '' },
    defaultPayload: {
      fields: [
        'name', 'description', 'model', 'ds'
      ],
      filters: {},
      sortField: 'name',
      sortOrder: 'ASC'
    }
  })

  const updateSaveData = (saveData: Partial<WebAuthTemplate>) => {
    updateSaveState({ ...saveState, ...saveData })
  }

  const venueColumns: TableProps<Venue>['columns'] = React.useMemo(() => {
    return [{
      key: 'name',
      title: $t({ defaultMessage: 'Venue Name' }),
      dataIndex: 'name',
      sorter: true
    }, {
      key: 'city',
      title: $t({ defaultMessage: 'City' }),
      dataIndex: 'city',
      sorter: true,
      render: function (data, row) {
        return `${row.country}, ${row.city}`
      }
    }, {
      key: 'as',
      title: $t({ defaultMessage: 'Selected Access Switches' }),
      dataIndex: 'as',
      sorter: true,
      // align: 'center',
      render: function (data, row) {
        return data || 0
      }
    }]
  }, [$t])

  const rowActions: TableProps<Venue>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Select Access Switch' }),
      onClick: ([selectedRow]) => {
        setCurrentVenue(selectedRow)
        setVisible(true)
      }
    }
  ]

  const asColumns: TableProps<AccessSwitch>['columns'] = React.useMemo(() => {
    return [{
      key: 'name',
      title: $t({ defaultMessage: 'Access Switch' }),
      dataIndex: 'name',
      sorter: true
    }, {
      key: 'model',
      title: $t({ defaultMessage: 'Model' }),
      dataIndex: 'model',
      sorter: true
    }, {
      key: 'ds',
      title: $t({ defaultMessage: 'Dist. Switches' }),
      dataIndex: 'sd',
      sorter: true
    }, {
      key: 'activated',
      title: $t({ defaultMessage: 'Apply' }),
      dataIndex: ['activated', 'isActivated'],
      align: 'center',
      render: function (data, row) {
        return <Switch
          checked={Boolean(data)}
          onClick={(checked, event) => {
            // activateNetwork(checked, row)
            event.stopPropagation()
          }}
        />
      }
    }]
  }, [$t])

  const activateActions: TableProps<AccessSwitch>['rowActions'] = [{
    label: $t({ defaultMessage: 'Activate' }),
    onClick: ([{ id }], clearSelection) => {

    }
  }, {
    label: $t({ defaultMessage: 'Deactivate' }),
    onClick: ([{ id }], clearSelection) => {

    }
  }]

  const WebAuthFormItem = ({ name, label }:
    { name: keyof typeof defaultTemplateData, label: string }
  ) => {
    return (<UI.FormItemWithReset name={name} label={label} >
      <Input addonAfter={
        <Button type='link'
          onClick={()=>{
            formRef?.current?.setFieldsValue(_.pick(defaultTemplateData, name))
          }}>
          {$t({ defaultMessage: 'Reset to default' })}
        </Button>} />
    </UI.FormItemWithReset>)
  }

  return (
    <>
      <PageHeader
        title={editMode ?
          $t({ defaultMessage: 'Edit Network Segmentation Auth page for Switch' }) :
          $t({ defaultMessage: 'Add Network Segmentation Auth page for Switch' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Services' }), link: '/services' }
        ]}
      />
      <NetworkSegAuthFormContext.Provider value={{ editMode, saveState, updateSaveState }}>
        <StepsForm<WebAuthTemplate>
          formRef={formRef}
          editMode={editMode}
          onCancel={() => navigate(servicesPath)}
        >
          <StepsForm.StepForm
            name='settings'
            title={$t({ defaultMessage: 'Settings' })}
            layout='vertical'
            wrapperCol={{ span: 14 }}
            onFinish={async data => {
              updateSaveData(data)
              return true
            }} >
            <StepsForm.Title>
              {$t({ defaultMessage: 'Settings' })}</StepsForm.Title>
            <Form.Item name='name'
              label={$t({ defaultMessage: 'Name' })}
              wrapperCol={{ span: 8 }}
              rules={[{ required: true }]} >
              <Input />
            </Form.Item>
            <Form.Item name='tag'
              label={$t({ defaultMessage: 'Tags' })}
              wrapperCol={{ span: 8 }} >
              <Select mode='tags' size='middle' allowClear />
            </Form.Item>
            <Subtitle level={4}>
              {$t({ defaultMessage: 'Auth Page Details' })}</Subtitle>
            <WebAuthFormItem name='webAuth_custom_top'
              label={$t({ defaultMessage: 'Header' })} />
            <WebAuthFormItem name='webAuth_custom_title'
              label={$t({ defaultMessage: 'Title' })} />
            <WebAuthFormItem name='webAuth_password_label'
              label={$t({ defaultMessage: 'Password Label' })} />
            <WebAuthFormItem name='webAuth_custom_login_button'
              label={$t({ defaultMessage: 'Button Text' })} />
            <WebAuthFormItem name='webAuth_custom_bottom'
              label={$t({ defaultMessage: 'Footer' })} />
          </StepsForm.StepForm>
          <StepsForm.StepForm
            name='scope'
            title={$t({ defaultMessage: 'Scope' })}
            onFinish={async (data) => {
              updateSaveData(data)
              return true
            }}>
            <StepsForm.Title>
              {$t({ defaultMessage: 'Scope' })}</StepsForm.Title>
            <Typography.Paragraph>
              {$t({ defaultMessage: `
                Select the venues with network segmentation service enabled
                and Access Switches where the Network Segmentation Auth page
                for Switch will be applied:` })}</Typography.Paragraph>
            <Loader states={[venuesQuery]}>
              <Table
                columns={venueColumns}
                dataSource={venuesQuery.data?.data}
                pagination={venuesQuery.pagination}
                onChange={venuesQuery.handleTableChange}
                type='form'
                rowKey='id'
                rowActions={rowActions}
                rowSelection={{ type: 'radio' }}
              />
            </Loader>
            <Drawer
              title={$t(
                { defaultMessage: '{name}: Select Access Switches' },
                { name: currentVenue?.name }
              )}
              visible={visible}
              onClose={onClose}
              mask={true}
              destroyOnClose={true}
              width={700}
              footer={<Drawer.FormFooter
                onCancel={onClose}
                onSave={async () => {
                  try {
                    // await form.validateFields()
                    // form.submit()
                    onClose()
                  } catch (error) {
                    if (error instanceof Error) throw error
                  }
                }}
              />}>
              <Typography.Paragraph>{$t({ defaultMessage: `
              Select the Access Switches that the Network Segmentation Auth page for Switch Service
              will be applied to at venue "{name}".` }, { name: currentVenue?.name })}
              </Typography.Paragraph>
              <Table
                columns={asColumns}
                dataSource={asQuery.data?.data}
                pagination={asQuery.pagination}
                onChange={asQuery.handleTableChange}
                type='form'
                rowKey='id'
                rowActions={activateActions}
                rowSelection={{ type: 'checkbox' }}
              />
            </Drawer>
          </StepsForm.StepForm>

          {!editMode &&
          <StepsForm.StepForm name='summary' title={$t({ defaultMessage: 'Summary' })}>
            <StepsForm.Title>{ $t({ defaultMessage: 'Summary' }) }</StepsForm.Title>
            <Subtitle level={4}>
              { $t({ defaultMessage: 'Settings' }) }
            </Subtitle>
            <NetworkSegAuthSummary data={saveState} />
            <br />
            <Subtitle level={4}>
              { $t({ defaultMessage: 'Venues & Access Switches ({count})' }, { count: 0 }) }
            </Subtitle>
            <List
              size='small'
              dataSource={venueMockData}
              renderItem={item => <List.Item>{item}</List.Item>}
            />
          </StepsForm.StepForm>
          }
        </StepsForm>
      </NetworkSegAuthFormContext.Provider>
    </>
  )
}
