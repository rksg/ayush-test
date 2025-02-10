import React from 'react'

import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import { GridRow, GridCol, PageHeader, Select, Button, ActionsContainer } from '@acx-ui/components'
import { useNavigate }                                                    from '@acx-ui/react-router-dom'

import { DataSubscriptionFrequencyEnum } from './types'
import { generateBreadcrumb }            from './utils'


type DataSubscriptionsFormProps = {
  editMode?: boolean
  isRAI?: boolean
}


const DataSubscriptionsForm: React.FC<DataSubscriptionsFormProps> = ({ isRAI, editMode=false }) => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  // To be fetched from api
  const selectedSubscription = {
    subscriptionName: 'My subscription',
    dataSet: 'apInventory',
    dataSetColumns: [{ value: 'apName' }],
    frequency: 'daily'
  }
  const [form] = Form.useForm()

  const selectedDataSet = Form.useWatch('dataSet', form) || selectedSubscription.dataSet
  // todo prepare map from api response
  const dataSetColumns = {
    apInventory: [
      { value: 'apMac', label: $t({ defaultMessage: 'MAC Address' }) },
      { value: 'apName', label: $t({ defaultMessage: 'AP Name' }) }
    ],
    switchInventory: [
      { value: 'switchMac', label: $t({ defaultMessage: 'Mac Address' }) },
      { value: 'switchName', label: $t({ defaultMessage: 'Switch Name' }) }
    ]
  }

  return <>
    <PageHeader
      title={editMode
        ? $t({ defaultMessage: 'Edit Subscription' })
        : $t({ defaultMessage: 'New Subscription' })}
      breadcrumb={generateBreadcrumb({ isRAI })}
    />
    <GridRow>
      <GridCol col={{ span: 12 }} style={{ minHeight: '180px' }}>
        <Form
          initialValues={
            editMode ? selectedSubscription : { frequency: 'daily' }
          }
          layout='vertical'
          form={form}
        >
          <Form.Item
            name='subscriptionName'
            label={$t({ defaultMessage: 'Subscription name' })}
            rules={[{
              required: true,
              message: $t({ defaultMessage: 'Subscription name is required!' })
            }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name='dataSet'
            label={$t({ defaultMessage: 'Data-set' })}
            rules={[{
              required: true,
              message: $t({ defaultMessage: 'Data-set is required!' })
            }]}
          >
            <Select
              data-testid='datasetSelect'
              onSelect={() => form.setFieldValue('dataSetColumns', undefined)}
              options={[
                { value: 'apInventory', label: $t({ defaultMessage: 'AP Inventory' }) },
                { value: 'switchInventory', label: $t({ defaultMessage: 'Switch Inventory' }) }
              ]}
            />
          </Form.Item>
          <Form.Item
            name='dataSetColumns'
            label={$t({ defaultMessage: 'Data-set columns' })}
            rules={[{
              required: true,
              message: $t({ defaultMessage: 'At least one Data-set column is required!' })
            }]}
          >
            <Select
              showSearch
              mode='multiple'
              options={dataSetColumns[selectedDataSet as keyof typeof dataSetColumns]}
            />
          </Form.Item>
          <Form.Item
            name='frequency'
            label={$t({ defaultMessage: 'Frequency of subscription' })}
            rules={[{
              required: true,
              message: $t({ defaultMessage: 'Frequency is required!' })
            }]}
          >
            <Select
              disabled
              options={Object.entries(DataSubscriptionFrequencyEnum).map(
                ([key, value]) => ({
                  value,
                  label: $t({ defaultMessage: '{key}' }, { key })
                })
              )}
            />
          </Form.Item>
        </Form>
      </GridCol>
    </GridRow>
    <GridRow>
      <ActionsContainer>
        <GridCol col={{ span: 12 }} style={{ flexDirection: 'row-reverse' }}>
          <Button
            type='primary'
            style={{ marginLeft: '20px' }}
            onClick={() => {
              console.log(form.getFieldsValue()) // eslint-disable-line no-console
              // TODO Add validations and submit
              form.submit()
            }}
          >
            {$t({ defaultMessage: 'Save' })}
          </Button>
          <Button
            type='default'
            onClick={() => {
              navigate(-1)
            }}
          >{$t({ defaultMessage: 'Cancel' })}</Button>
        </GridCol>
      </ActionsContainer>
    </GridRow>
  </>
}

export default DataSubscriptionsForm