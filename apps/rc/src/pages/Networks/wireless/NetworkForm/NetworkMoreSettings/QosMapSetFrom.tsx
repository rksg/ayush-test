/* eslint-disable max-len */
import { useState, useEffect, Key } from 'react'

import {  FormInstance, Button,
  Col,
  Row, Form, Switch, Space, Input } from 'antd'
import { useIntl } from 'react-intl'

import { Drawer, Table, TableProps }             from '@acx-ui/components'
import { useIsSplitOn, Features }                from '@acx-ui/feature-toggle'
import { SwitchModelPortData, QosMapSetOptions } from '@acx-ui/rc/utils'
import { filterByAccess, hasAccess }             from '@acx-ui/user'

import * as UI from './styledComponents'

const { useWatch } = Form

export function QosMapSetFrom () {
  const { $t } = useIntl()
  const qosMapSetFlag = useIsSplitOn(Features.WIFI_EDA_QOS_MAP_SET_TOGGLE)

  const enableQosMapSetFieldName = ['wlan', 'advancedCustomization', 'qosMapSetEnabled']
  const [ enableQosMapSet ] = [ useWatch<boolean>(enableQosMapSetFieldName) ]
  const columns = useColumns()

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
  const [ qosMapSetOptionsDefault, setQosMapSetOptionsDefault] = useState(initialQosMapSetData)
  const [ selectedRows, setSelectedRows] = useState<Key[]>([])
  const [ drawerFormRule, setDrawerFormRule ] = useState<QosMapSetOptions>()
  const [ qosMapRuleDrawerVisible, setQosMapRuleDrawerVisible ] = useState(false)
  const [ qosMapSetOptionTable, setQosMapSetOptionTable ] = useState<QosMapSetOptions[]>([])

  useEffect(() => {
    setQosMapSetOptionTable(initialQosMapSetData)
  }, [])

  const handleSetVlan = (data: QosMapSetOptions) => {
    // const filterData = drawerFormRule?.vlanId ? vlanTable.filter(
    //   (item: { vlanId: number }) => item.vlanId.toString() !== drawerFormRule?.vlanId.toString()) :
    //   vlanTable

    // const sfm = data.switchFamilyModels?.map((item, index) => {
    //   return {
    //     ...item,
    //     untaggedPorts: Array.isArray(item.untaggedPorts) ?
    //       item.untaggedPorts?.join(',') : item.untaggedPorts,
    //     taggedPorts: Array.isArray(item.taggedPorts) ?
    //       item.taggedPorts?.join(',') : item.taggedPorts,
    //     key: index
    //   }
    // })

    // data.switchFamilyModels = sfm
    // setVlanTable([...filterData, data])
    // if(_.isEmpty(defaultVlan)){
    //   form.setFieldValue('vlans', [...filterData, data])
    // }else{
    //   form.setFieldValue('vlans', [...filterData, data, defaultVlan])
    // }
    // setDrawerEditMode(false)
    // setDrawerFormRule(undefined)
    // setSelectedRows([])
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
            name={['wlan', 'advancedCustomization', 'qosMapSetEnabled']}
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
            children={<Switch
              data-testid='qos-map-set-enabled'
            />}
          />
        </UI.FieldLabel>
        {enableQosMapSet &&
        <UI.FieldLabel width='500px'>
          <Table
            columns={columns}
            type={'tall'}
            dataSource={qosMapSetOptionsDefault.map((item, index) => ({ ...item, key: index }))}
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
          />
          <QosMapRuleSettingDrawer
            visible={qosMapRuleDrawerVisible}
            setVisible={setQosMapRuleDrawerVisible}
            qosMapRule={(drawerFormRule)}
            setQosMapRule={handleSetVlan}
            qosMapRulesList={qosMapSetOptionTable.filter(item=>item.priority !== drawerFormRule?.priority)}
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


export interface QosMapRuleSettingDrawerProps {
  qosMapRule?: QosMapSetOptions
  setQosMapRule: (r: QosMapSetOptions) => void
  visible: boolean
  setVisible: (v: boolean) => void
  qosMapRulesList: QosMapSetOptions[]
}

export function QosMapRuleSettingDrawer (props: QosMapRuleSettingDrawerProps) {
  const { $t } = useIntl()
  const { qosMapRule, setQosMapRule, visible, setVisible, qosMapRulesList } = props
  const [form] = Form.useForm<QosMapSetOptions>()

  const onClose = () => {
    setVisible(false)
  }

  const p = qosMapRule?.priority || 0


  return (
    <Drawer
      title={$t({ defaultMessage: 'Edit QoS Map: Priority {p}' }, { p })}
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
  const { form, qosMapRule, setQosMapRule, qosMapRulesList } = props

  useEffect(() => {
  }, [])

  return (
    <div data-testid='addQosMapRuleDrawer'>
      <Form
        layout='vertical'
        form={form}
        // onFinish={(data: QosMapSetOptions) => {
        //   setVlan({
        //     ...data,
        //     switchFamilyModels: ruleList as unknown as SwitchModel[] || []
        //   })
        //   form.resetFields()
        // }}
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
            children={<Switch onChange={setEnabled} data-testid='enabled' />}
          />
        </UI.FieldLabel>
        <UI.FieldLabel width='200px'>
          <label style={{ color: 'var(--acx-neutrals-70)' }}>
            { $t({ defaultMessage: 'DSCP Range' }) }
            <span style={{ color: 'red' }}> *</span>
          </label>
        </UI.FieldLabel>
        <UI.FieldLabel width='200px'>
          <Row>
            <Form.Item
              children={<Input style={{ width: '65px' }} />}
            />
            <label style={{ marginTop: '7px', marginLeft: '15px', marginRight: '15px' }}>
              {'-'}
            </label>
            <Form.Item
              children={<Input style={{ width: '65px' }} />}
            />
          </Row>
        </UI.FieldLabel>
        {enabled &&
        <>
          <UI.FieldLabel width='130px'>
            <label style={{ color: 'var(--acx-neutrals-70)' }}>
              { $t({ defaultMessage: 'Exception DSCP Values' }) }
            </label>
          </UI.FieldLabel>
          <UI.FieldLabel width='130px'>
            <Form.Item
              name={'dscpExceptionValues'}
              children={<Input style={{ width: '300px' }} />}
            />
          </UI.FieldLabel>
          <UI.FieldLabel width='500px' style={{ marginTop: '-10px', paddingBottom: '10px' }}>
            <label style={{ color: 'var(--acx-neutrals-60)' }}>
              { $t({ defaultMessage: 'Use comma to separate multiple DSCP values' }) }
            </label>
          </UI.FieldLabel>
        </>
        }
      </Form>
    </div>
  )
}

