import { useState, useEffect, useContext } from 'react'

import {
  Select,
  Switch,
  Row,
  Col,
  Space,
  Divider,
  Checkbox,
  Form
} from 'antd'
import { isEqual } from 'lodash'
import { useIntl } from 'react-intl'

import { Button, StepsForm, Table, TableProps, Loader, showToast, Subtitle } from '@acx-ui/components'
import {
  useGetVenueCapabilitiesQuery,
  useGetVenueLedOnQuery,
  useGetVenueApModelsQuery,
  useUpdateVenueLedOnMutation
} from '@acx-ui/rc/services'
import { VenueLed } from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'

import { DeleteOutlinedIcon }                       from '../../../../../Layout/styledComponents'
import { VenueEditContext, AdvancedSettingContext } from '../../../index'

export interface ModelOption {
  label: string
  value: string
}

export function CellularOptionsForm () {
  const { $t } = useIntl()
  const { tenantId, venueId, activeSubTab } = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink('/venues/')
  const venueCaps = useGetVenueCapabilitiesQuery({ params: { tenantId, venueId } })
  const venueLed = useGetVenueLedOnQuery({ params: { tenantId, venueId } })
  const venueApModels = useGetVenueApModelsQuery({ params: { tenantId, venueId } })
  const [updateVenueLedOn] = useUpdateVenueLedOnMutation()
  const { editContextData, setEditContextData } = useContext(VenueEditContext)

  const defaultArray: VenueLed[] = []
  const defaultOptionArray: ModelOption[] = []
  const [tableData, setTableData] = useState(defaultArray)
  const [selectedModels, setSelectedModels] = useState([] as string[])
  const [modelOptions, setModelOptions] = useState(defaultOptionArray)
  const [supportModelOptions, setSupportModelOptions] = useState(defaultOptionArray)

  useEffect(() => {
    // set default data when switching sub tab
    const tab = activeSubTab as keyof AdvancedSettingContext['tempData']
    const data = editContextData?.tempData?.[tab] || []
    setEditContextData({
      ...editContextData,
      tabTitle: $t({ defaultMessage: 'Advanced Settings' }),
      oldData: data,
      newData: data,
      isDirty: false,
      updateChanges: handleUpdateSetting,
      setData: setTableData
    })
  }, [navigate])

  useEffect(() => {
    const apModels = venueCaps?.data?.apModels
    if (apModels?.length) {
      const supportModels: string[] = apModels?.filter(apModel => apModel.ledOn)
        .map(apModel => apModel.model)
      const venueApLeds = venueLed?.data?.map((item: VenueLed) => ({
        ...item,
        manual: !venueApModels?.data?.models?.includes(item.model)
      }))
      const existingModels = venueApLeds?.map((item: VenueLed) => item.model)
      const availableModels = supportModels
        ?.filter((item) => existingModels ? existingModels?.indexOf(item) === -1 : item)
        .reduce((opts: ModelOption[], item) => [...opts, { label: item, value: item }], [])

      setTableData((venueApLeds as VenueLed[])?.map(
        (item: VenueLed) => ({ ...item, key: item.model, value: item.model })
      ))
      setSupportModelOptions(supportModels?.reduce((opts: ModelOption[], item) =>
        [...opts, { label: item, value: item }], []))
      setSelectedModels(existingModels as string[])
      setModelOptions(availableModels)
    }
  }, [venueLed.data, venueCaps.data])

  useEffect(() => {
    setEditContextData({
      ...editContextData,
      tabTitle: $t({ defaultMessage: 'Advanced Settings' }),
      newData: tableData,
      oldData: (venueLed?.data as VenueLed[])?.map(
        (item: VenueLed) => ({
          ...item,
          key: item.model,
          value: item.model,
          manual: !venueApModels?.data?.models?.includes(item.model)
        })
      ),
      isDirty: editContextData?.oldData ? !isEqual(editContextData?.oldData, tableData) : false,
      hasError: tableData?.filter(item => !item.model).length > 0,
      setData: setTableData,
      updateChanges: handleUpdateSetting
    })
  }, [tableData])

  const columns: TableProps<VenueLed>['columns'] = [{
    title: $t({ defaultMessage: 'Model' }),
    dataIndex: 'model',
    key: 'model',
    width: 150,
    render: function (data) {
      return (data ? data : <Select
        size='small'
        options={modelOptions}
        placeholder={$t({ defaultMessage: 'Select Model...' })}
        onChange={handleChange}
      />)
    }
  }, {
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
  }, {
    key: 'action',
    dataIndex: 'a', //Todo
    render: (data, row) => row.manual ? <Button
      key='delete'
      role='deleteBtn'
      ghost={true}
      icon={<DeleteOutlinedIcon />}
      style={{ height: '16px' }}
      onClick={() => handleDelete(row.model)}
    /> : null
  }]

  const handleAdd = () => {
    setTableData([...tableData, { ledEnabled: true, model: '', key: '', manual: true }])
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
          item.manual = !venueApModels?.data?.models?.includes(item.model)
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
        oldData: editContextData?.newData,
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
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  return (
    <>
      <Subtitle level={3}>{$t({ defaultMessage: 'Cellular Options' })}</Subtitle>
      <StepsForm
        onFinish={() => handleUpdateSetting(true)}
        onCancel={() => navigate({
          ...basePath,
          pathname: `${basePath.pathname}/${venueId}/venue-details/overview`
        })}
        buttonLabel={{ submit: $t({ defaultMessage: 'Save' }) }}
      >
        <StepsForm.StepForm>
          {/* <Row>
            <Col span={7}>
              <Loader states={[{ isLoading: venueLed.isLoading || venueCaps.isLoading }]}>
                <Space size={8} direction='vertical'>
                  <Table
                    columns={columns}
                    dataSource={tableData}
                    type='form'
                  />
                  <Button
                    onClick={handleAdd}
                    type='link'
                    disabled={venueLed.isLoading
                      || !modelOptions.length
                      || !!tableData?.find((item) => !item.model)
                    }
                    style={{ fontSize: '12px' }}>
                    {$t({ defaultMessage: 'Add Model' })}
                  </Button>
                </Space>
              </Loader>
            </Col>
          </Row> */}
          <Divider orientation='left' plain>
            <div style={{
              display: 'grid', gridTemplateColumns: 'auto 100px', gridGap: '5px',
              height: '30px'
            }}>
              <div style={{
                display: 'flex', alignItems: 'center',
                height: '30px'
              }}>1 Primary SIM</div>

              <Form.Item
                style={{
                  display: 'flex', alignItems: 'center',
                  height: '30px'
                }}
                name={['wlan', 'advancedCustomization', 'hideSsid']}
                initialValue={false}
                valuePropName='checked'
                children={
                  <Switch />
                }
              />
            </div>
          </Divider>
        </StepsForm.StepForm>
      </StepsForm>

    </>

  )
}
