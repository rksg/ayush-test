import { useContext } from 'react'

import { Form, Space, Typography } from 'antd'
import _                           from 'lodash'
import { useIntl }                 from 'react-intl'

import { StepsFormProps, Table, TableProps, showToast, useStepFormContext }     from '@acx-ui/components'
import type { CompatibilityNodeError }                                          from '@acx-ui/rc/components'
import { CompatibilityStatusBar, CompatibilityStatusEnum, NodesTabs, TypeForm } from '@acx-ui/rc/components'

import { ClusterConfigWizardContext } from '../ClusterConfigWizardDataProvider'

import { InterfacePortFormCompatibility, InterfaceSettingsFormType } from './types'
import { getLagFormCompatibilityFields }                             from './utils'

// TODO: only test
const basicColumns: TableProps<typeof basicData[0]>['columns'] = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
    align: 'center'
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address'
  }
]

const basicData = [
  {
    key: '1',
    name: 'John Doe',
    age: 32,
    address: 'sample address'
  },
  {
    key: '2',
    name: 'Jane Doe',
    age: 33,
    address: 'new address'
  },
  {
    key: '3',
    name: 'Will Smith',
    age: 45,
    address: 'address'
  }
]
// TODO: only test

export const LagForm = (props: {
  setAlertBarData: (alert: StepsFormProps<Record<string, unknown>>['alert']) => void,
  compatibilityCheck: (portSettings: InterfaceSettingsFormType) => {
    results: CompatibilityNodeError<InterfacePortFormCompatibility>[],
    isError: boolean,
    ports: boolean,
    corePorts: boolean,
    portTypes: boolean
  }
}) => {
  const { setAlertBarData, compatibilityCheck } = props
  const { $t } = useIntl()
  const { form } = useStepFormContext()
  // const lagSettings = Form.useWatch('lagSettings', form) as InterfaceSettingsFormType['lagSettings']
  const { clusterInfo } = useContext(ClusterConfigWizardContext)

  const actions: TableProps<(typeof basicData)[0]>['rowActions'] = [
    {
      label: 'Edit',
      onClick: () => {
        const formData = _.get(form.getFieldsValue(true), 'lagSettings')

        const checkResult = compatibilityCheck(formData)
        if (checkResult.isError) {
          setAlertBarData({
            type: 'error',
            message: <CompatibilityStatusBar
              key='step0'
              type={CompatibilityStatusEnum.FAIL}
              fields={getLagFormCompatibilityFields()}
              errors={checkResult.results}
            />
          })
        }
      }
    },
    {
      label: 'Delete',
      onClick: (selectedRows) => showToast({
        type: 'info',
        content: `Delete ${selectedRows.length} item(s)`
      })
    }
  ]

  const header = <Space direction='vertical' size={5}>
    <Typography.Title level={2}>
      {$t({ defaultMessage: 'LAG Settings' })}
    </Typography.Title>
    <Typography.Text>
      {$t({ defaultMessage: `Create and configure the LAG for all SmartEdges in this cluster 
      ({clusterName}) if needed, or click 'Next' to skip:` },
      { clusterName: clusterInfo?.name })}
    </Typography.Text>
  </Space>

  const content = <Form.Item name='lagSettings'>
    <NodesTabs
      nodeList={clusterInfo?.edgeList}
      content={
        (serialNumber) => (
          <Table
            columns={basicColumns}
            dataSource={basicData}
            rowActions={actions}
            rowSelection={{ defaultSelectedRowKeys: [] }}
          />
        )
      }
    />
  </Form.Item>

  return (
    <TypeForm
      header={header}
      content={content}
    />
  )
}