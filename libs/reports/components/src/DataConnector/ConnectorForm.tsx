import React, { useCallback } from 'react'

import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import { GridRow, GridCol, PageHeader, Select, Button, ActionsContainer, showToast, Loader } from '@acx-ui/components'
import { useNavigate, useParams }                                                            from '@acx-ui/react-router-dom'

import { useGetConnectorQuery, useSaveConnectorMutation, useGetDataSourcesQuery } from './services'
import { DataSources, Frequency }                                                 from './types'
import { frequencyMap, getUserName, generateBreadcrumb }                          from './utils'

type DataConnectorFormProps = {
  editMode?: boolean
}


const DataConnectorForm: React.FC<DataConnectorFormProps> = ({ editMode=false }) => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const params = useParams()
  const connectorId = params.settingId
  const selectedConnector = useGetConnectorQuery({ id: connectorId }, { skip: !editMode })
  const { data, isLoading: isDataSourcesLoading } = useGetDataSourcesQuery({})
  const dataSources = (data as unknown as DataSources)?.map(({ dataSource }) => ({
    label: $t(dataSource.name),
    value: dataSource.value
  })).sort((a, b) => a.label.localeCompare(b.label))
  const [form] = Form.useForm()

  const selectedDataSource =
    Form.useWatch('dataSource', form) || selectedConnector.data?.dataSource
  const dataSourceColumns = (data as unknown as DataSources)?.reduce(
    (acc, { dataSource, cols }) => ({
      ...acc,
      [dataSource.value]: cols.map(col => ({ label: col, value: col }))
    }), {})
  const [updateConnector, { isLoading }] = useSaveConnectorMutation()
  const saveConnector = useCallback(() => {
    const data = form.getFieldsValue()
    if (editMode) {
      data.id = selectedConnector.data?.id
      data.isEdit = true
    }
    updateConnector({ ...data, userName: getUserName() })
      .unwrap()
      .then(() => {
        showToast({
          type: 'success',
          content: $t({ defaultMessage: 'Connector saved successfully!' })
        })
        navigate(-1)
      })
      .catch(({ data: { error } }) => {
        showToast({ type: 'error', content: error })
      })
  }, [form, editMode, selectedConnector.data?.id, navigate, updateConnector, $t])
  const initialValues =
    editMode ? selectedConnector.data : { frequency: Frequency.Daily }

  return <>
    <PageHeader
      title={editMode
        ? $t({ defaultMessage: 'Edit Connector' })
        : $t({ defaultMessage: 'New Connector' })}
      breadcrumb={generateBreadcrumb()}
    />
    <Loader states={[
      { isLoading: isDataSourcesLoading || isLoading || selectedConnector.isLoading }
    ]}>
      <GridRow>
        <GridCol col={{ span: 12 }} style={{ minHeight: '180px' }}>
          <Form
            initialValues={initialValues}
            layout='vertical'
            form={form}
          >
            <Form.Item
              name='name'
              label={$t({ defaultMessage: 'Connector name' })}
              rules={[{
                required: true,
                message: $t({ defaultMessage: 'Connector name is required!' })
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
                options={dataSources}
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
                options={dataSourceColumns?.[selectedDataSource as keyof typeof dataSourceColumns]}
              />
            </Form.Item>
            <Form.Item
              name='frequency'
              label={$t({ defaultMessage: 'Frequency of connector' })}
              rules={[{
                required: true,
                message: $t({ defaultMessage: 'Frequency is required!' })
              }]}
            >
              <Select
                disabled
                options={Object.values(Frequency).map(
                  (value) => ({
                    value,
                    label: $t(frequencyMap[value])
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
                form
                  .validateFields()
                  .then(() => {
                    saveConnector()
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

export default DataConnectorForm