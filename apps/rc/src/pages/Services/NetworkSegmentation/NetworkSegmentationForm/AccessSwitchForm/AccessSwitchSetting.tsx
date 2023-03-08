import React, { useState, useEffect } from 'react'

import {
  Card,
  Col,
  Form,
  Input,
  Radio,
  Row,
  Select,
  Space,
  Typography } from 'antd'
import { useIntl } from 'react-intl'

import {
  Button,
  Drawer,
  StepsForm,
  Subtitle,
  Table,
  TableProps,
  Tooltip,
  useStepFormContext
} from '@acx-ui/components'
import { QuestionMarkCircleOutlined }   from '@acx-ui/icons'
import { isLAGMemberPort }              from '@acx-ui/rc/components'
import {
  useSwitchPortlistQuery,
  useGetSwitchVlanQuery,
  useLazyGetWebAuthTemplateQuery,
  useWebAuthTemplateListQuery,
  useGetLagListQuery,
  useValidateAccessSwitchInfoMutation
} from '@acx-ui/rc/services'
import { AccessSwitch, AccessSwitchSaveData, UplinkInfo, WebAuthTemplate } from '@acx-ui/rc/utils'
import { useParams }                                                       from '@acx-ui/react-router-dom'

import { NetworkSegmentationGroupForm } from '..'
import { defaultTemplateData }          from '../../../NetworkSegWebAuth/NetworkSegAuthForm'
import { useWatch }                     from '../../useWatch'


