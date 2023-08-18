/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
import { useContext, useState, useEffect, Key } from 'react'

import { FormInstance, Row, Form, Switch, Space, Input } from 'antd'
import { RuleObject }                                    from 'antd/lib/form'
import { useIntl }                                       from 'react-intl'


import { Drawer, Table, TableProps }               from '@acx-ui/components'
import { useIsSplitOn, Features }                  from '@acx-ui/feature-toggle'
import { QosMapSetOptions, sortProp, defaultSort } from '@acx-ui/rc/utils'
import { filterByAccess, hasAccess }               from '@acx-ui/user'
import { validationMessages }                      from '@acx-ui/utils'

import NetworkFormContext from '../NetworkFormContext'

import * as UI from './styledComponents'

const { useWatch } = Form

export function QosMapSetFrom () {
  const { $t } = useIntl()
  const qosMapSetFlag = useIsSplitOn(Features.WIFI_EDA_QOS_MAP_SET_TOGGLE)

  const enableQosMapSetFieldName = ['wlan', 'advancedCustomization', 'qosMapSetEnabled']
  const qosMapSetRulesFieldName = ['wlan', 'advancedCustomization', 'qosMapSetOptions', 'rules']
  const [ enableQosMapSet ] = [ useWatch<boolean>(enableQosMapSetFieldName) ]
  const columns = useColumns()
  const form = Form.useFormInstance()
  const initialQosMapSetData = [
    { enabled: true, priority: 0, dscpLow: 0, dscpHigh: 7, dscpExceptionValues: [] },
    { enabled: true, priority: 1, dscpLow: 8, dscpHigh: 15, dscpExceptionValues: [] },
    { enabled: true, priority: 2, dscpLow: 16, dscpHigh: 23, dscpExceptionValues: [] },
    { enabled: true, priority: 3, dscpLow: 24, dscpHigh: 31, dscpExceptionValues: [] },
    { enabled: true, priority: 4, dscpLow: 32, dscpHigh: 39, dscpExceptionValues: [] },
    { enabled: true, priority: 5, dscpLow: 40, dscpHigh: 47, dscpExceptionValues: [] },
    { enabled: true, priority: 6, dscpLow: 48, dscpHigh: 55, dscpExceptionValues: [46] },
    { enabled: true, priority: 7, dscpLow: 56, dscpHigh: 63, dscpExceptionValues: [] }
  ]
  const [ selectedRows, setSelectedRows] = useState<Key[]>([])
  const [ drawerFormRule, setDrawerFormRule ] = useState<QosMapSetOptions>()
  const [ qosMapRuleDrawerVisible, setQosMapRuleDrawerVisible ] = useState(false)
  const [ qosMapSetOptionTable, setQosMapSetOptionTable ] = useState<QosMapSetOptions[]>([])

  const { data } = useContext(NetworkFormContext)

  useEffect(() => {
    if (enableQosMapSet === false) {
      setQosMapRuleDrawerVisible(false)
    }

    if (data) {
      const qosMapSetData = data.wlan?.advancedCustomization?.qosMapSetOptions
      if (!qosMapSetData?.hasOwnProperty('rules')) {
        setQosMapSetOptionTable(initialQosMapSetData)
      } else {
        let ruleData = qosMapSetData.rules
        if (ruleData) {
          ruleData = ruleData.map(data => {
            const newData: QosMapSetOptions = {
              priority: data.priority || 0,
              enabled: data.enabled || false,
              dscpLow: data.dscpLow || 0,
              dscpHigh: data.dscpHigh || 0,
              dscpExceptionValues: data.dscpExceptionValues || []
            }
            return newData
          })
          setQosMapSetOptionTable(ruleData as QosMapSetOptions[])
        } else {
          setQosMapSetOptionTable(initialQosMapSetData)
        }
      }
    }
  }, [enableQosMapSet, data])

  const handleSetQosMapSetOptionTable = (data: QosMapSetOptions) => {
    const filterData = qosMapSetOptionTable.filter(
      (item: { priority: number }) => item.priority.toString() !== drawerFormRule?.priority.toString())
    setQosMapSetOptionTable([...filterData, data])
    form.setFieldValue(qosMapSetRulesFieldName, [...filterData, data])
    setDrawerFormRule(undefined)
    setSelectedRows([])
    return true
  }

  const rowActions: TableProps<QosMapSetOptions>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        setDrawerFormRule(selectedRows[0])
        setQosMapRuleDrawerVisible(true)
      }
    }
  ]

  return (
    qosMapSetFlag ?
      <>
        <UI.Subtitle>
          {$t({ defaultMessage: 'QoS Map' })}
        </UI.Subtitle>
        <UI.FieldLabel width='250px'>
          <Space>
            {$t({ defaultMessage: 'QoS Map Set' })}
          </Space>
          <Form.Item
            name={enableQosMapSetFieldName}
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
            children={<Switch
              data-testid='qos-map-set-enabled'
            />}
          />
        </UI.FieldLabel>
        {enableQosMapSet &&
        <UI.FieldLabel width='600px'>
          <Table
            columns={columns}
            type={'tall'}
            dataSource={qosMapSetOptionTable.map((item, index) => ({ ...item, key: index }))}
            rowActions={filterByAccess(rowActions)}
            rowSelection={hasAccess() && {
              type: 'radio',
              selectedRowKeys: selectedRows,
              onChange: (keys: React.Key[]) => {
                setDrawerFormRule(
                  qosMapSetOptionTable?.find((i: { priority: number }) => i.priority === keys[0])
                )
              }
            }}
            data-testid='qos-map-set-option-table'
          />
          <QosMapRuleSettingDrawer
            visible={qosMapRuleDrawerVisible}
            setVisible={setQosMapRuleDrawerVisible}
            qosMapRule={(drawerFormRule)}
            setQosMapRule={handleSetQosMapSetOptionTable}
            qosMapRulesList={qosMapSetOptionTable.filter(item=>item.priority !== drawerFormRule?.priority)}
          />
          <Form.Item
            name={qosMapSetRulesFieldName}
            hidden={true}
          />
        </UI.FieldLabel>
        }
      </>:null
  )
}

