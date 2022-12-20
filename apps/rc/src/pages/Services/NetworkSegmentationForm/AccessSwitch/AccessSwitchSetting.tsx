import React, { useContext, useState, useEffect } from 'react'

import {
  Card,
  Col,
  Divider,
  Form,
  Input,
  Radio,
  Row,
  Select,
  Space,
  Typography } from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import {
  Button,
  Drawer,
  Loader,
  StepsForm,
  Subtitle,
  Table,
  TableProps,
  Tooltip
} from '@acx-ui/components'
import { QuestionMarkCircleOutlined } from '@acx-ui/icons'
import {
  useGetAccessSwitchesQuery,
  useLazyGetWebAuthTemplateQuery,
  useWebAuthTemplateListQuery
} from '@acx-ui/rc/services'
import { AccessSwitch, useTableQuery, WebAuthTemplate } from '@acx-ui/rc/utils'
import { useParams }                                    from '@acx-ui/react-router-dom'

import { defaultTemplateData }        from '../../NetworkSegWebAuth/NetworkSegAuthForm'
import NetworkSegmentationFormContext from '../NetworkSegmentationFormContext'



export default function AccessSwitchSetting () {
  const { $t } = useIntl()

  const { saveState } = useContext(NetworkSegmentationFormContext)

  return (<>
    <StepsForm.Title>{$t({ defaultMessage: 'Access Switch Settings' })}</StepsForm.Title>
    <Typography.Paragraph>
      {$t({ defaultMessage: 'Set the configuration on these access switches:' })}
    </Typography.Paragraph>
    <AccessSwitchTable />
  </>)
}

function AccessSwitchDrawer (props: {
  open: boolean,
  editRecords?: AccessSwitch[],
  onClose: ()=>void
}) {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const [form] = Form.useForm()

  const venueId = ':venueId'

  const { open, editRecords, onClose } = props

  const [getWebAuthTemplate] = useLazyGetWebAuthTemplateQuery()
  const { data: vlanList } = useGetAccessSwitchesQuery({ params: { tenantId, venueId } }) // TODO
  const { data: portList } = useGetAccessSwitchesQuery({ params: { tenantId, venueId } }) // TODO
  const { data: lagList } = useGetAccessSwitchesQuery({ params: { tenantId, venueId } }) // TODO
  const { data: templateListResult } = useWebAuthTemplateListQuery({
    params: { tenantId },
    payload: {
      fields: [ 'name', 'id', 'webAuthPasswordLabel', 'webAuthCustomTitle',
        'webAuthCustomTop', 'webAuthCustomLoginButton', 'webAuthCustomBottom' ]
    }
  })
  const templateList = templateListResult?.data as WebAuthTemplate[]

  const [isCustomize, setIsCustomize] = useState(false)
  const [template, setTemplate] = useState<WebAuthTemplate>()

  const templateId = Form.useWatch('templateId', form)
  const uplinkInfoType = Form.useWatch('uplinkInfoType', form)


  useEffect(()=>{
    if (templateId) {
      getWebAuthTemplate({
        params: { tenantId, serviceId: templateId }
      }, true).unwrap()
        .then((templateRes)=>{
          setTemplate(templateRes)
        })
        .catch(()=>{})
    }
  }, [templateId, tenantId])

  const UplinkRadio = (props: {
    value: AccessSwitch['uplinkInfo']['uplinkType'],
    options?: { id: string, name: string }[]
  }) => {
    const { value: radioValue, options } = props
    const uplinkTypeMap = {
      PORT: $t({ defaultMessage: 'Port' }),
      LAG: $t({ defaultMessage: 'LAG' })
    }
    return (
      <Radio value={radioValue}>
        <Space size='middle' style={{ height: '32px' }}>
          { uplinkTypeMap[radioValue] }
          { uplinkInfoType === radioValue && <Form.Item name='uplinkId' noStyle>
            <Select options={options?.map(d => ({ value: d.id, label: d.name }))}
              placeholder={$t({ defaultMessage: 'Select ...' })}
              style={{ width: '180px' }}/>
          </Form.Item> }
        </Space>
      </Radio>)
  }

  return (
    <Drawer
      title={$t(
        { defaultMessage: 'Edit Access Switch: {name}' },
        { name: editRecords?.map(as=>as.name).join(', ') }
      )}
      visible={open}
      onClose={onClose}
      destroyOnClose={true}
      width={700}
      footer={<Drawer.FormFooter
        onCancel={onClose}
        onSave={async () => {
          try {
            await form.validateFields()
            form.submit()
            onClose()
          } catch (error) {
            if (error instanceof Error) throw error
          }
        }}
      />}>
      <Form layout='vertical' form={form}>
        <Form.Item name='uplinkInfoType'
          label={$t({ defaultMessage: 'Uplink Port' })} >
          <Radio.Group>
            <Space direction='vertical'>
              <UplinkRadio value='PORT' options={portList?.data}/>
              <UplinkRadio value='LAG' options={lagList?.data}/>
            </Space>
          </Radio.Group>
        </Form.Item>
        <Form.Item name='vlanId'
          label={<>
            {$t({ defaultMessage: 'VLAN ID' })}
            <Tooltip
              title={$t({ defaultMessage: 'The VLAN for Net Seg Auth page' })}
              placement='right' ><QuestionMarkCircleOutlined />
            </Tooltip></>}
          wrapperCol={{ span: 10 }}
          rules={[{ required: true }]} >
          <Select options={vlanList?.data}
            placeholder={$t({ defaultMessage: 'Select ...' })} />
        </Form.Item>
        <Row justify='space-between'>
          <Col>
            <Subtitle level={4}>
              { $t({ defaultMessage: 'Net Seg Auth page' }) }
            </Subtitle>
          </Col>
          <Col>{ isCustomize ?
            <span>
              <Button type='link' onClick={()=>{/*TODO*/}}>Save as Template</Button>
              <Divider type='vertical' />
              <Button type='link' onClick={()=>setIsCustomize(false)}>Select Auth Template</Button>
            </span> :
            <Button type='link' onClick={()=>setIsCustomize(true)}>Customize</Button>
          }
          </Col>
        </Row>

        { isCustomize ? (<>
          <Form.Item name='webAuthCustomTop'
            label={$t({ defaultMessage: 'Header' })} >
            <Input.TextArea autoSize placeholder={defaultTemplateData['webAuthCustomTop']}/>
          </Form.Item>
          <Form.Item name='webAuthCustomTitle'
            label={$t({ defaultMessage: 'Title' })} >
            <Input.TextArea autoSize placeholder={defaultTemplateData['webAuthCustomTitle']}/>
          </Form.Item>
          <Form.Item name='webAuthPasswordLabel'
            label={$t({ defaultMessage: 'Password Label' })} >
            <Input.TextArea autoSize placeholder={defaultTemplateData['webAuthPasswordLabel']}/>
          </Form.Item>
          <Form.Item name='webAuthCustomLoginButton'
            label={$t({ defaultMessage: 'Button Text' })} >
            <Input.TextArea autoSize placeholder={defaultTemplateData['webAuthCustomLoginButton']}/>
          </Form.Item>
          <Form.Item name='webAuthCustomBottom'
            label={$t({ defaultMessage: 'Footer' })} >
            <Input.TextArea autoSize placeholder={defaultTemplateData['webAuthCustomBottom']}/>
          </Form.Item>
        </>) : (<>
          <Form.Item name='templateId' wrapperCol={{ span: 10 }}>
            <Select
              placeholder={$t({ defaultMessage: 'Select Template ...' })}
              // defaultValue={templateList[0]?.id}
              options={templateList?.map(t => ({
                value: t.id, label: t.name
              }))} />
          </Form.Item>
          <Card>
            <Form.Item
              label={$t({ defaultMessage: 'Header' })} >
              <p>{template?.webAuthCustomTop}</p>
            </Form.Item>
            <Form.Item
              label={$t({ defaultMessage: 'Title' })} >
              <p>{template?.webAuthCustomTitle}</p>
            </Form.Item>
            <Form.Item
              label={$t({ defaultMessage: 'Password Label' })} >
              <p>{template?.webAuthPasswordLabel}</p>
            </Form.Item>
            <Form.Item
              label={$t({ defaultMessage: 'Button Text' })} >
              <p>{template?.webAuthCustomLoginButton}</p>
            </Form.Item>
            <Form.Item
              label={$t({ defaultMessage: 'Footer' })} >
              <p>{template?.webAuthCustomBottom}</p>
            </Form.Item>
          </Card>
        </>)}
      </Form>
    </Drawer>
  )
}