export default function AccessSwitchSetting () {
  const { $t } = useIntl()
  const { form } = useStepFormContext<NetworkSegmentationGroupForm>()

  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<AccessSwitch[]>()

  const accessSwitchInfos = useWatch('accessSwitchInfos', form)
  const venueId = useWatch('venueId', form)

  const onClose = () => {
    setOpen(false)
  }

  const onSave = (values: Partial<AccessSwitch>) => {
    if (!selected || !accessSwitchInfos) return

    const newList = accessSwitchInfos.map(as => {
      const isSelected = selected.map(item => item.id).includes(as.id)
      if (isSelected) {
        return { ...as, ...values }
      }
      return as
    })
    setSelected(undefined)
    setOpen(false)

    form.setFieldValue('accessSwitchInfos', newList)
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

  return (<>
    <StepsForm.Title>{$t({ defaultMessage: 'Access Switch Settings' })}</StepsForm.Title>
    <Typography.Paragraph>
      {$t({ defaultMessage: 'Set the configuration on these access switches:' })}
    </Typography.Paragraph>
    <Form.Item name='accessSwitchInfos' hidden />
    <AccessSwitchTable rowActions={rowActions}
      rowSelection={{ type: 'checkbox', selectedRowKeys: selected? selected.map(as=>as.id) : [] }}
      dataSource={accessSwitchInfos} />
    <AccessSwitchDrawer
      open={open}
      editRecords={selected}
      venueId={venueId}
      onClose={onClose}
      onSave={onSave} />
  </>)
}

function AccessSwitchDrawer (props: {
  open: boolean,
  editRecords?: AccessSwitch[],
  venueId: string,
  onClose: ()=>void
  onSave: (values: Partial<AccessSwitch>)=>void
}) {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const [form] = Form.useForm()

  const { open, editRecords, venueId, onClose, onSave } = props

  const switchId = editRecords && editRecords[0].id
  const editingWebAuthPageType = (editRecords && editRecords[0].webAuthPageType) || 'TEMPLATE'

  const [validateAccessSwitchInfo] = useValidateAccessSwitchInfoMutation()

  const [getWebAuthTemplate] = useLazyGetWebAuthTemplateQuery()
  const { vlanList } = useGetSwitchVlanQuery({ params: { tenantId, switchId }, payload: {
    page: 1, pageSize: 4096, sortField: 'vlanId', sortOrder: 'ASC'
  } }, {
    skip: !switchId,
    selectFromResult: ({ data }) => ({
      vlanList: [
        ...(data?.switchVlan || []),
        ...(data?.profileVlan || [])
      ].map(vlan => ({ label: vlan.vlanId, value: vlan.vlanId }))
    })
  })
  const { portList } = useSwitchPortlistQuery({ params: { tenantId }, payload: {
    filters: { switchId: editRecords?.map(rec => rec.id) }, page: 1, pageSize: 1000,
    sortField: 'portIdentifierFormatted', sortOrder: 'ASC'
  } }, {
    skip: !switchId,
    selectFromResult: ({ data }) => ({
      portList: data?.data?.map(port => ({
        label: port.portIdentifier,
        value: port.portIdentifier,
        disabled: isLAGMemberPort(port)
      }))
    })
  })
  const { lagList } = useGetLagListQuery({ params: { tenantId, switchId } }, {
    skip: !switchId,
    selectFromResult: ({ data }) => ({
      lagList: data?.map(lag => ({
        label: `${lag.lagId} (${lag.name})`,
        value: lag.lagId
      }))
    })
  })
  const { data: templateListResult } = useWebAuthTemplateListQuery({
    params: { tenantId },
    payload: {
      fields: [ 'name', 'id', 'webAuthPasswordLabel', 'webAuthCustomTitle',
        'webAuthCustomTop', 'webAuthCustomLoginButton', 'webAuthCustomBottom' ]
    }
  })
  const templateList = templateListResult?.data as WebAuthTemplate[]

  const [template, setTemplate] = useState<WebAuthTemplate>()

  const templateId = Form.useWatch('templateId', form)
  const webAuthPageType = Form.useWatch('webAuthPageType', form)
  const uplinkInfoType = Form.useWatch(['uplinkInfo', 'uplinkType'], form)

  useEffect(()=>{
    form.resetFields()
    form.setFieldValue('webAuthPageType', editingWebAuthPageType)
  }, [form, open])


  useEffect(()=>{
    if (templateId) {
      getWebAuthTemplate({
        params: { tenantId, serviceId: templateId }
      }, true).unwrap()
        .then((templateRes)=>{
          setTemplate(templateRes)
        })
        .catch(()=>{})
    } else {
      setTemplate(undefined)
    }
  }, [templateId, tenantId])

  useEffect(()=>{
    if (webAuthPageType === 'USER_DEFINED') {
      form.setFieldValue('templateId', '')
    }
  }, [webAuthPageType])

  const UplinkRadio = (props: {
    value: UplinkInfo['uplinkType'],
    options?: { value?: string | number, label?: string }[]
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
          { uplinkInfoType === radioValue && <Form.Item name={['uplinkInfo', 'uplinkId']} noStyle>
            <Select options={options}
              placeholder={$t({ defaultMessage: 'Select ...' })}
              style={{ width: '180px' }}/>
          </Form.Item> }
        </Space>
      </Radio>)
  }

  const uplinkTypeChangeHandler = () => {
    form.setFieldValue(['uplinkInfo', 'uplinkId'], null)
  }

  return (
    <Drawer
      title={$t(
        { defaultMessage: 'Edit Access Switch: {name}' },
        { name: editRecords?.map(as=>as.name).join(', ') }
      )}
      visible={open}
      mask={true}
      onClose={onClose}
      destroyOnClose={true}
      width={480}
      footer={<Drawer.FormFooter
        onCancel={onClose}
        onSave={async () => {
          const values: AccessSwitchSaveData = form.getFieldsValue()
          try {
            await validateAccessSwitchInfo({
              params: { tenantId, venueId },
              payload: values
            }).unwrap()
            form.submit()
          } catch (error) {
            console.log(error) // eslint-disable-line no-console
          }
        }}
      />}>
      <Form layout='vertical'
        form={form}
        onFinish={onSave}
        initialValues={editRecords ? editRecords[0] : {}} >

        <Form.Item name='id' hidden />
        <Form.Item name='distributionSwitchId' hidden />

        <Form.Item label={$t({ defaultMessage: 'Uplink Port' })} >
          <Form.Item name={['uplinkInfo', 'uplinkType']} noStyle>
            <Radio.Group onChange={uplinkTypeChangeHandler}>
              <Space direction='vertical'>
                <UplinkRadio value='PORT' options={portList}/>
                <UplinkRadio value='LAG' options={lagList}/>
              </Space>
            </Radio.Group>
          </Form.Item>
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
          <Select options={vlanList}
            placeholder={$t({ defaultMessage: 'Select ...' })} />
        </Form.Item>

        <Form.Item name='webAuthPageType' hidden />

        <Row justify='space-between'>
          <Col>
            <Subtitle level={4}>
              { $t({ defaultMessage: 'Net Seg Auth page' }) }
            </Subtitle>
          </Col>
          <Col>{ webAuthPageType === 'USER_DEFINED' ?
            <Button type='link' onClick={()=>form.setFieldValue('webAuthPageType', 'TEMPLATE')}>
              {$t({ defaultMessage: 'Select Auth Template' })}
            </Button> :
            <Button type='link' onClick={()=>form.setFieldValue('webAuthPageType', 'USER_DEFINED')}>
              {$t({ defaultMessage: 'Customize' })}
            </Button>
          }
          </Col>
        </Row>

        <Form.Item name='templateId'
          wrapperCol={{ span: 10 }}
          hidden={webAuthPageType === 'USER_DEFINED'}>
          <Select
            placeholder={$t({ defaultMessage: 'Select Template ...' })}
            options={templateList?.map(t => ({
              value: t.id, label: t.name
            }))} />
        </Form.Item>

        { webAuthPageType === 'USER_DEFINED' ? (<>
          <Form.Item name='webAuthCustomTop'
            label={$t({ defaultMessage: 'Header' })} >
            <Input.TextArea autoSize placeholder={$t(defaultTemplateData['webAuthCustomTop'])}/>
          </Form.Item>
          <Form.Item name='webAuthCustomTitle'
            label={$t({ defaultMessage: 'Title' })} >
            <Input.TextArea autoSize placeholder={$t(defaultTemplateData['webAuthCustomTitle'])}/>
          </Form.Item>
          <Form.Item name='webAuthPasswordLabel'
            label={$t({ defaultMessage: 'Password Label' })} >
            <Input.TextArea autoSize placeholder={$t(defaultTemplateData['webAuthPasswordLabel'])}/>
          </Form.Item>
          <Form.Item name='webAuthCustomLoginButton'
            label={$t({ defaultMessage: 'Button Text' })} >
            <Input.TextArea autoSize
              placeholder={$t(defaultTemplateData['webAuthCustomLoginButton'])}/>
          </Form.Item>
          <Form.Item name='webAuthCustomBottom'
            label={$t({ defaultMessage: 'Footer' })} >
            <Input.TextArea autoSize placeholder={$t(defaultTemplateData['webAuthCustomBottom'])}/>
          </Form.Item>
        </>) : (<Card>
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
        </Card>)}
      </Form>
    </Drawer>
  )
}

export function AccessSwitchTable (props: {
  rowSelection?: TableProps<AccessSwitch>['rowSelection'],
  rowActions?: TableProps<AccessSwitch>['rowActions'],
  type?: TableProps<AccessSwitch>['type'],
  dataSource: AccessSwitch[]
}) {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const { form } = useStepFormContext<NetworkSegmentationGroupForm>()


  const distributionSwitchInfos = useWatch('distributionSwitchInfos', form)

  const { data: templateListResult } = useWebAuthTemplateListQuery({
    params: { tenantId },
    payload: {
      fields: [ 'name', 'id' ]
    }
  })

  const columns: TableProps<AccessSwitch>['columns'] = [{
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
    defaultSortOrder: 'ascend',
    render: (data, row) => {
      const dsId = row.distributionSwitchId
      return distributionSwitchInfos?.find(ds=>ds.id===dsId)?.name || dsId
    }
  }, {
    key: 'uplinkInfo',
    title: $t({ defaultMessage: 'Uplink Port' }),
    dataIndex: ['uplinkInfo', 'uplinkId'],
    sorter: true,
    render: (data, row) => {
      return row.uplinkInfo ? `${row.uplinkInfo.uplinkType} ${data}` : ''
    }
  }, {
    key: 'vlanId',
    title: $t({ defaultMessage: 'VLAN ID' }),
    dataIndex: 'vlanId',
    sorter: true
  }, {
    key: 'templateId',
    title: $t({ defaultMessage: 'Net Seg Auth Page' }),
    dataIndex: 'templateId',
    sorter: true,
    render: (data, row) => {
      if (row.webAuthPageType === 'USER_DEFINED') {
        return $t({ defaultMessage: 'custom' })
      }
      return templateListResult?.data.find(tp=>tp.id===row.templateId)?.name || data
    }
  }]

  return (
    <Table
      columns={columns}
      rowKey='id'
      {...props} />
  )
}