function useColumns () {
  const { $t } = useIntl()

  const columns: TableProps<QosMapSetOptions>['columns'] = [
    {
      title: $t({ defaultMessage: 'Priority' }),
      key: 'priority',
      dataIndex: 'priority',
      align: 'center',
      defaultSortOrder: 'ascend',
      sorter: { compare: sortProp('priority', defaultSort) },
      render: function (data, row) {
        return `${row.priority}`
      }
    },
    {
      title: $t({ defaultMessage: 'DSCP Range' }),
      key: 'dscpRange',
      dataIndex: 'dscpRange',
      align: 'center',
      render: function (data, row) {
        return `${row.dscpLow}-${row.dscpHigh}`
      }
    },
    {
      title: $t({ defaultMessage: 'Exception DSCP Values' }),
      key: 'exceptionDscpValues',
      dataIndex: 'exceptionDscpValues',
      align: 'center',
      render: function (data, row) {
        return `${row.dscpExceptionValues}`
      }
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      key: 'status',
      dataIndex: 'status',
      align: 'center',
      render: function (data, row) {
        if (row.enabled) {
          return 'Enabled'
        } else {
          return 'Disabled'
        }
      }
    }
  ]

  return columns
}


interface QosMapRuleSettingDrawerProps {
  qosMapRule?: QosMapSetOptions
  setQosMapRule: (r: QosMapSetOptions) => void
  visible: boolean
  setVisible: (v: boolean) => void
  qosMapRulesList: QosMapSetOptions[]
}

function QosMapRuleSettingDrawer (props: QosMapRuleSettingDrawerProps) {
  const { $t } = useIntl()
  const { qosMapRule, setQosMapRule, visible, setVisible, qosMapRulesList } = props
  const [form] = Form.useForm<QosMapSetOptions>()
  const currentPriority = qosMapRule?.priority || 0

  const onClose = () => {
    setVisible(false)
  }

  return (
    <Drawer
      title={$t({ defaultMessage: 'Edit QoS Map: Priority {currentPriority}' }, { currentPriority })}
      visible={visible}
      onClose={onClose}
      destroyOnClose={true}
      children={
        <QosMapRuleSettingForm
          form={form}
          qosMapRule={qosMapRule}
          setQosMapRule={setQosMapRule}
          qosMapRulesList={qosMapRulesList || []}
        />
      }
      footer={
        <Drawer.FormFooter
          buttonLabel={{
            save: $t({ defaultMessage: 'Apply' })
          }}
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
        />
      }
      width={'600px'}
    />
  )
}

