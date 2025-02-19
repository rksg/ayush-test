import React, { useCallback } from 'react'

import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import { GridRow, GridCol, PageHeader, Select, Button, ActionsContainer, showToast, Loader } from '@acx-ui/components'
import { useNavigate, useParams }                                                            from '@acx-ui/react-router-dom'

import { useGetSubscriptionQuery, useSaveSubscriptionMutation } from './services'
import { Frequency, frequencyMap, getUserName }                 from './utils'
import { generateBreadcrumb }                                   from './utils'

type DataSubscriptionsFormProps = {
  editMode?: boolean
}


const DataSubscriptionsForm: React.FC<DataSubscriptionsFormProps> = ({ editMode=false }) => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const params = useParams()
  const subId = params.settingId
  const selectedSubscription = useGetSubscriptionQuery({ id: subId }, { skip: !editMode })
  const [form] = Form.useForm()

  const selectedDataSet = Form.useWatch('dataSource', form) || selectedSubscription.data?.dataSource
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
  const [updateSubscription, { isLoading }] = useSaveSubscriptionMutation()
  const saveSubscription = useCallback(() => {
    const data = form.getFieldsValue()
    if (editMode) {
      data.id = selectedSubscription.data?.id
      data.isEdit = true
    }
    updateSubscription({ ...data, userName: getUserName() })
      .unwrap()
      .then(() => {
        showToast({
          type: 'success',
          content: $t({ defaultMessage: 'Subscription saved successfully!' })
        })
        navigate(-1)
      })
      .catch(({ data: { error } }) => {
        showToast({ type: 'error', content: error })
      })
  }, [form, editMode, selectedSubscription.data?.id, navigate, updateSubscription, $t])
  const initialValues =
    editMode ? selectedSubscription.data : { frequency: Frequency.Daily }

  return <>
    <PageHeader
      title={editMode
        ? $t({ defaultMessage: 'Edit Subscription' })
        : $t({ defaultMessage: 'New Subscription' })}
      breadcrumb={generateBreadcrumb()}
    />
    <Loader states={[{ isLoading: isLoading || selectedSubscription.isLoading }]}>
      <GridRow>
        <GridCol col={{ span: 12 }} style={{ minHeight: '180px' }}>
          <Form
            initialValues={initialValues}
            layout='vertical'
            form={form}
          >
            <Form.Item
              name='name'
              label={$t({ defaultMessage: 'Subscription name' })}
              rules={[{
                required: true,
                message: $t({ defaultMessage: 'Subscription name is required!' })
              }]}
            >
              <Input data-testid='name' />
            </Form.Item>
            <Form.Item
              name='dataSource'
              label={$t({ defaultMessage: 'Dataset' })}
              rules={[{
                required: true,
                message: $t({ defaultMessage: 'Dataset is required!' })
              }]}
            >
              <Select
                data-testid='dataSourceSelect'
                onSelect={() => form.setFieldValue('columns', undefined)}
                options={[
                  { value: 'apInventory', label: $t({ defaultMessage: 'AP Inventory' }) },
                  { value: 'switchInventory', label: $t({ defaultMessage: 'Switch Inventory' }) }
                ]}
              />
            </Form.Item>
            <Form.Item
              name='columns'
              label={$t({ defaultMessage: 'Dataset columns' })}
              rules={[{
                required: true,
                message: $t({ defaultMessage: 'At least one Dataset column is required!' })
              }]}
            >
              <Select
                data-testid='columnsSelect'
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
                options={[
                  { value: Frequency.Daily, label: $t(frequencyMap[Frequency.Daily]) }
                ]}
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
                form
                  .validateFields()
                  .then(() => {
                    saveSubscription()
                  })
                  .catch(() => {})
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
    </Loader>
  </>
}

export default DataSubscriptionsForm