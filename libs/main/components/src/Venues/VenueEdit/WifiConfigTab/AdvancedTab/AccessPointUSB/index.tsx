import { useContext, useEffect, useRef, useState } from 'react'

import { Space, Switch } from 'antd'
import { LabeledValue }  from 'antd/lib/select'
import { isEqual, omit } from 'lodash'
import { useIntl }       from 'react-intl'
import { useParams }     from 'react-router-dom'

import {
  AnchorContext,
  Button,
  Loader,
  Select,
  Table,
  TableProps
} from '@acx-ui/components'
import { DeleteOutlinedIcon }         from '@acx-ui/icons'
import {
  useGetVenueApModelsQuery,
  useGetVenueApUsbStatusQuery,
  useUpdateVenueApUsbStatusMutation
} from '@acx-ui/rc/services'
import { usbTooltipInfo, VenueApUsbStatus } from '@acx-ui/rc/utils'

import { VenueUtilityContext }                        from '../..'
import { VenueEditContext, VenueWifiConfigItemProps } from '../../..'


type VenueApUsbStatusEntry = VenueApUsbStatus & {
  hasExist?: boolean
}

const defaultArray: VenueApUsbStatusEntry[] = []
const emptyOptions: LabeledValue[] = []

export function AccessPointUSB (props: VenueWifiConfigItemProps) {
  const { $t } = useIntl()
  const { tenantId, venueId } = useParams()
  const { isAllowEdit=true } = props

  const initDataRef = useRef<VenueApUsbStatus[]>([])

  const { venueApCaps, isLoadingVenueApCaps } = useContext(VenueUtilityContext)

  const { venueApModels } = useGetVenueApModelsQuery({
    params: { tenantId, venueId },
    enableRbac: true
  }, {
    selectFromResult: ({ data }) => ({
      venueApModels: data?.models?.map( model => model.toUpperCase())
    })
  })

  const venueApStatusList = useGetVenueApUsbStatusQuery({ params: { tenantId, venueId } })
  const [updateVenueApUsb, { isLoading: isUpdatingLoaing }] = useUpdateVenueApUsbStatusMutation()
  const {
    editContextData,
    setEditContextData,
    editAdvancedContextData,
    setEditAdvancedContextData
  } = useContext(VenueEditContext)
  const { setReadyToScroll } = useContext(AnchorContext)


  const [tableData, setTableData] = useState<VenueApUsbStatusEntry[]>(defaultArray)
  const [selectedModels, setSelectedModels] = useState([] as string[])
  const [supportModelOptions, setSupportModelOptions] = useState(emptyOptions)
  const [modelOptions, setModelOptions] = useState(emptyOptions)


  useEffect(() => {
    const apModels = venueApCaps?.apModels
    const { data: venueApStatusData, isLoading } = venueApStatusList

    if (apModels?.length && !isLoading) {
      const supportModels = apModels?.filter(apModel => apModel.usbPowerEnable)
        .map(apModel => apModel.model)
      //console.log('usb-supportModels: ', supportModels)
      setSupportModelOptions(supportModels.map((item) => ({ label: item, value: item })))

      if (supportModels?.length) {
        const venueApUsbSettings: VenueApUsbStatusEntry[] = []
        const configuratedModels: string[] = []

        if (venueApStatusData) {
          venueApStatusData.forEach((item: VenueApUsbStatus) => {
            const { model } = item

            configuratedModels.push(model)

            venueApUsbSettings.push({
              ...item,
              hasExist: venueApModels?.includes(model)
            })
          })
        }
        initDataRef.current = venueApStatusData ?? []

        setSelectedModels(configuratedModels)
        setTableData(venueApUsbSettings)

        const availableModelsOptions = supportModels
          ?.filter((item) => !configuratedModels.includes(item))
          .map((item) => ({ label: item, value: item }))

        setModelOptions(availableModelsOptions)
      }
      setReadyToScroll?.(r => [...(new Set(r.concat('Access-Point-USB-Support')))])
    }
  }, [venueApStatusList.data, venueApCaps, setReadyToScroll])


  useEffect(() => {
    const newData = tableData.filter(d => d.model).map(({ hasExist, ...others }) => others)
    const hasChanged = !isEqual(newData, initDataRef.current)

    const newEditAdvancedContextData = (hasChanged) ? {
      ...editAdvancedContextData,
      updateAccessPointUSB: () => updateAccessPointUSB(newData)
    } : {
      ...omit(editAdvancedContextData, ['updateAccessPointUSB'])
    }

    setEditAdvancedContextData && setEditAdvancedContextData(newEditAdvancedContextData)

    setEditContextData && setEditContextData({
      ...editContextData,
      unsavedTabKey: 'settings',
      tabTitle: $t({ defaultMessage: 'Advanced' }),
      isDirty: Object.keys(newEditAdvancedContextData).length > 0
    })

  }, [tableData])

  const updateAccessPointUSB = async (data: VenueApUsbStatus[]) => {
    try {
      await updateVenueApUsb({
        params: { tenantId, venueId },
        payload: data
      }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }


  const columns: TableProps<VenueApUsbStatusEntry>['columns'] = [{
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
    title: $t({ defaultMessage: 'USB Status' }),
    tooltip: $t(usbTooltipInfo, { br: <br/> }),
    dataIndex: 'usbPortEnable',
    key: 'usbPortEnable',
    render: function (data, row) {
      return <Switch
        disabled={!isAllowEdit}
        checked={!!data}
        onClick={(checked) => {
          setTableData([
            ...tableData.map((item) => {
              if (item.model === row.model) item.usbPortEnable = checked
              return item
            })
          ])
        }}
      />
    }
  }, {
    key: 'action',
    dataIndex: 'action',
    render: (_, row) => (!row.hasExist) ? <Button
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
    setTableData([...tableData, { usbPortEnable: false, model: '' }])
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
          item.hasExist = venueApModels?.includes(model)
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
      isLoading: isLoadingVenueApCaps || venueApStatusList.isLoading,
      isFetching: isUpdatingLoaing
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
          disabled={venueApStatusList.isLoading
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