interface QosMapRuleSettingFormProps {
  form: FormInstance<QosMapSetOptions>
  qosMapRule?: QosMapSetOptions
  setQosMapRule: (r: QosMapSetOptions) => void
  qosMapRulesList: QosMapSetOptions[]
}

function QosMapRuleSettingForm (props: QosMapRuleSettingFormProps) {
  const { $t } = useIntl()
  const [enabled, setEnabled] = useState(false)
  const [disableInput, setDisableInput] = useState(false)
  const [priority, setPriority] = useState(0)
  const [dscpLow, setDscpLow] = useState(0)
  const [dscpHigh, setDscpHigh] = useState(0)
  const [exceptionDscp, setExceptionDscp] = useState<number[]>([])
  const { form, qosMapRule, setQosMapRule, qosMapRulesList } = props

  useEffect(() => {
    if(qosMapRule){
      form.setFieldsValue(qosMapRule)

      setEnabled(qosMapRule?.enabled || false)
      setPriority(qosMapRule?.priority)
      setExceptionDscp(qosMapRule?.dscpExceptionValues)
      if (qosMapRule?.enabled === false){
        setDisableInput(true)
        setDscpLow(255)
        setDscpHigh(255)
        form.setFieldValue('dscpLow', 255)
        form.setFieldValue('dscpHigh', 255)
      } else {
        setDisableInput(false)
        setDscpLow(qosMapRule?.dscpLow)
        setDscpHigh(qosMapRule?.dscpHigh)
      }
    }
  }, [form, qosMapRule])

  const handleSwitchChange = (e: boolean | ((prevState: boolean) => boolean)) => {
    setEnabled(e)
    if (e === false){
      setDisableInput(true)
      form.setFieldValue('dscpLow', 255)
      form.setFieldValue('dscpHigh', 255)
      setDscpLow(255)
      setDscpHigh(255)
    } else {
      setDisableInput(false)
    }
  }

  const handleDscpLowInput = (value: string) => {
    setDscpLow(Number(value))
  }

  const handleDscpHighInput = (value: string) => {
    setDscpHigh(Number(value))
  }

  const handleExceptionDscpInput = (value: string) => {
    setExceptionDscp(value.split(',').map(Number))
  }

  const validateDscpInputRange = (_:RuleObject, value: string) => {
    const numericRegex = /^[0-9]+$/
    const parsedValue = parseInt(value, 10)
    if (isNaN(parsedValue)) {
      return Promise.reject($t(validationMessages.dscpRangeValue))
    } else if ( parsedValue === 0 && value.length > 1){
      return Promise.reject($t(validationMessages.dscpRangeValue))
    } else if ( !numericRegex.test(value) ){
      return Promise.reject($t(validationMessages.dscpRangeValue))
    } else if ((parsedValue >= 0 && parsedValue <= 63) || parsedValue === 255) {
      return Promise.resolve()
    } else {
      return Promise.reject($t(validationMessages.dscpRangeValue))
    }
  }

  const validateDscpLowAlreadyMapped = (_:RuleObject, value: string) => {
    const parsedValue = parseInt(value, 10)
    for (const number of exceptionDscp){
      if (parsedValue <= number && number <= dscpHigh){
        return Promise.reject($t(validationMessages.dscpAndExceptionDscpAlreadyMapped))
      }
    }
    form.resetFields(['dscpExceptionValues'])
    form.setFieldValue(['dscpExceptionValues'], exceptionDscp)
    return Promise.resolve()
  }

  const validateDscpHighAlreadyMapped = (_:RuleObject, value: string) => {
    const parsedValue = parseInt(value, 10)
    for (const number of exceptionDscp){
      if (dscpLow <= number && number <= parsedValue){
        return Promise.reject($t(validationMessages.dscpAndExceptionDscpAlreadyMapped))
      }
    }
    form.resetFields(['dscpExceptionValues'])
    form.setFieldValue(['dscpExceptionValues'], exceptionDscp)
    return Promise.resolve()
  }

  const validateExceptionDscpInputRange = (_:RuleObject, value: any) => {
    const uniqueNumbers = new Set()
    const dscpExceptionValuesArray = qosMapRulesList.flatMap(item => item.dscpExceptionValues)
    dscpExceptionValuesArray.forEach(exceptionValues => {uniqueNumbers.add(exceptionValues)})
    if (value.length < 1){
      return Promise.resolve()
    }
    let numbers = null
    if (value instanceof Object){
      numbers = value
    } else {
      numbers = value.split(',').map(Number)
    }
    for (const number of numbers) {
      if (isNaN(number) || number < 0 || number > 63) {
        return Promise.reject($t(validationMessages.exceptionDscpRangeValue))
      }
      if (uniqueNumbers.has(number)) {
        return Promise.reject($t(validationMessages.exceptionDscpValueExists))
      }
      if (dscpLow <= number && number <= dscpHigh){
        return Promise.reject($t(validationMessages.dscpAndExceptionDscpAlreadyMapped))
      }
      uniqueNumbers.add(number)
    }
    return Promise.resolve()
  }

  const validateDscpLow = (_:RuleObject, value: string) => {
    const parsedValue = parseInt(value, 10)
    if (parsedValue > dscpHigh){
      return Promise.reject($t(validationMessages.dscpHighValue))
    }
    form.resetFields(['dscpHigh'])
    form.setFieldValue(['dscpHigh'], dscpHigh)
    return Promise.resolve()
  }

  const validateDscpHigh = (_:RuleObject, value: string) => {
    const parsedValue = parseInt(value, 10)
    if (parsedValue < dscpLow){
      return Promise.reject($t(validationMessages.dscpHighValue))
    }
    form.resetFields(['dscpLow'])
    form.setFieldValue(['dscpLow'], dscpLow)
    return Promise.resolve()
  }

  const validateDscpLowOverlap = (_:RuleObject, value: string) => {
    const parsedValue = parseInt(value, 10)
    const filterData = qosMapRulesList.filter(
      (item: { priority: number }) => item.priority.toString() !== priority.toString())
      .filter((item: { dscpLow: number }) => item.dscpLow.toString() !== '255')
    filterData.sort((a, b) => a.priority - b.priority)

    for (let i = 0; i < filterData.length; i++) {
      if (
        (parsedValue >= filterData[i].dscpLow && parsedValue <= filterData[i].dscpHigh) ||
        (dscpHigh >= filterData[i].dscpLow && dscpHigh <= filterData[i].dscpHigh) ||
        (parsedValue <= filterData[i].dscpLow && dscpHigh >= filterData[i].dscpHigh)
      ) {
        return Promise.reject(`${$t(validationMessages.dscpRangeOverlap)}  ${filterData[i].priority}`)
      }
    }
    return Promise.resolve()
  }

  const validateDscpHighOverlap = (_:RuleObject, value: string) => {
    const parsedValue = parseInt(value, 10)
    const filterData = qosMapRulesList.filter(
      (item: { priority: number }) => item.priority.toString() !== priority.toString())
      .filter((item: { dscpHigh: number }) => item.dscpHigh.toString() !== '255')
    filterData.sort((a, b) => a.priority - b.priority)

    for (let i = 0; i < filterData.length; i++) {
      if (
        (dscpLow >= filterData[i].dscpLow && dscpLow <= filterData[i].dscpHigh) ||
        (parsedValue >= filterData[i].dscpLow && parsedValue <= filterData[i].dscpHigh) ||
        (dscpLow <= filterData[i].dscpLow && parsedValue >= filterData[i].dscpHigh)
      ) {
        return Promise.reject(`${$t(validationMessages.dscpRangeOverlap)}  ${filterData[i].priority}`)
      }
    }
    return Promise.resolve()
  }

  const validateDscp255 = (_:RuleObject, value: string) => {
    const parsedValue = parseInt(value, 10)
    if (parsedValue === 255 && (dscpLow !== 255 || dscpHigh !== 255)){
      return Promise.reject($t(validationMessages.dscp255Value))
    }else if(parsedValue !== 255 && (dscpLow === 255 || dscpHigh === 255)){
      return Promise.reject($t(validationMessages.dscp255Value))
    }else if(parsedValue === 255 && (dscpLow === 255 || dscpHigh === 255)){
      return Promise.resolve()
    }else{
      return Promise.resolve()
    }
  }

  return (
    <div data-testid='addQosMapRuleDrawer'>
      <Form
        layout='vertical'
        form={form}
        onFinish={(data: QosMapSetOptions) => {
          if (data?.dscpExceptionValues){
            const dscpExceptionValuesString = data.dscpExceptionValues.toString()
            if (data?.dscpExceptionValues === undefined || data?.dscpExceptionValues.length < 1){
              data.dscpExceptionValues = []
            } else {
              data.dscpExceptionValues = dscpExceptionValuesString.split(',').map((str) => parseFloat(str))
            }
          } else {
            data.dscpExceptionValues = []
          }
          setQosMapRule({
            ...data
          })
          form.resetFields()
        }}
      >
        <UI.FieldLabel width='250px'>
          <Space>
            {$t({ defaultMessage: 'Enabled' })}
          </Space>
          <Form.Item
            name={'enabled'}
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
            children={<Switch onChange={handleSwitchChange} data-testid='enabled' />}
          />
        </UI.FieldLabel>
        <Form.Item
          name='priority'
          hidden={true}
          children={<Input />}
        />
        <Form.Item
          label={$t({ defaultMessage: 'DSCP Range' })}
          required={true}
          children={
            <Row>
              <Form.Item
                name={'dscpLow'}
                validateTrigger={['onChange', 'onBlur']}
                rules={[
                  { validator: validateDscpInputRange },
                  { validator: validateDscpLow },
                  { validator: validateDscp255 },
                  { validator: validateDscpLowOverlap },
                  { validator: validateDscpLowAlreadyMapped }
                ]}
                children={
                  <Input
                    style={{ width: '65px' }}
                    disabled={disableInput}
                    onChange={
                      (e: React.ChangeEvent<HTMLInputElement>): void => handleDscpLowInput(e.target.value)
                    }
                  />
                }
              />
              <label style={{ marginTop: '7px', marginLeft: '15px', marginRight: '15px' }}>
                {'-'}
              </label>
              <Form.Item
                name={'dscpHigh'}
                validateTrigger={['onChange', 'onBlur']}
                rules={[
                  { validator: validateDscpInputRange },
                  { validator: validateDscpHigh },
                  { validator: validateDscp255 },
                  { validator: validateDscpHighOverlap },
                  { validator: validateDscpHighAlreadyMapped }
                ]}
                children={
                  <Input
                    style={{ width: '65px' }}
                    disabled={disableInput}
                    onChange={
                      (e: React.ChangeEvent<HTMLInputElement>): void => handleDscpHighInput(e.target.value)
                    }
                  />
                }
              />
            </Row>
          }
        />
        {enabled &&
        <>
          <UI.FieldLabel width='130px'>
            <label style={{ color: 'var(--acx-neutrals-60)' }}>
              { $t({ defaultMessage: 'Exception DSCP Values' }) }
            </label>
          </UI.FieldLabel>
          <UI.FieldLabel width='300px'>
            <Form.Item
              name={'dscpExceptionValues'}
              validateTrigger={['onChange', 'onBlur']}
              rules={[
                { validator: validateExceptionDscpInputRange }
              ]}
              children={
                <Input
                  style={{ width: '300px' }}
                  onChange={
                    (e: React.ChangeEvent<HTMLInputElement>): void => handleExceptionDscpInput(e.target.value)
                  }
                />
              }
            />
          </UI.FieldLabel>
          <UI.FieldLabel width='500px' style={{ marginTop: '-10px', paddingBottom: '10px' }}>
            <label style={{ color: 'var(--acx-neutrals-50)' }}>
              { $t({ defaultMessage: 'Use comma to separate multiple DSCP values' }) }
            </label>
          </UI.FieldLabel>
        </>
        }
      </Form>
    </div>
  )
}