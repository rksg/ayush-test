import { useState, useEffect, useContext, useRef } from 'react'

import { Select, Switch, Space } from 'antd'
import { LabeledValue }          from 'antd/lib/select'
import { isEqual, omit }         from 'lodash'
import { useIntl }               from 'react-intl'

import { Button, Table, TableProps, Loader, AnchorContext, showActionModal } from '@acx-ui/components'
import { Features, useIsSplitOn }                                            from '@acx-ui/feature-toggle'
import { DeleteOutlinedIcon }                                                from '@acx-ui/icons'
import {
  useGetVenueLedOnQuery,
  useGetVenueApModelsQuery,
  useUpdateVenueLedOnMutation
} from '@acx-ui/rc/services'
import { VenueLed }  from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import { VenueUtilityContext }                        from '../..'
import { VenueEditContext, VenueWifiConfigItemProps } from '../../../index'

const defaultArray: VenueLed[] = []
const defaultOptionArray: LabeledValue[] = []

export function AccessPointLED (props: VenueWifiConfigItemProps) {
  const { $t } = useIntl()
  const { tenantId, venueId } = useParams()
  const { isAllowEdit=true } = props

  const initDataRef = useRef<VenueLed[]>([])

  const isUseRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)
  const { venueApCaps, isLoadingVenueApCaps } = useContext(VenueUtilityContext)

  const { venueApModels } = useGetVenueApModelsQuery({
    params: { tenantId, venueId },
    enableRbac: true
  }, {
    selectFromResult: ({ data }) => ({
      venueApModels: data?.models?.map( model => model.toUpperCase())
    })
  })

  const venueLed = useGetVenueLedOnQuery(
    { params: { tenantId, venueId }, enableRbac: isUseRbacApi }
  )
  const [updateVenueLedOn, { isLoading: isUpdatingVenueLedOn }] = useUpdateVenueLedOnMutation()

  const {
    editContextData,
    setEditContextData,
    editAdvancedContextData,
    setEditAdvancedContextData
  } = useContext(VenueEditContext)
  const { setReadyToScroll } = useContext(AnchorContext)


  const [tableData, setTableData] = useState(defaultArray)
  const [selectedModels, setSelectedModels] = useState([] as string[])
  const [modelOptions, setModelOptions] = useState(defaultOptionArray)
  const [supportModelOptions, setSupportModelOptions] = useState(defaultOptionArray)

  useEffect(() => {
    const apModels = venueApCaps?.apModels
    const { data: venueApLedData, isLoading } = venueLed

    if (apModels?.length && !isLoading) {
      const supportModels = apModels.filter(apModel => apModel.ledOn)
        .map(apModel => apModel.model)

      setSupportModelOptions(supportModels.map((item) => ({ label: item, value: item })))

      if (supportModels?.length) {
        const venueApLeds: VenueLed[] = []
        const configuratedModels: string[] = []

        if (venueApLedData) {
          venueApLedData.forEach((item: VenueLed) => {
            const { model } = item

            configuratedModels.push(model)

            venueApLeds.push({
              ...item,
              manual: !venueApModels?.includes(model)
            })
          })
        }
        initDataRef.current = venueApLedData ?? []

        setSelectedModels(configuratedModels)
        setTableData(venueApLeds)

        const availableModelsOptions = supportModels
          ?.filter((item) => !configuratedModels.includes(item))
          .map((item) => ({ label: item, value: item }))

        setModelOptions(availableModelsOptions)
      }

      setReadyToScroll?.(r => [...(new Set(r.concat('Access-Point-LEDs')))])
    }
  }, [venueLed, venueApCaps, setReadyToScroll])

  useEffect(() => {
    //const newData = tableData.filter(d => d.model).map(({ manual, ...others }) => others)
    const newData = tableData.map(({ manual, ...others }) => others)
    const hasChanged = !isEqual(newData, initDataRef.current)
    const hasError = tableData.filter(item => !item.model).length > 0

    const newEditAdvancedContextData = (hasChanged) ? {
      ...editAdvancedContextData,
      updateAccessPointLED: () => handleUpdateSetting(newData)
    } : {
      ...omit(editAdvancedContextData, ['updateAccessPointLED'])
    }
    setEditAdvancedContextData && setEditAdvancedContextData(newEditAdvancedContextData)

    setEditContextData && setEditContextData({
      ...editContextData,
      unsavedTabKey: 'settings',
      tabTitle: $t({ defaultMessage: 'Advanced' }),
      isDirty: Object.keys(newEditAdvancedContextData).length > 0,
      hasError
    })

  }, [tableData])

  const handleUpdateSetting = async (data: VenueLed[]) => {
    const isValid = !tableData.find(data => !data.model)
    if (!isValid) {
      showActionModal({
        type: 'error',
        title: $t({ defaultMessage: 'Access Point LEDs' }),
        content: $t({ defaultMessage: 'Please select a model' })
      })

      return
    }
    try {
      await updateVenueLedOn({
        params: { tenantId, venueId },
        payload: data,
        enableRbac: isUseRbacApi
      }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const columns: TableProps<VenueLed>['columns'] = [{
    title: $t({ defaultMessage: 'Model' }),
    dataIndex: 'model',
    key: 'model',
    width: 150,
    render: function (data) {
      return (data ? data : <Select
        size='small'
        status={editContextData.hasError ? 'error' : undefined}
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
        disabled={!isAllowEdit}
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
    dataIndex: 'action',
    render: (_, row) => (row.manual)? <Button
      key='delete'
      role='deleteBtn'
      ghost={true}
      disabled={!isAllowEdit}
      icon={<DeleteOutlinedIcon />}
      style={{ height: '16px' }}
      onClick={() => handleDelete(row.model)}
    /> : null
  }]

  const handleAdd = () => {
    setTableData([...tableData, { ledEnabled: true, model: '', manual: true }])
  }

  const handleDelete = (model: string) => {
    const models = selectedModels.filter((item) => item !== model)
    setSelectedModels(models)
    setTableData(tableData.filter(item => item.model !== model))
    setModelOptions(supportModelOptions.filter((item) =>
      !models.includes((item.value) as string))
    )
  }

  const handleChange = (model: string) => {
    const models = [...selectedModels, model]
    setSelectedModels(models)
    setTableData([
      ...tableData.map((item, index) => {
        if (index === tableData.length - 1) {
          item.model = model
          item.manual = !venueApModels?.includes(model)
        }
        return item
      })
    ])
    setModelOptions([
      ...modelOptions.filter(({ value }) => !models.includes(value as string))
    ])
  }

  return (
    <Loader states={[{
      isLoading: isLoadingVenueApCaps || venueLed.isLoading,
      isFetching: isUpdatingVenueLedOn
    }]}>
      <Space size={8} direction='vertical'>
        <Table
          columns={columns}
          dataSource={tableData}
          type='form'
          rowKey='model'
        />
        <Button
          onClick={handleAdd}
          type='link'
          disabled={venueLed.isLoading
                  || !isAllowEdit
                  || !modelOptions.length
                  || !!tableData?.find((item) => !item.model)
          }
          size='small'>
          {$t({ defaultMessage: 'Add Model' })}
        </Button>
      </Space>
    </Loader>
  )
}