function AccessSwitchTable () {
  const { $t } = useIntl()
  const tableQuery = useTableQuery({
    useQuery: useGetAccessSwitchesQuery,
    defaultPayload: {
      searchString: '',
      fields: [
        'name', 'model', 'distributionSwitchId', 'uplinkInfo', 'vlanId', 'templateId'
      ]
    }
  })

  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<AccessSwitch[]>()

  const onClose = () => {
    setOpen(false)
  }

  const rowActions: TableProps<AccessSwitch>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        setSelected(selectedRows)
        setOpen(true)
      }
    }
  ]

  const columns: TableProps<AccessSwitch>['columns'] = React.useMemo(() => {
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
      key: 'distributionSwitchId',
      title: $t({ defaultMessage: 'Dist. Switch' }),
      dataIndex: 'distributionSwitchId',
      sorter: true,
      defaultSortOrder: 'ascend'
    }, {
      key: 'uplinkInfo',
      title: $t({ defaultMessage: 'Uplink Port' }),
      dataIndex: ['uplinkInfo', 'uplinkId'],
      sorter: true
    }, {
      key: 'vlanId',
      title: $t({ defaultMessage: 'VLAN ID' }),
      dataIndex: 'vlanId',
      sorter: true
    }, {
      key: 'templateId',
      title: $t({ defaultMessage: 'Net Seg Auth Page' }),
      dataIndex: 'templateId',
      sorter: true
    }]
  }, [$t])
  return (<>
    <Loader states={tableQuery.error ? [] : [tableQuery]}>
      <Table
        columns={columns}
        dataSource={tableQuery.data?.data || [{
          id: 'xxx',
          name: 'xxx',
          vlanId: 11,
          model: 'xxxx',
          distributionSwitchId: '123',
          uplinkInfo: {
            uplinkType: 'PORT',
            uplinkId: '1/2/3'
          }
        }]}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowKey='id'
        rowActions={rowActions}
        rowSelection={{ type: 'checkbox' }} />
    </Loader>
    <AccessSwitchDrawer open={open} editRecords={selected} onClose={onClose} />
  </>)
}