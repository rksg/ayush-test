import React, { useState, useEffect } from 'react'

import {
  Card,
  Checkbox,
  Col,
  Form,
  Input,
  Radio,
  Row,
  Select,
  Space
} from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import {
  Button,
  Drawer, Subtitle, Tooltip
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

import { defaultTemplateData } from '../../../NetworkSegWebAuth/NetworkSegAuthForm'

export function AccessSwitchDrawer (props: {
  open: boolean;
  editRecords: AccessSwitch[];
  venueId: string;
  onClose?: () => void;
  onSave?: (values: Partial<AccessSwitchSaveData>) => void;
}) {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const [form] = Form.useForm()

  const { open, editRecords, venueId, onClose = ()=>{}, onSave } = props

  const isMultipleEdit = editRecords.length > 1

  const switchId = (editRecords.length === 1 && editRecords[0].id) || undefined
  const editingWebAuthPageType =
    (editRecords.length === 1 && editRecords[0].webAuthPageType) || 'TEMPLATE'

  const [validateAccessSwitchInfo] = useValidateAccessSwitchInfoMutation()
  const [getWebAuthTemplate] = useLazyGetWebAuthTemplateQuery()

  const { vlanList } = useGetSwitchVlanQuery({
    params: { tenantId, switchId }, payload: {
      page: 1, pageSize: 4096, sortField: 'vlanId', sortOrder: 'ASC'
    }
  }, {
    skip: isMultipleEdit || !switchId,
    selectFromResult: ({ data }) => ({
      vlanList: [
        ...(data?.switchVlan || []),
        ...(data?.profileVlan || [])
      ].map(vlan => ({ label: vlan.vlanId, value: vlan.vlanId }))
    })
  })
  const { portList } = useSwitchPortlistQuery({
    params: { tenantId }, payload: {
      filters: { switchMac: editRecords.map(rec => rec.id) }, page: 1, pageSize: 1000,
      sortField: 'portIdentifierFormatted', sortOrder: 'ASC',
      fields: ['portIdentifier', 'lagId', 'switchMac']
    }
  }, {
    skip: editRecords.length === 0,
    selectFromResult: ({ data }) => ({
      portList: _.uniqWith(data?.data?.map(port => ({
        label: port.portIdentifier,
        value: port.portIdentifier,
        disabled: isLAGMemberPort(port)
      })), _.isEqual)
    })
  })
  const { lagList } = useGetLagListQuery({ params: { tenantId, switchId } }, {
    skip: isMultipleEdit || !switchId,
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
      fields: ['name', 'id', 'webAuthPasswordLabel', 'webAuthCustomTitle',
        'webAuthCustomTop', 'webAuthCustomLoginButton', 'webAuthCustomBottom']
    }
  })
  const templateList = templateListResult?.data as WebAuthTemplate[]

  const [template, setTemplate] = useState<WebAuthTemplate>()
  const [uplinkInfoOverwrite, setUplinkInfoOverwrite] = useState(false)
  const [vlanIdOverwrite, setVlanIdOverwrite] = useState(false)
  const [webAuthPageOverwrite, setWebAuthPageOverwrite] = useState(false)

  const templateId = Form.useWatch('templateId', form)
  const webAuthPageType = Form.useWatch('webAuthPageType', form)
  const uplinkInfoType = Form.useWatch(['uplinkInfo', 'uplinkType'], form)

  useEffect(() => {
    form.resetFields()
    form.setFieldValue('webAuthPageType', editingWebAuthPageType)
    setUplinkInfoOverwrite(false)
    setVlanIdOverwrite(false)
    setWebAuthPageOverwrite(false)
  }, [form, open, editingWebAuthPageType])


  useEffect(() => {
    if (templateId) {
      getWebAuthTemplate({
        params: { tenantId, serviceId: templateId }
      }, true).unwrap()
        .then((templateRes) => {
          setTemplate(templateRes)
          form.setFieldsValue(_.omit(templateRes, ['id', 'name', 'tag']))
        })
        .catch(() => { })
    } else {
      setTemplate(undefined)
    }
  }, [templateId, tenantId])

  useEffect(() => {
    if (webAuthPageType === 'USER_DEFINED') {
      form.setFieldValue('templateId', '')
    }
  }, [webAuthPageType])

  const uplinkTypeMap = {
    PORT: $t({ defaultMessage: 'Port' }),
    LAG: $t({ defaultMessage: 'LAG' })
  }

  const UplinkRadio = (props: {
    value: UplinkInfo['uplinkType'];
    options?: { value?: string | number; label?: string; }[];
  }) => {
    const { value: radioValue, options } = props
    return (
      <Radio value={radioValue}>
        <Space size='middle' style={{ height: '32px' }}>
          {uplinkTypeMap[radioValue]}
          {uplinkInfoType === radioValue && <Form.Item name={['uplinkInfo', 'uplinkId']} noStyle>
            {!options ?
              <Input disabled={isMultipleEdit && !uplinkInfoOverwrite}
                style={{ width: '180px' }} /> :
              <Select options={options}
                disabled={isMultipleEdit && !uplinkInfoOverwrite}
                placeholder={$t({ defaultMessage: 'Select ...' })}
                style={{ width: '180px' }} />
            }
          </Form.Item>}
        </Space>
      </Radio>)
  }

  const uplinkTypeChangeHandler = () => {
    form.setFieldValue(['uplinkInfo', 'uplinkId'], null)
  }

  const beforeSave = async () => {
    const values: AccessSwitchSaveData = form.getFieldsValue()
    try {
      if (!isMultipleEdit) {
        await validateAccessSwitchInfo({
          params: { tenantId, venueId },
          payload: values
        }).unwrap()
      }
      form.submit()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const saveHandler = (values: AccessSwitchSaveData) => {
    let data: Partial<AccessSwitchSaveData> = isMultipleEdit ? {
      ..._.omit(values, ['uplinkInfo', 'vlanId', 'templateId', 'webAuthPageType']),
      ...uplinkInfoOverwrite ? { uplinkInfo: values.uplinkInfo } : {},
      ...vlanIdOverwrite ? { vlanId: values.vlanId } : {},
      ...webAuthPageOverwrite ? {
        templateId: values.templateId,
        webAuthPageType: values.webAuthPageType } : {}
    } : values
    if (isMultipleEdit && !webAuthPageOverwrite) {
      data = _.omit(data, Object.keys(defaultTemplateData))
    }
    onSave && onSave(data)
  }

  return (
    <Drawer
      title={$t(
        { defaultMessage: 'Edit Access Switch: {name}' },
        { name: editRecords.map(as => as.name).join(', ') }
      )}
      visible={open}
      mask={true}
      onClose={onClose}
      destroyOnClose={true}
      width={480}
      footer={<Drawer.FormFooter
        onCancel={onClose}
        onSave={beforeSave} />}>
      <Form layout='vertical'
        form={form}
        onFinish={saveHandler}
        initialValues={!isMultipleEdit ? editRecords[0] : {}}>

        { !isMultipleEdit && <Form.Item name='id' hidden children={<Input />} /> }
        { !isMultipleEdit && <Form.Item name='distributionSwitchId' hidden children={<Input />} />}

        { isMultipleEdit ?
          <><Form.Item>
            <Checkbox onChange={(e)=>setUplinkInfoOverwrite(e.target.checked)}>
              {$t({ defaultMessage: 'Uplink Port' })}
            </Checkbox>
          </Form.Item>
          <Form.Item name={['uplinkInfo', 'uplinkType']} noStyle>
            <Radio.Group onChange={uplinkTypeChangeHandler}
              disabled={isMultipleEdit && !uplinkInfoOverwrite}>
              <Space direction='vertical'>
                <UplinkRadio value='PORT' options={portList} />
                <UplinkRadio value='LAG' options={lagList} />
              </Space>
            </Radio.Group>
          </Form.Item></>:
          <Form.Item label={$t({ defaultMessage: 'Uplink Port' })}>
            <Form.Item name={['uplinkInfo', 'uplinkType']} noStyle>
              <Radio.Group onChange={uplinkTypeChangeHandler}>
                <Space direction='vertical'>
                  <UplinkRadio value='PORT' options={portList} />
                  <UplinkRadio value='LAG' options={lagList} />
                </Space>
              </Radio.Group>
            </Form.Item>
          </Form.Item>
        }
        { isMultipleEdit ?
          <><Form.Item>
            <Checkbox onChange={(e)=>setVlanIdOverwrite(e.target.checked)}>
              {<>{$t({ defaultMessage: 'VLAN ID' })}
                <Tooltip
                  title={$t({ defaultMessage: 'The VLAN for Net Seg Auth page' })}
                  placement='right'><QuestionMarkCircleOutlined />
                </Tooltip>
              </>}
            </Checkbox>
          </Form.Item>
          <Form.Item name='vlanId'
            wrapperCol={{ span: 10 }}
            rules={[{ required: vlanIdOverwrite }]}>
            <Input disabled={isMultipleEdit && !vlanIdOverwrite} />
          </Form.Item></>:
          <Form.Item name='vlanId'
            label={<>
              {$t({ defaultMessage: 'VLAN ID' })}
              <Tooltip
                title={$t({ defaultMessage: 'The VLAN for Net Seg Auth page' })}
                placement='right'><QuestionMarkCircleOutlined />
              </Tooltip></>}
            wrapperCol={{ span: 10 }}
            rules={[{ required: true }]}>
            <Select options={vlanList}
              placeholder={$t({ defaultMessage: 'Select ...' })} />
          </Form.Item>
        }
        <Form.Item name='webAuthPageType' hidden children={<Input />} />

        <Row justify='space-between'>
          <Col>
            { isMultipleEdit ?
              <Form.Item>
                <Checkbox onChange={(e)=>setWebAuthPageOverwrite(e.target.checked)}>
                  <Subtitle level={4}>{$t({ defaultMessage: 'Net Seg Auth page' })}</Subtitle>
                </Checkbox>
              </Form.Item>:
              <Subtitle level={4}>
                {$t({ defaultMessage: 'Net Seg Auth page' })}
              </Subtitle>
            }
          </Col>
          <Col>{webAuthPageType === 'USER_DEFINED' ?
            <Button type='link'
              disabled={isMultipleEdit && !webAuthPageOverwrite}
              onClick={()=>form.setFieldValue('webAuthPageType', 'TEMPLATE')}>
              {$t({ defaultMessage: 'Select Auth Template' })}
            </Button> :
            <Button type='link'
              disabled={isMultipleEdit && !webAuthPageOverwrite}
              onClick={()=>form.setFieldValue('webAuthPageType', 'USER_DEFINED')}>
              {$t({ defaultMessage: 'Customize' })}
            </Button>}
          </Col>
        </Row>

        <Form.Item name='templateId'
          wrapperCol={{ span: 10 }}
          hidden={webAuthPageType === 'USER_DEFINED'}>
          <Select
            placeholder={$t({ defaultMessage: 'Select Template ...' })}
            disabled={isMultipleEdit && !webAuthPageOverwrite}
            options={templateList?.map(t => ({
              value: t.id, label: t.name
            }))} />
        </Form.Item>

        {webAuthPageType === 'USER_DEFINED' ? (<>
          {
            Object.keys(defaultTemplateData).map(name=>{
              const item = defaultTemplateData[name as keyof typeof defaultTemplateData]
              return (<Form.Item name={name} label={$t(item.label)} key={name}>
                <Input.TextArea autoSize
                  disabled={isMultipleEdit && !webAuthPageOverwrite}
                  placeholder={$t(item.defaultMessage, {
                    year: new Date().getFullYear()
                  })} />
              </Form.Item>)
            })
          }
        </>) : (<Card>
          {
            (Object.keys(defaultTemplateData) as (keyof typeof defaultTemplateData)[])
              .map(name=>{
                const item = defaultTemplateData[name]
                return (<Form.Item name={name} label={$t(item.label)} key={name}>
                  <p>{template?.[name]}</p>
                </Form.Item>)
              })
          }
        </Card>)}
      </Form>
    </Drawer>
  )
}
