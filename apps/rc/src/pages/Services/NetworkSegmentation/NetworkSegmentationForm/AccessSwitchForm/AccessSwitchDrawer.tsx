import React, { useState, useEffect } from 'react'

import {
  Card, Checkbox, Col,
  Form, Input, InputNumber,
  Radio, Row, Select, Space
} from 'antd'
import { DefaultOptionType } from 'antd/lib/select'
import _                     from 'lodash'
import { useIntl }           from 'react-intl'

import {
  Button, Drawer, Subtitle, Tooltip
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
import {
  AccessSwitch,
  AccessSwitchSaveData,
  validateVlanName,
  UplinkInfo,
  WebAuthTemplate,
  defaultTemplateData,
  getWebAuthLabelValidator,
  defaultWebAuthTemplateId
} from '@acx-ui/rc/utils'
import { useParams }          from '@acx-ui/react-router-dom'
import { validationMessages } from '@acx-ui/utils'

import { NetworkSegAuthModel } from './NetworkSegAuthModel'
import * as UI                 from './styledComponents'

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
  // eslint-disable-next-line max-len
  const editingTemplateId = (editRecords.length === 1 && editRecords[0].templateId) || defaultWebAuthTemplateId
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
    selectFromResult: ({ data }) => {
      const portList = data?.data?.map(port => ({
        label: port.portIdentifier,
        value: port.portIdentifier,
        switchMac: port.switchMac,
        disabled: isLAGMemberPort(port)
      })) || []
      // Group by switchMac
      const switchPorts = portList.reduce((
        accumulator: { [name: string]: DefaultOptionType[] }, currentValue) => {
        const currentPortList = accumulator[currentValue['switchMac']]
        accumulator[currentValue['switchMac']] = currentPortList ?
          currentPortList.concat(_.omit(currentValue, 'switchMac')) : []
        return accumulator
      }, {})
      return { portList: _.intersectionWith(...(_.values(switchPorts)), _.isEqual) }
    }
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
      fields: ['name', 'id']
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
    form.setFieldValue('templateId', editingTemplateId)
    setUplinkInfoOverwrite(!isMultipleEdit)
    setVlanIdOverwrite(!isMultipleEdit)
    setWebAuthPageOverwrite(!isMultipleEdit)
  }, [form, open, editingWebAuthPageType, editingTemplateId, isMultipleEdit])


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
    } else {
      form.setFieldValue('templateId', editingTemplateId)
    }
  }, [webAuthPageType, editingTemplateId])

  const UplinkRadio = (props: {
    value: UplinkInfo['uplinkType'];
    options?: DefaultOptionType[];
  }) => {
    const { value: radioValue, options } = props
    const uplinkTypeMap = {
      PORT: $t({ defaultMessage: 'Port' }),
      LAG: $t({ defaultMessage: 'LAG' })
    }
    const uplinkIdValidatorMap = {
      PORT: /^\d\/\d\/\d{1,2}$/,
      LAG: /\d+/
    }
    return (<Space size='middle' style={{ height: '32px' }}>
      <Radio value={radioValue}>
        {uplinkTypeMap[radioValue]}
      </Radio>
      {uplinkInfoType === radioValue &&
        <Form.Item name={['uplinkInfo', 'uplinkId']}
          rules={[
            { required: uplinkInfoOverwrite },
            { pattern: uplinkIdValidatorMap[radioValue],
              message: $t(validationMessages.invalid) }
          ]}
          noStyle>
          { isMultipleEdit && (!options || options.length === 0) ?
            <Input disabled={!uplinkInfoOverwrite}
              data-testid={radioValue}
              style={{ width: '180px' }} /> :
            <Select options={options}
              data-testid={radioValue}
              disabled={!uplinkInfoOverwrite}
              placeholder={$t({ defaultMessage: 'Select ...' })}
              style={{ width: '180px' }} />
          }
        </Form.Item>}
    </Space>)
  }

  const uplinkTypeChangeHandler = () => {
    form.setFieldValue(['uplinkInfo', 'uplinkId'], null)
  }

  const beforeSave = async () => {
    const values: AccessSwitchSaveData = form.getFieldsValue(true)
    try {
      if (!isMultipleEdit) {  //TODO: multi check
        await form.validateFields()
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
    if (!webAuthPageOverwrite) {
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
        <UI.OverwriteFormItem label={<>
          { isMultipleEdit &&
            <Checkbox onChange={(e)=>setUplinkInfoOverwrite(e.target.checked)}></Checkbox>}
          <span>{$t({ defaultMessage: 'Uplink Port' })}</span>
        </>}
        required={!isMultipleEdit}
        >
          <Form.Item name={['uplinkInfo', 'uplinkType']}
            rules={[{ required: !isMultipleEdit }]}
            noStyle>
            <Radio.Group onChange={uplinkTypeChangeHandler}
              disabled={!uplinkInfoOverwrite}>
              <Space direction='vertical'>
                <UplinkRadio value='PORT' options={portList} />
                <UplinkRadio value='LAG' options={lagList} />
              </Space>
            </Radio.Group>
          </Form.Item>
        </UI.OverwriteFormItem>
        <UI.OverwriteFormItem label={<>
          { isMultipleEdit &&
            <Checkbox onChange={(e)=>setVlanIdOverwrite(e.target.checked)}></Checkbox>}
          <span>{$t({ defaultMessage: 'VLAN ID' })}</span>
          <Tooltip title={$t({ defaultMessage: 'The VLAN for Net Seg Auth page' })}
            placement='right'><QuestionMarkCircleOutlined />
          </Tooltip>
        </>}
        required={!isMultipleEdit}
        wrapperCol={{ span: 10 }}>
          <Form.Item name='vlanId'
            rules={vlanIdOverwrite ?
              [{ validator: (_, value) => validateVlanName(value) }] : []}
            noStyle>
            { isMultipleEdit ?
              <InputNumber disabled={!vlanIdOverwrite} min={1} max={4095} />:
              <Select options={vlanList} placeholder={$t({ defaultMessage: 'Select ...' })} />
            }
          </Form.Item>
        </UI.OverwriteFormItem>
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
              disabled={!webAuthPageOverwrite}
              onClick={()=>form.setFieldValue('webAuthPageType', 'TEMPLATE')}>
              {$t({ defaultMessage: 'Select Auth Template' })}
            </Button> :
            <Button type='link'
              disabled={!webAuthPageOverwrite}
              onClick={()=>form.setFieldValue('webAuthPageType', 'USER_DEFINED')}>
              {$t({ defaultMessage: 'Customize' })}
            </Button>}
          </Col>
        </Row>

        <Space align='baseline'>
          <Form.Item name='templateId'
            style={{ width: '180px' }}
            hidden={webAuthPageType === 'USER_DEFINED'}>
            <Select
              placeholder={$t({ defaultMessage: 'Select Template ...' })}
              disabled={!webAuthPageOverwrite}
              options={templateList?.map(t => ({
                value: t.id, label: t.name
              }))} />
          </Form.Item>
          { (!isMultipleEdit || webAuthPageOverwrite) && webAuthPageType !== 'USER_DEFINED' &&
          <NetworkSegAuthModel setWebAuthTemplateId={(id)=>{
            form.setFieldValue('templateId', id)
          }}/>}
        </Space>
        {webAuthPageType === 'USER_DEFINED' ? (<>
          {
            Object.keys(defaultTemplateData).map(name=>{
              const item = defaultTemplateData[name as keyof typeof defaultTemplateData]
              return (<Form.Item name={name}
                label={$t(item.label)}
                validateTrigger='onBlur'
                rules={[getWebAuthLabelValidator(), {
                  required: true,
                  message: $t({ defaultMessage: 'Please enter {label}' }, { label: $t(item.label) })
                }]}
                key={name}>
                <Input.TextArea autoSize
                  disabled={!webAuthPageOverwrite}
                  placeholder={$t(item.defaultMessage, {
                    year: new Date().getFullYear()
                  })} />
              </Form.Item>)
            })
          }
        </>) : (<Card>
          {
            (Object.keys(defaultTemplateData) as (keyof typeof defaultTemplateData)[])
              .map(name => <UI.DisplayFormItem name={name}
                key={name}
                label={$t(defaultTemplateData[name].label)}>
                <p>{template?.[name]}</p>
              </UI.DisplayFormItem>)
          }
        </Card>)}
      </Form>
    </Drawer>
  )
}
