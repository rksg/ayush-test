import { useEffect, useRef, useState } from 'react'

import {
  Col,
  Form,
  Input,
  Radio,
  RadioChangeEvent,
  Row,
  Select,
  Switch as AntSwitch,
  Space
} from 'antd'
import { DefaultOptionType } from 'antd/lib/select'
import _                     from 'lodash'
import { useIntl }           from 'react-intl'
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
  SortableElementProps,
  SortableContainerProps
} from 'react-sortable-hoc'

import {
  Button,
  PageHeader,
  Loader,
  StepsFormLegacy,
  StepsFormLegacyInstance,
  TableProps,
  Table,
  Tabs,
  Tooltip,
  Alert,
  showToast
} from '@acx-ui/components'
import { useIsSplitOn, Features }         from '@acx-ui/feature-toggle'
import { Drag }                           from '@acx-ui/icons'
import { DeleteOutlined }                 from '@acx-ui/icons-new'
import { useSwitchFirmwareUtils }         from '@acx-ui/rc/components'
import {
  switchApi,
  useGetSwitchQuery,
  useConvertToStackMutation,
  useSaveSwitchMutation,
  useUpdateSwitchMutation,
  useSwitchDetailHeaderQuery,
  useLazyGetVlansByVenueQuery,
  useLazyGetSwitchListQuery,
  useGetSwitchAuthenticationQuery,
  useGetSwitchVenueVersionListQuery,
  useGetSwitchListQuery,
  useGetSwitchVenueVersionListV1001Query,
  useUpdateSwitchAuthenticationMutation
} from '@acx-ui/rc/services'
import {
  Switch,
  getSwitchModel,
  SwitchTable,
  SwitchStatusEnum,
  isOperationalSwitch,
  SwitchViewModel,
  redirectPreviousPage,
  LocationExtended,
  VenueMessages,
  SwitchRow,
  SwitchMessages,
  isSameModelFamily,
  isFirmwareVersionAbove10010f,
  checkSwitchUpdateFields,
  checkVersionAtLeast09010h,
  getStackUnitsMinLimitation,
  convertInputToUppercase,
  FirmwareSwitchVenueVersionsV1002,
  getStackUnitsMinLimitationV1002,
  getSwitchFwGroupVersionV1002,
  SwitchFirmwareModelGroup,
  createSwitchSerialPattern
} from '@acx-ui/rc/utils'
import {
  useLocation,
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'
import { store }   from '@acx-ui/store'
import { getIntl } from '@acx-ui/utils'

import { getTsbBlockedSwitch, showTsbBlockedSwitchErrorDialog }        from '../SwitchForm/blockListRelatedTsb.util'
import { SwitchStackSetting }                                          from '../SwitchStackSetting'
import { SwitchUpgradeNotification, SWITCH_UPGRADE_NOTIFICATION_TYPE } from '../SwitchUpgradeNotification'

import {
  TableContainer,
  RequiredDotSpan,
  StepFormTitle,
  TypographyText
} from './styledComponents'

const defaultPayload = {
  firmwareType: '',
  firmwareVersion: '',
  search: '', updateAvailable: ''
}

const modelNotSupportStack =
['ICX7150-C08P', 'ICX7150-C08PT', 'ICX8100-24', 'ICX8100-24P', 'ICX8100-48',
  'ICX8100-48P', 'ICX8100-C08PF', 'ICX8100-24-X', 'ICX8100-24P-X', 'ICX8100-48-X',
  'ICX8100-48P-X', 'ICX8100-C08PF-X']

export type SwitchModelParams = {
  serialNumber: string;
  isSupport8200AV: boolean;
  isSupport8100: boolean;
  isSupport8100X: boolean;
  isSupport7550Zippy: boolean;
  activeSerialNumber?: string;
}

export const validatorSwitchModel = ( props: SwitchModelParams ) => {
  const { serialNumber, isSupport8200AV, isSupport8100, isSupport8100X,
    isSupport7550Zippy, activeSerialNumber } = props
  const { $t } = getIntl()

  const re = createSwitchSerialPattern({
    isSupport8200AV: isSupport8200AV,
    isSupport8100: isSupport8100,
    isSupport8100X: isSupport8100X,
    isSupport7550Zippy: isSupport7550Zippy
  })
  if (serialNumber && !re.test(serialNumber)) {
    return Promise.reject($t({ defaultMessage: 'Serial number is invalid' }))
  }

  const model = getSwitchModel(serialNumber) || ''

  if (modelNotSupportStack.indexOf(model) > -1) {
    return Promise.reject(
      // eslint-disable-next-line max-len
      $t({ defaultMessage: 'This switch model does not support stacking. Add it as a standalone switch.' })
    )
  }
  if (serialNumber && activeSerialNumber && !isSameModelFamily(activeSerialNumber, serialNumber)) {
    return Promise.reject(
      $t({ defaultMessage: 'All switch models should belong to the same family.' })
    )
  }
  return Promise.resolve()
}

export const validatorUniqueMember = (serialNumber: string, tableData: { id: string }[]) => {
  const { $t } = getIntl()
  const memberExistCount = tableData.filter(item => {
    return serialNumber && item.id === serialNumber
  }).length
  return memberExistCount > 1 ? Promise.reject(
    $t({ defaultMessage: 'Serial number is invalid since it\'s not unique in stack' })
  ) : Promise.resolve()
}

export function StackForm () {
  const { $t } = useIntl()
  const { tenantId, switchId, action, venueId, stackList } = useParams()
  const editMode = action === 'edit'
  const formRef = useRef<StepsFormLegacyInstance<Switch>>()
  const navigate = useNavigate()
  const location = useLocation()
  const basePath = useTenantLink('/devices/')
  const stackSwitches = stackList?.split('_') ?? []
  const isStackSwitches = stackSwitches?.length > 0

  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)
  const enableStackUnitLimitationFlag = useIsSplitOn(Features.SWITCH_STACK_UNIT_LIMITATION)
  const enableSwitchStackNameDisplayFlag = useIsSplitOn(Features.SWITCH_STACK_NAME_DISPLAY_TOGGLE)
  const isBlockingTsbSwitch = useIsSplitOn(Features.SWITCH_FIRMWARE_RELATED_TSB_BLOCKING_TOGGLE)
  const isSwitchFirmwareV1002Enabled = useIsSplitOn(Features.SWITCH_FIRMWARE_V1002_TOGGLE)
  const isSupport8200AV = useIsSplitOn(Features.SWITCH_SUPPORT_ICX8200AV)
  const isSwitchFlexAuthEnabled = useIsSplitOn(Features.SWITCH_FLEXIBLE_AUTHENTICATION)
  const isSupport8100 = useIsSplitOn(Features.SWITCH_SUPPORT_ICX8100)
  const isSupport8100X = useIsSplitOn(Features.SWITCH_SUPPORT_ICX8100X)
  const isSupport7550Zippy = useIsSplitOn(Features.SWITCH_SUPPORT_ICX7550Zippy)

  const [getSwitchList] = useLazyGetSwitchListQuery()

  const [previousPath, setPreviousPath] = useState('')
  const [venueOption, setVenueOption] = useState([] as DefaultOptionType[])
  const [apGroupOption, setApGroupOption] = useState([] as DefaultOptionType[])
  const [editVenueId, setEditVenueId] = useState('')

  const [validateModel, setValidateModel] = useState([] as string[])
  const [visibleNotification, setVisibleNotification] = useState(false)
  const [deviceOnline, setDeviceOnline] = useState(false)
  const [isIcx7650, setIsIcx7650] = useState(false)
  const [isSwitchFirmwareAbove10010f, setIsSwitchFirmwareAbove10010f] = useState(false)
  const [readOnly, setReadOnly] = useState(false)
  const [disableIpSetting, setDisableIpSetting] = useState(false)
  const [standaloneSwitches, setStandaloneSwitches] = useState([] as SwitchRow[])
  const [currentFw, setCurrentFw] = useState('')
  const [currentAboveTenFW, setCurrentAboveTenFw] = useState('')
  const [currentVenueFw, setCurrentVenueFw] = useState('')
  const [currentVenueAboveTenFw, setCurrentVenueAboveTenFw] = useState('')
  const [currentFirmwareV1002, setCurrentFirmwareV1002] =
    useState([] as FirmwareSwitchVenueVersionsV1002[])
  const { checkSwitchModelGroup } = useSwitchFirmwareUtils()

  const [activeRow, setActiveRow] = useState('1')
  const [rowKey, setRowKey] = useState(2)

  const dataFetchedRef = useRef(false)

  const defaultArray: SwitchTable[] = [
    { key: '1', id: '', model: '', active: true, disabled: false },
    { key: '2', id: '', model: '', disabled: false }
  ]
  const [tableData, setTableData] = useState(isStackSwitches ? [] : defaultArray)

  const activeSerialNumber = formRef.current?.getFieldValue(`serialNumber${activeRow}`)

  const getSwitchInfo = useGetSwitchListQuery({
    params: { tenantId },
    payload: { filters: { id: [switchId] } }, enableRbac: isSwitchRbacEnabled
  }, { skip: action === 'add' || !isSwitchRbacEnabled })

  const { data: venuesList, isLoading: isVenuesListLoading } =
    useGetSwitchVenueVersionListQuery({
      params: { tenantId },
      payload: defaultPayload, enableRbac: isSwitchRbacEnabled
    }, { skip: isSwitchFirmwareV1002Enabled })

  const { data: venuesListV1002, isLoading: isVenuesListV1002Loading } =
    useGetSwitchVenueVersionListV1001Query({
      params: { tenantId },
      payload: {
        firmwareType: '',
        firmwareVersion: '',
        search: '', updateAvailable: ''
      }
    }, { skip: !isSwitchFirmwareV1002Enabled })

  const [getVlansByVenue] = useLazyGetVlansByVenueQuery()
  const isVenueIdEmpty = _.isEmpty(venueId) && _.isEmpty(editVenueId)

  const { data: switchData, isLoading: isSwitchDataLoading } =
    useGetSwitchQuery({
      params: { tenantId, switchId, venueId: venueId || editVenueId },
      enableRbac: isSwitchRbacEnabled
    }, {
      skip: !editMode || (isSwitchRbacEnabled && isVenueIdEmpty)
    })
  const { data: switchDetail, isLoading: isSwitchDetailLoading } =
    useSwitchDetailHeaderQuery({
      params: { tenantId, switchId, venueId: venueId || editVenueId },
      enableRbac: isSwitchRbacEnabled
    }, {
      skip: !editMode || (isSwitchRbacEnabled && isVenueIdEmpty)
    })

  const { data: switchAuth, isLoading: isSwitchAuthLoading, isFetching: isSwitchAuthFetching } =
    useGetSwitchAuthenticationQuery({
      params: { tenantId, switchId, venueId: venueId || editVenueId }
    }, {
      skip: !editMode || isVenueIdEmpty || !isSwitchFlexAuthEnabled || !isSwitchFirmwareAbove10010f
    })

  useEffect(() => {
    if (getSwitchInfo.data) {
      setEditVenueId(getSwitchInfo.data.data[0].venueId)
    }
  }, [getSwitchInfo])

  useEffect(() => {
    if (isSwitchFirmwareV1002Enabled && !isVenuesListV1002Loading) {
      const venues = venuesListV1002?.data?.map((item) => ({
        label: item.venueName,
        value: item.venueId
      })) ?? []
      const sortedVenueOption = _.sortBy(venues, (v) => v.label)
      setVenueOption(sortedVenueOption)
    } else if (!isSwitchFirmwareV1002Enabled && !isVenuesListLoading) {
      const venues = venuesList?.data?.map((item) => ({
        label: isSwitchRbacEnabled ? item.venueName : item.name,
        value: isSwitchRbacEnabled ? item.venueId : item.id
      })) ?? []
      const sortedVenueOption = _.sortBy(venues, (v) => v.label)
      setVenueOption(sortedVenueOption)
    }

    if (switchData && switchDetail && (venuesList || venuesListV1002)) {
      if (dataFetchedRef.current) return
      dataFetchedRef.current = true
      formRef?.current?.resetFields()
      formRef?.current?.setFieldsValue({
        ...switchDetail, ...switchData, ..._.omit(switchAuth, ['id'])
      })

      setIsIcx7650(!!switchDetail.model?.includes('ICX7650'))
      setIsSwitchFirmwareAbove10010f(isFirmwareVersionAbove10010f(switchDetail?.firmware))
      setReadOnly(!!switchDetail.cliApplied)
      setDeviceOnline(
        isOperationalSwitch(
          switchDetail.deviceStatus as SwitchStatusEnum, switchDetail.syncedSwitchConfig)
      )

      const switchFw = switchDetail?.firmware || switchData?.firmwareVersion
      const venueId = switchData?.venueId || switchDetail?.venueId || ''
      if (isSwitchFirmwareV1002Enabled && venuesListV1002) {
        const venueVersions = venuesListV1002.data?.find(
          venue => venue['venueId'] === venueId)?.versions
        setCurrentFirmwareV1002(venueVersions || [])

      } else if (!isSwitchFirmwareV1002Enabled && venuesList) {
        const venueFw = venuesList.data.find(
          venue => venue.id === venueId)?.switchFirmwareVersion?.id
        const venueAboveTenFw = venuesList.data.find(
          venue => venue.id === venueId)?.switchFirmwareVersionAboveTen?.id

        setCurrentFw(switchFw || venueFw || '')
        setCurrentAboveTenFw(switchFw || venueAboveTenFw || '')
        setCurrentVenueFw(venueFw || '')
        setCurrentVenueAboveTenFw(venueAboveTenFw || '')
      }

      if (!!switchDetail.model?.includes('ICX7650')) {
        formRef?.current?.setFieldValue('rearModuleOption',
          formRef.current?.getFieldValue('rearModule') === 'stack-40g')
      }

      if (switchDetail.ipFullContentParsed === false) {
        setDisableIpSetting(true)
      }

      const getStackMembersList = async () => {
        const stackMembers = switchData?.stackMembers?.map(
          (item: { id: string; model: string }, index: number) => {
            const key: string = (index + 1).toString()
            formRef?.current?.setFieldValue(`serialNumber${key}`, item.id)
            if (_.get(switchDetail, 'activeSerial') === item.id) {
              setActiveRow(key)
            }
            setVisibleNotification(true)
            return {
              ...item,
              key,
              model: `${item.model === undefined ? getSwitchModel(item.id) : item.model}
                ${_.get(switchDetail, 'activeSerial') === item.id ? '(Active)' : ''}`,
              active: _.get(switchDetail, 'activeSerial') === item.id,
              disabled: _.get(switchDetail, 'activeSerial') === item.id ||
                switchDetail.deviceStatus === SwitchStatusEnum.OPERATIONAL ||
                switchDetail.deviceStatus === SwitchStatusEnum.FIRMWARE_UPD_FAIL
            }
          }) ?? []

        setTableData(stackMembers)
        setRowKey(stackMembers?.length)
      }

      getStackMembersList()
    }
    if (stackSwitches && stackSwitches?.length > 0) {
      const getStandaloneSwitches = async () => {
        const switchListPayload = {
          pageSize: 10000,
          filters: {
            venueId: [venueId],
            isStack: [false],
            deviceStatus: [SwitchStatusEnum.OPERATIONAL, SwitchStatusEnum.FIRMWARE_UPD_FAIL],
            syncedSwitchConfig: [true],
            configReady: [true]
          },
          fields: ['isStack', 'formStacking', 'name', 'model', 'serialNumber',
            'deviceStatus', 'syncedSwitchConfig', 'configReady'
          ]
        }
        const switchList = venueId
          ? (await getSwitchList({
            params: { tenantId: tenantId },
            payload: switchListPayload,
            enableRbac: isSwitchRbacEnabled
          }, false))?.data?.data
          : []

        const switchTableData = stackSwitches?.map((serialNumber, index) => ({
          key: (index + 1).toString(),
          id: serialNumber,
          model: '',
          active: index === 0,
          disabled: false
        })) ?? []

        setStandaloneSwitches(switchList as SwitchRow[])
        setTableData(switchTableData as SwitchTable[])
        setRowKey(stackSwitches?.length ?? 0)
        formRef?.current?.setFieldValue('venueId', venueId)
        stackSwitches?.forEach((serialNumber, index) => {
          formRef?.current?.setFieldValue(`serialNumber${index + 1}`, serialNumber)
        })
      }

      getStandaloneSwitches()
    }
  }, [venuesList, switchData, switchDetail, venuesListV1002])

  useEffect(() => {
    if (switchAuth && !isSwitchAuthLoading && !isSwitchAuthFetching) {
      formRef?.current?.setFieldsValue({
        ...formRef?.current?.getFieldsValue(),
        ..._.omit(switchAuth, ['id'])
      })
    }
  }, [switchAuth, isSwitchAuthLoading, isSwitchAuthFetching])

  useEffect(() => {
    if (tableData || activeRow) {
      formRef?.current?.validateFields()
    }
  }, [tableData, activeRow])


  useEffect(() => {
    if (activeSerialNumber) {
      const switchModel = getSwitchModel(activeSerialNumber) || ''
      setIsIcx7650(switchModel.includes('ICX7650'))
      const miniMembers = getMiniMembers(activeSerialNumber)
      setTableData(data => [...data].splice(0, miniMembers))
    }
  }, [activeSerialNumber, currentAboveTenFW, currentFw, currentFirmwareV1002])


  const getMiniMembers = function (activeSerialNumber: string) {
    const switchModel = getSwitchModel(activeSerialNumber) || ''
    if (isSwitchFirmwareV1002Enabled) {
      const switchModelGroup = checkSwitchModelGroup(switchModel)
      const currentVersion = currentFirmwareV1002?.find(v =>
        v.modelGroup === switchModelGroup)?.version || ''
      return getStackUnitsMinLimitationV1002(switchModel, currentVersion)
    } else {
      return getStackUnitsMinLimitation(switchModel, currentFw, currentAboveTenFW)
    }
  }

  useEffect(() => {
    setPreviousPath((location as LocationExtended)?.state?.from?.pathname)
  }, [])

  const handleChange = (row: SwitchTable, index: number) => {
    const dataRows = [...tableData]
    const serialNumber = formRef.current?.getFieldValue(
      `serialNumber${row.key}`
    )?.toUpperCase()
    dataRows[index].id = serialNumber
    dataRows[index].model = serialNumber && getSwitchModel(serialNumber)
    setTableData(dataRows)

    const modelList = dataRows.filter(row =>
      row.model && modelNotSupportStack.indexOf(row.model) < 0 && row.model !== 'Unknown'
    ).map(row => row.model)
    setValidateModel(modelList)
    setVisibleNotification(modelList.length > 0)
  }

  const handleAddRow = () => {
    const newRowKey = rowKey + 1
    setRowKey(newRowKey)
    setTableData([
      ...tableData,
      {
        key: (newRowKey).toString(),
        id: '',
        model: '',
        disabled: false
      }
    ])
  }

  const [saveSwitch] = useSaveSwitchMutation()
  const [updateSwitch] = useUpdateSwitchMutation()
  const [convertToStack] = useConvertToStackMutation()
  const [updateSwitchAuthentication] = useUpdateSwitchAuthenticationMutation()

  const hasBlockingTsb = function () {
    const fw = isSwitchFirmwareV1002Enabled
      ? getSwitchFwGroupVersionV1002(currentFirmwareV1002, SwitchFirmwareModelGroup.ICX71)
      : currentFw
    return !checkVersionAtLeast09010h(fw) && isBlockingTsbSwitch
  }

  const transformSwitchData = (switchData: Switch) => {
    // transform stack member data for compare data
    const members = switchData?.stackMembers?.reduce((result, current, index) => ({
      ...result,
      [`serialNumber${index + 1}`]: current.id
    }), {})
    return {
      ...switchData,
      ...members
    }
  }

  const handleAddSwitchStack = async (values: SwitchViewModel) => {
    if (hasBlockingTsb()) {
      if (getTsbBlockedSwitch(tableData.map(item => item.id))?.length > 0) {
        showTsbBlockedSwitchErrorDialog()
        return
      }
    }

    try {
      const payload = {
        name: values.name || '',
        id: activeSerialNumber,
        description: values.description,
        venueId: values.venueId,
        stackMembers: tableData.filter(item => item.id).map(item => ({ id: item.id })),
        enableStack: true,
        jumboMode: false,
        igmpSnooping: 'none',
        spanningTreePriority: '',
        initialVlanId: values?.initialVlanId,
        ...(isIcx7650 && { rearModule: values.rearModuleOption ? 'stack-40g' : 'none' })
      }
      await saveSwitch({
        params: { tenantId, venueId: values.venueId },
        payload, enableRbac: isSwitchRbacEnabled
      }).unwrap()

      navigate({
        ...basePath,
        pathname: `${basePath.pathname}/switch`
      })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleEditSwitchStack = async (values: Switch) => {
    if (hasBlockingTsb()) {
      if (getTsbBlockedSwitch(tableData.map(item => item.id))?.length > 0) {
        showTsbBlockedSwitchErrorDialog()
        return
      }
    }
    const omittedFields
        = ['authEnable', 'authDefaultVlan', 'guestVlan']

    try {
      let payload = {
        ..._.omit(values, omittedFields),
        stackMembers: tableData.filter(item => item.id).map(item => ({ id: item.id })),
        trustPorts: formRef.current?.getFieldValue('trustPorts')
      }

      if (disableIpSetting) {
        delete payload.ipAddress
        delete payload.subnetMask
        delete payload.defaultGateway
        delete payload.ipAddressType
      }

      if (isIcx7650) {
        payload.rearModule = _.get(payload, 'rearModuleOption') === true ? 'stack-40g' : 'none'
      } else {
        delete payload.rearModule
      }

      if (isSwitchFlexAuthEnabled && isSwitchFirmwareAbove10010f) {
        await updateSwitchAuthentication({
          params: { tenantId, switchId, venueId: values.venueId },
          payload: {
            authEnable: values?.authEnable,
            authDefaultVlan: values?.authDefaultVlan,
            guestVlan: values?.guestVlan
          }
        }).unwrap()
      }

      await updateSwitch({
        params: { tenantId, switchId, venueId: venueId || editVenueId },
        payload,
        enableRbac: isSwitchRbacEnabled
      }).unwrap()
        .then(() => {
          const transformedSwitchData = transformSwitchData(switchData as Switch)
          const updatedFields = checkSwitchUpdateFields(
            values, switchDetail, transformedSwitchData, _.omit(switchAuth, ['id'])
          )
          const noChange = updatedFields.length === 0
          // TODO: should disable apply button while no changes
          const onlyChangeDescription
            = updatedFields.includes('description') && updatedFields.length === 1

          // These cases won't trigger activity service: UpdateSwitch
          if (noChange || onlyChangeDescription) {
            store.dispatch(
              switchApi.util.invalidateTags([
                { type: 'Switch', id: 'DETAIL' },
                { type: 'Switch', id: 'SWITCH' }
              ])
            )
            showToast({
              type: 'success',
              content: $t(
                { defaultMessage: 'Update switch {switchName} configuration success' },
                { switchName: payload?.name }
              )
            })
          }
        })

      dataFetchedRef.current = false

      if (!deviceOnline) { // only one tab
        redirectPreviousPage(navigate, previousPath, `${basePath.pathname}/switch`)
      }
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleSaveStackSwitches = async (values: SwitchViewModel) => {
    try {
      const enableRbac = isSwitchRbacEnabled
      const activeSwitchModel = getSwitchModel(activeSerialNumber)
      const isIcx7650 = activeSwitchModel?.includes('ICX7650')
      const payload = enableRbac ? {
        name: values.name || '',
        memberSerials: tableData
          ?.filter((item) => item.id && item.id !== activeSerialNumber)
          ?.map((item) => item.id),
        ...(isIcx7650 && { rearModule: values.rearModuleOption ? 'stack-40g' : 'none' })
      } :
        {
          name: values.name || '',
          venueId: venueId,
          activeSwitch: activeSerialNumber,
          memberSwitch: tableData
            ?.filter((item) => item.id && item.id !== activeSerialNumber)
            ?.map((item) => item.id),
          ...(isIcx7650 && { rearModule: values.rearModuleOption ? 'stack-40g' : 'none' })
        }
      await convertToStack({
        params: { tenantId, venueId, switchId: activeSerialNumber },
        payload,
        enableRbac
      }).unwrap()
      navigate({
        ...basePath,
        pathname: `${basePath.pathname}/switch`
      })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleDelete = (row: SwitchTable) => {
    const tmpTableData = tableData.filter((item) => item.key !== row.key)
    setTableData(tmpTableData)

    if (row.key === activeRow) {
      setActiveRow(tmpTableData[0].key)
    }
  }

  const radioOnChange = (e: RadioChangeEvent) => {
    setActiveRow(e.target.value)
  }

  const DragHandle = SortableHandle(() =>
    <Drag style={{
      cursor: 'grab', color: '#6e6e6e',
      marginBottom: '5px', verticalAlign: 'middle'
    }} />
  )

  const columns: TableProps<SwitchTable>['columns'] = [
    {
      dataIndex: 'sort',
      key: 'sort',
      width: 50,
      show: editMode,
      render: (_, row) => {
        return (
          <div data-testid={`${row.key}_Icon`}
            style={{
              textAlign: 'center',
              verticalAlign: 'middle'
            }}><DragHandle /></div>
        )
      }
    },
    {
      dataIndex: 'unitId',
      key: 'unitId',
      showSorterTooltip: false,
      show: editMode
    },
    {
      title: $t({ defaultMessage: 'Serial Number' }),
      dataIndex: 'id',
      key: 'id',
      width: 200,
      render: function (_, row, index) {
        return (<Form.Item
          name={`serialNumber${row.key}`}
          validateTrigger={['onKeyUp', 'onFocus', 'onBlur']}
          rules={[
            {
              required: activeRow === row.key ? true : false,
              message: $t({ defaultMessage: 'This field is required' })
            },
            {
              validator: (_, value) => {
                const switchModelParams: SwitchModelParams = {
                  serialNumber: value,
                  isSupport8200AV: isSupport8200AV,
                  isSupport8100: isSupport8100,
                  isSupport8100X: isSupport8100X,
                  isSupport7550Zippy: isSupport7550Zippy,
                  activeSerialNumber: activeRow === row.key ? value : activeSerialNumber
                }
                return validatorSwitchModel(switchModelParams)}
            },
            {
              validator: (_, value) => validatorUniqueMember(value,
                // replace id here since tableData is not updated yet
                tableData.map(d => ({ id: (d.key === row.key) ? value : d.id }))
              )
            }
          ]}
          validateFirst
        >{isStackSwitches
            ? <Select
              options={standaloneSwitches?.filter(s =>
                row.id === s.serialNumber ||
              (!tableData.find(d => d.id === s.serialNumber)
                && modelNotSupportStack.indexOf(s.model) < 0)
              ).map(s => ({
                label: s.serialNumber, value: s.serialNumber
              }))
              }
              onChange={value => {
                setTableData(tableData.map(d =>
                  d.key === row.key ? { ...d, id: value } : d
                ))
              }}
            />
            : <Input
              data-testid={`serialNumber${row.key}`}
              onBlur={() => handleChange(row, index)}
              onInput={convertInputToUppercase}
              disabled={row.disabled}
            />
          }</Form.Item>)
      }
    },
    ...(isStackSwitches && enableSwitchStackNameDisplayFlag ? [{
      title: $t({ defaultMessage: 'Switch Name' }),
      dataIndex: 'name',
      width: 180,
      key: 'name',
      render: function (_: React.ReactNode, row: SwitchTable) {
        const selected = standaloneSwitches.find(s => s.serialNumber === row.id)
        const content = selected?.name || selected?.serialNumber || '--'
        return <div style={{
          width: '180px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>{content}</div>
      }
    }] : []),
    ...(!isStackSwitches ? [{
      title: $t({ defaultMessage: 'Switch Model' }),
      dataIndex: 'model',
      key: 'model',
      render: function (_: React.ReactNode, row: SwitchTable) {
        return <div>{row.model ? row.model : '--'}</div>
      }
    }] : []),
    {
      title: $t({ defaultMessage: 'Active' }),
      dataIndex: 'active',
      key: 'active',
      show: !editMode,
      render: function (_, row) {
        return (
          <Radio.Group onChange={radioOnChange} disabled={row.disabled} value={activeRow}>
            <Radio
              data-testid={`active${row.key}`}
              key={row.key}
              value={row.key}
              checked={activeRow === row.key}
            />
          </Radio.Group>
        )
      }
    },
    {
      key: 'action',
      dataIndex: 'action',
      render: (_, row) => (
        <Button
          data-testid={`deleteBtn${row.key}`}
          type='link'
          key='delete'
          role='deleteBtn'
          icon={<DeleteOutlined size='sm' />}
          disabled={tableData.length <= 1 || (editMode && activeRow === row.key)}
          hidden={row.disabled}
          onClick={() => handleDelete(row)}
        />
      )
    }
  ]

  const getApGroupOptions = async (venueId: string) => {
    const list = venueId
      ? (await getVlansByVenue({
        params: { tenantId, venueId },
        enableRbac: isSwitchRbacEnabled
      }, true)).data
      : []

    return (
      venueId &&
      list &&
      list.map((item: { vlanId: number }) => ({
        label: item.vlanId,
        value: item.vlanId
      }))
    )
  }

  const handleVenueChange = async (value: string) => {
    const options = (await getApGroupOptions(value)) || []
    if (options.length === 0) {
      formRef.current?.setFieldValue('initialVlanId', null)
    }


    if (isSwitchFirmwareV1002Enabled) {

      if (venuesListV1002 && venuesListV1002.data) {
        const venueVersions = venuesListV1002.data?.find(
          venue => venue['venueId'] === value)?.versions
        setCurrentFirmwareV1002(venueVersions || [])
      }
      const switchModel = getSwitchModel(activeSerialNumber) || ''
      const switchModelGroup = checkSwitchModelGroup(switchModel)
      const currentVersion = currentFirmwareV1002?.find(v =>
        v.modelGroup === switchModelGroup)?.version || ''
      const miniMembers = getStackUnitsMinLimitationV1002(switchModel, currentVersion)
      setTableData(tableData.splice(0, miniMembers))


    } else if (!isSwitchFirmwareV1002Enabled && venuesList) {
      const venueFw =
        venuesList.data.find(venue => venue.id === value)?.switchFirmwareVersion?.id || ''
      const venueAboveTenFw =
        venuesList.data.find(venue => venue.id === value)?.switchFirmwareVersionAboveTen?.id || ''

      setCurrentFw(venueFw)
      setCurrentAboveTenFw(venueAboveTenFw)
      setCurrentVenueFw(venueFw)
      setCurrentVenueAboveTenFw(venueAboveTenFw)

      const switchModel = getSwitchModel(activeSerialNumber) || ''
      const miniMembers = getStackUnitsMinLimitation(switchModel, venueFw, venueAboveTenFw)
      setTableData(tableData.splice(0, miniMembers))
    }

    setApGroupOption(options as DefaultOptionType[])
  }

  const [currentTab, setCurrentTab] = useState('details')

  const onTabChange = (tab: string) => {
    setCurrentTab(tab)
  }

  // @ts-ignore
  const SortableItem = SortableElement((props: SortableElementProps) => <tr {...props} />)
  // @ts-ignore
  const SortContainer = SortableContainer((props: SortableContainerProps) => <tbody {...props} />)

  const onSortEnd = ({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) => {
    if (oldIndex !== newIndex) {
      let tempDataSource = [...tableData]
      let movingItem = tempDataSource[oldIndex]
      tempDataSource.splice(oldIndex, 1)
      tempDataSource = [...tempDataSource.slice(0, newIndex),
        ...[movingItem], ...tempDataSource.slice(newIndex, tempDataSource.length)]
      setTableData(tempDataSource)
    }
  }
  const DraggableContainer = (props: SortableContainerProps) => {
    return <SortContainer
      useDragHandle
      disableAutoscroll
      onSortEnd={onSortEnd}
      {...props}
    />
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const DraggableBodyRow = (props: any) => {
    const { className, style, ...restProps } = props
    const index = tableData.findIndex(
      (x) => x.key === restProps['data-row-key']
    )
    return <SortableItem index={index} {...restProps} />
  }

  const enableAddMember = () => {
    if (!enableStackUnitLimitationFlag) {
      return true
    }
    const miniMembers = getMiniMembers(activeSerialNumber)
    return tableData.length < miniMembers
  }

  return (
    <>
      <PageHeader
        title={editMode ?
          $t({ defaultMessage: '{name}' }, {
            name: switchDetail?.name || switchDetail?.switchName || switchDetail?.serialNumber
          }) :
          $t({ defaultMessage: 'Add Switch Stack' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Wired' }) },
          { text: $t({ defaultMessage: 'Switches' }) },
          { text: $t({ defaultMessage: 'Switch List' }), link: '/devices/switch' }
        ]}
      />
      <StepsFormLegacy
        formRef={formRef}
        onFinish={editMode
          ? handleEditSwitchStack
          : (isStackSwitches ? handleSaveStackSwitches : handleAddSwitchStack)
        }
        onCancel={() =>
          redirectPreviousPage(navigate, previousPath, `${basePath.pathname}/switch`)
        }
        buttonLabel={{
          submit: editMode ?
            $t({ defaultMessage: 'Apply' }) : $t({ defaultMessage: 'Add' }),
          cancel: $t({ defaultMessage: 'Cancel' })
        }}
      >
        <StepsFormLegacy.StepForm
          onFinishFailed={({ errorFields }) => {
            const detailsFields = ['venueId', 'name', 'description']
            const hasErrorFields = !!errorFields.length
            const isSettingsTabActive = currentTab === 'settings'
            const isDetailsFieldsError = errorFields.filter(field => {
              const errorFieldName = field.name[0] as string
              return detailsFields.includes(errorFieldName)
                || errorFieldName.includes('serialNumber')
            }).length > 0

            if (deviceOnline && hasErrorFields && !isDetailsFieldsError && !isSettingsTabActive) {
              setCurrentTab('settings')
              showToast({
                type: 'error',
                content: readOnly
                  ? $t(SwitchMessages.PLEASE_CHECK_INVALID_VALUES_AND_MODIFY_VIA_CLI)
                  : $t(SwitchMessages.PLEASE_CHECK_INVALID_VALUES)
              })
            }
          }}
        >
          <Loader
            states={[
              {
                isLoading: isVenuesListLoading || isSwitchDataLoading
                  || isSwitchDetailLoading || isVenuesListV1002Loading
              }
            ]}
          >
            <Row gutter={20}>
              <Col span={(isStackSwitches && enableSwitchStackNameDisplayFlag) ? 12 : 10}>

                <Tabs onChange={onTabChange}
                  activeKey={currentTab}
                  type='line'
                  hidden={!editMode}
                >
                  <Tabs.TabPane tab={$t({ defaultMessage: 'Stack Details' })} key='details' />
                  {deviceOnline &&
                    <Tabs.TabPane tab={$t({ defaultMessage: 'Settings' })} key='settings' />}
                </Tabs>
                <div style={{ display: currentTab === 'details' ? 'block' : 'none' }}>
                  <Col span={14} style={{ padding: '0' }}>
                    <Form.Item
                      name='venueId'
                      label={$t({ defaultMessage: '<VenueSingular></VenueSingular>' })}
                      rules={[
                        {
                          required: true,
                          message: $t({ defaultMessage: 'This field is required' })
                        }
                      ]}
                      initialValue={null}
                    >
                      <Select
                        options={venueOption}
                        onChange={async (value) => await handleVenueChange(value)}
                        disabled={readOnly || editMode || isStackSwitches}
                      />
                    </Form.Item>
                    <Form.Item
                      name='name'
                      label={<>{$t({ defaultMessage: 'Stack Name' })}</>}
                      rules={[{ max: 255 }]}
                    >
                      <Input />
                    </Form.Item>
                    {!isStackSwitches && <Form.Item
                      name='description'
                      label={$t({ defaultMessage: 'Description' })}
                      rules={[{ max: 64 }]}
                      initialValue={''}
                    ><Input.TextArea rows={4} maxLength={180} />
                    </Form.Item>}
                    {!editMode && !isStackSwitches && <Form.Item
                      name='initialVlanId'
                      label={
                        <>
                          {$t({ defaultMessage: 'DHCP Client' })}
                          <Tooltip.Question
                            title={$t({
                              defaultMessage:
                                // eslint-disable-next-line max-len
                                'DHCP Client interface will only be applied to factory default switches. Switches with pre-existing configuration will not get this change to prevent connectivity loss.'
                            })}
                            placement='bottom'
                          />
                        </>
                      }
                      initialValue={null}
                    >
                      <Select
                        disabled={readOnly || apGroupOption?.length === 0}
                        options={[
                          {
                            label: $t({ defaultMessage: 'Select VLAN...' }),
                            value: null
                          },
                          ...apGroupOption
                        ]}
                      />
                    </Form.Item>
                    }
                    {isIcx7650 &&
                      <Form.Item>
                        <Space style={{ fontSize: '12px', marginRight: '8px' }}>{
                          $t({ defaultMessage: 'Stack with 40G ports on module 3 ' })
                        }</Space>
                        <Form.Item
                          noStyle
                          name='rearModuleOption'
                          valuePropName='checked'
                        >
                          <AntSwitch disabled={editMode} />
                        </Form.Item>
                      </Form.Item>
                    }
                  </Col>
                  <StepFormTitle>
                    {$t({ defaultMessage: 'Stack Member' })}
                    <RequiredDotSpan> *</RequiredDotSpan>
                  </StepFormTitle>
                  {!editMode &&
                    <div style={{ marginBottom: '5px' }}>
                      <TypographyText type='secondary'>
                        {
                          $t({
                            defaultMessage:
                              // eslint-disable-next-line max-len
                              'Stack members will be ordered according to the order in which they were entered here. You can always modify this later.'
                          })
                        }
                      </TypographyText></div>
                  }
                  <Col span={18} style={{ padding: '0', minWidth: 500 }}>
                    <TableContainer data-testid='dropContainer'>
                      <Table
                        columns={columns}
                        dataSource={tableData}
                        type='form'
                        components={{
                          body: {
                            wrapper: DraggableContainer,
                            row: DraggableBodyRow
                          }
                        }}
                      />
                      {tableData.length < 12 && enableAddMember() && (
                        <Button
                          onClick={handleAddRow}
                          type='link'
                          size='small'
                          disabled={tableData.length >= 12}
                        >
                          {$t({ defaultMessage: 'Add another member' })}
                        </Button>
                      )}
                    </TableContainer>
                  </Col>
                  <SwitchUpgradeNotification
                    switchModel={getSwitchModel(activeSerialNumber)}
                    stackUnitsMinLimitaion={getMiniMembers(activeSerialNumber)}
                    venueFirmware={currentVenueFw}
                    venueAboveTenFirmware={currentVenueAboveTenFw}
                    isDisplay={visibleNotification}
                    isDisplayHeader={false}
                    type={SWITCH_UPGRADE_NOTIFICATION_TYPE.STACK}
                    validateModel={validateModel}
                    venueFirmwareV1002={currentFirmwareV1002}
                  />
                </div>
                {editMode &&
                  <>
                    <Form.Item name='id' hidden={true}><Input /></Form.Item>
                    <Form.Item name='firmwareVersion' hidden={true}><Input /></Form.Item>
                    <Form.Item name='trustPorts' hidden={true}><Input /></Form.Item>
                  </>
                }
                <Form.Item name='enableStack' initialValue={true} hidden={true}>
                  <Input /></Form.Item>
                {editMode &&
                  <div style={{ display: currentTab === 'settings' ? 'block' : 'none' }}>
                    {readOnly &&
                      <Alert type='info' message={$t(VenueMessages.CLI_APPLIED)} />}
                    {switchDetail && <SwitchStackSetting
                      switchDetail={switchDetail}
                      apGroupOption={apGroupOption}
                      readOnly={readOnly}
                      deviceOnline={deviceOnline}
                      isIcx7650={isIcx7650}
                      disableIpSetting={disableIpSetting}
                    />}
                  </div>
                }
              </Col>
            </Row>
          </Loader>
        </StepsFormLegacy.StepForm>
      </StepsFormLegacy>
    </>
  )
}

