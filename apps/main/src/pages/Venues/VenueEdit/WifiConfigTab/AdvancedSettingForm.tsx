import { useState, useEffect, useContext } from 'react'

import {
  Select,
  Switch,
  Row,
  Col,
  Space
} from 'antd'
import { isEqual } from 'lodash'
import { useIntl } from 'react-intl'


import { Button, StepsForm, Table, TableProps, Loader, showToast } from '@acx-ui/components'
import { DeleteOutlined }                                          from '@acx-ui/icons'
import {
  useGetVenueCapabilitiesQuery,
  useGetVenueLedOnQuery,
  useUpdateVenueLedOnMutation
} from '@acx-ui/rc/services'
import { VenueLed } from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'

import { VenueEditContext, AdvancedSettingContext } from '../index'

export interface ModelOption {
  label: string
  value: string
}

export function AdvancedSettingForm () {
  const { $t } = useIntl()
  const { tenantId, venueId, activeSubTab } = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink('/venues/')
  const venueCaps = useGetVenueCapabilitiesQuery({ params: { tenantId, venueId } })
  const venueLed = useGetVenueLedOnQuery({ params: { tenantId, venueId } })
  const [updateVenueLedOn] = useUpdateVenueLedOnMutation()
  const { editContextData, setEditContextData } = useContext(VenueEditContext)

  const defaultArray: VenueLed[] = []
  const defaultOptionArray: ModelOption[] = []
  const [tableData, setTableData] = useState(defaultArray)
  const [selectedModels, setSelectedModels] = useState([] as string[])
  const [modelOptions, setModelOptions] = useState(defaultOptionArray)
  const [supportModelOptions, setSupportModelOptions] = useState(defaultOptionArray)

  useEffect(() => {
    const tab = activeSubTab as keyof AdvancedSettingContext['tempData']
    const data = editContextData?.tempData?.[tab] || []
    setEditContextData({
      ...editContextData,
      title: $t({ defaultMessage: 'Advanced Settings' }),
      orinData: data,
      editData: data,
      isDirty: false,
      updateChanges: handleUpdateSetting,
      setTableData: setTableData
    })
  }, [navigate])

  useEffect(() => {
    const apModels = venueCaps?.data?.apModels
    if (apModels?.length) {
      const supportModels: string[] = apModels?.filter(apModel => apModel.ledOn)
        .map(apModel => apModel.model)
      const existingModels = venueLed.data?.map((item: VenueLed) => item.model)
      const availableModels = supportModels
        ?.filter((item) => existingModels ? existingModels?.indexOf(item) === -1 : item)
        .reduce((opts: ModelOption[], item) => [...opts, { label: item, value: item }], [])

      setTableData((venueLed?.data as VenueLed[])?.map(
        (item: VenueLed) => ({ ...item, key: item.model, value: item.model })
      ))
      setSupportModelOptions(supportModels?.reduce((opts: ModelOption[], item) =>
        [...opts, { label: item, value: item }], []))
      setSelectedModels(existingModels as string[])
      setModelOptions(availableModels)

      setEditContextData({
        ...editContextData,
        title: $t({ defaultMessage: 'Advanced Settings' }),
        orinData: (venueLed?.data as VenueLed[])?.map(
          (item: VenueLed) => ({ ...item, key: item.model, value: item.model })
        ),
        isDirty: false,
        updateChanges: handleUpdateSetting,
        setTableData: setTableData
      })
    }
  }, [venueLed.data, venueCaps.data])

  useEffect(() => {
    setEditContextData({
      ...editContextData,
      editData: tableData,
      orinData: (venueLed?.data as VenueLed[])?.map(
        (item: VenueLed) => ({ ...item, key: item.model, value: item.model })
      ),
      isDirty: editContextData?.orinData ? !isEqual(editContextData?.orinData, tableData) : false,
      updateChanges: handleUpdateSetting
    })
  }, [tableData])

  const columns: TableProps<VenueLed>['columns'] = [
    {
      title: $t({ defaultMessage: 'Model' }),
      dataIndex: 'model',
      key: 'model',
      width: 150,
      render: function (data) {
        return (data ? data : <Select
          size='small'
          options={modelOptions}
          placeholder='Select Model...'
          onChange={handleChange}
          style={{ width: '120px' }}
        />)
      }
    },
    {
      title: $t({ defaultMessage: 'LEDs Status' }),
      dataIndex: 'ledEnabled',
      key: 'ledEnabled',
      render: function (data, row) {
        return <Switch
          checked={!!data}
          onClick={(checked) => {
            setTableData([
              ...tableData.map((item) => {
                if (item.model === row.model) item.ledEnabled = checked
                return item
              })
            ])
          }}
        />
      }
    },
    {
      title: '',
      key: 'action',
      render: (data, row) => <Button
        key='delete'
        role='deleteBtn'
        ghost={true}
        icon={<DeleteOutlined />}
        onClick={() => handleDelete(row.model)}
      />
    }
  ]

  const handleAdd = () => {
    setTableData([...tableData, { ledEnabled: true, model: '', key: '' }])
  }
  const handleDelete = (model: string) => {
    const models = selectedModels.filter((item) => item !== model)
    setSelectedModels(models)
    setTableData(tableData.filter(item => item.model !== model))
    setModelOptions(supportModelOptions.filter(item =>
      models.indexOf(item.value) === -1)
    )
  }
  const handleChange = (model: string) => {
    const models = [...selectedModels, model]
    setSelectedModels(models)
    setTableData([
      ...tableData.map((item, index) => {
        if (index === tableData.length - 1) {
          item.model = model
          item.key = model
        }
        return item
      })
    ])
    setModelOptions([
      ...modelOptions.filter(item =>
        models.indexOf(item.value) === -1
      )])
  }

  const handleUpdateSetting = async (redirect?: boolean) => {
    try {
      setEditContextData({
        ...editContextData,
        orinData: editContextData?.editData,
        isDirty: false
      })
      await updateVenueLedOn({
        params: { tenantId, venueId },
        payload: tableData.filter(data => data.model)
      })
      if (redirect) {
        navigate({
          ...basePath,
          pathname: `${basePath.pathname}/${venueId}/venue-details/overview`
        })
      }
    } catch {
      showToast({
        type: 'error',
        content: 'An error occurred'
      })
    }
  }

  return (
    <StepsForm
      onFinish={() => handleUpdateSetting(true)}
      onCancel={() => navigate({
        ...basePath,
        pathname: `${basePath.pathname}/${venueId}/venue-details/overview`
      })}
    >
      <StepsForm.StepForm>
        <Row>
          <Col span={8}>
            <Loader states={[{ isLoading: venueLed.isLoading || venueCaps.isLoading }]}>
              <Space size={8} direction='vertical'>
                <Table
                  columns={columns}
                  dataSource={tableData}
                  pagination={false}
                  options={false}
                  size='small'
                />
                <Button
                  onClick={handleAdd}
                  type='link'
                  disabled={venueLed.isLoading
                      || !modelOptions.length
                      || !!tableData?.find((item) => !item.model)
                  }
                  style={{ margin: '8px 0', padding: 0 }}>
                  {$t({ defaultMessage: 'Add Model' })}
                </Button>
              </Space>
            </Loader>
          </Col>
        </Row>
      </StepsForm.StepForm>
    </StepsForm>
  )
}