import React, { useContext, useEffect, useRef, useState } from 'react'

import { Col, Form, Input, Row, Select, Space }       from 'antd'
import { DefaultOptionType }                          from 'antd/lib/select'
import { isEqual, omit, pick, isEmpty, omitBy, find } from 'lodash'
import { FormattedMessage, useIntl }                  from 'react-intl'

import {
  Button,
  GoogleMap,
  GoogleMapMarker,
  PageHeader,
  Loader,
  Modal,
  showActionModal,
  StepsFormLegacy,
  StepsFormLegacyInstance,
  Tooltip,
  Alert
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  defaultApGroupsFilterOptsPayload,
  GoogleMapWithPreference
} from '@acx-ui/rc/components'
import {
  useApListQuery,
  useAddApMutation,
  useGetApOperationalQuery,
  useLazyApGroupListByVenueQuery,
  useLazyGetDhcpApQuery,
  useUpdateApMutation,
  useVenuesListQuery,
  useWifiCapabilitiesQuery,
  useLazyGetVenueApEnhancedKeyQuery,
  useLazyGetVenueApManagementVlanQuery,
  useLazyGetApManagementVlanQuery,
  useLazyGetApValidChannelQuery,
  useLazyApGroupsListQuery,
  useMoveApToTargetApGroupMutation
} from '@acx-ui/rc/services'
import {
  ApDeep,
  ApDhcpRoleEnum,
  ApErrorHandlingMessages,
  APMeshRole,
  apNameRegExp,
  checkObjectNotExists,
  checkValues,
  DeviceGps,
  DhcpApInfo,
  DhcpModeEnum,
  gpsRegExp,
  hasGraveAccentAndDollarSign,
  serialNumberRegExp,
  VenueExtended,
  WifiNetworkMessages,
  gpsToFixed,
  redirectPreviousPage,
  validateTags,
  DhcpAp,
  AFCStatus,
  WifiRbacUrlsInfo
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams,
  useLocation
} from '@acx-ui/react-router-dom'
import { hasAllowedOperations } from '@acx-ui/user'
import {
  validationMessages,
  CatchErrorResponse,
  getEnabledDialogImproved,
  getOpsApi
} from '@acx-ui/utils'

import { ApDataContext, ApEditContext } from '../ApEdit/index'

import * as UI                      from './styledComponents'
import { VenueFirmwareInformation } from './VenueFirmwareInformation'

const defaultPayload = {
  fields: ['name', 'country', 'countryCode', 'latitude', 'longitude', 'dhcp', 'id'],
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}

const defaultApPayload = {
  fields: ['serialNumber', 'name', 'venueId', 'apStatusData', 'firmwareVersion'],
  pageSize: 10000
}

export function ApForm () {
  const { $t } = useIntl()
  const supportVenueMgmtVlan = useIsSplitOn(Features.VENUE_AP_MANAGEMENT_VLAN_TOGGLE)
  const supportApMgmtVlan = useIsSplitOn(Features.AP_MANAGEMENT_VLAN_AP_LEVEL_TOGGLE)
  const supportMgmtVlan = supportVenueMgmtVlan && supportApMgmtVlan
  const supportTlsKeyEnhance = useIsSplitOn(Features.WIFI_EDA_TLS_KEY_ENHANCE_MODE_CONFIG_TOGGLE)
  const isUseWifiRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)
  const { tenantId, action, serialNumber='' } = useParams()
  const isEditMode = action === 'edit'
  const formRef = useRef<StepsFormLegacyInstance<ApDeep>>()
  const navigate = useNavigate()
  const basePath = useTenantLink('/devices/')
  const {
    editContextData, setEditContextData, previousPath, isOnlyOneTab
  } = useContext(ApEditContext)
  const { venueData } = useContext(ApDataContext)

  const { data: apList } = useApListQuery({
    params: { tenantId },
    payload: defaultApPayload,
    enableRbac: isUseWifiRbacApi
  })
  const { data: venuesList, isLoading: isVenuesListLoading }
    = useVenuesListQuery({ params: { tenantId }, payload: defaultPayload })
  const {
    data: apDetails,
    isLoading: isApDetailsLoading
  } = useGetApOperationalQuery({
    params: {
      tenantId,
      serialNumber: serialNumber ? serialNumber : '',
      venueId: venueData ? venueData.id : ''
    },
    enableRbac: isUseWifiRbacApi
  }, { skip: !isEditMode })

  const wifiCapabilities = useWifiCapabilitiesQuery({
    params: { tenantId },
    enableRbac: isUseWifiRbacApi
  })

  const [addAp] = useAddApMutation()
  const [updateAp, { isLoading: isApDetailsUpdating }] = useUpdateApMutation()
  const [getDhcpAp] = useLazyGetDhcpApQuery()
  // deprecated in RBAC.
  const [apGroupList] = useLazyApGroupListByVenueQuery()
  const [rbacApGroupList] = useLazyApGroupsListQuery()
  const [getTargetVenueMgmtVlan] = useLazyGetVenueApManagementVlanQuery()
  const [getApMgmtVlan] = useLazyGetApManagementVlanQuery()
  const [getApValidChannel] = useLazyGetApValidChannelQuery()
  const [getVenueApEnhancedKey] = useLazyGetVenueApEnhancedKeyQuery()
  const [moveApToTargetApGroup] = useMoveApToTargetApGroupMutation()

  const [selectedVenue, setSelectedVenue] = useState({} as unknown as VenueExtended)
  const [venueOption, setVenueOption] = useState([] as DefaultOptionType[])
  const [apGroupOption, setApGroupOption] = useState([] as DefaultOptionType[])
  const [gpsModalVisible, setGpsModalVisible] = useState(false)
  const [deviceGps, setDeviceGps] = useState(null as DeviceGps | null)
  const [changeMgmtVlan, setChangeMgmtVlan] = useState(false)
  const [isVenueSameCountry, setIsVenueSameCountry] = useState(false)
  const [dhcpRoleDisabled, setDhcpRoleDisabled] = useState(false)
  const [apMeshRoleDisabled, setApMeshRoleDisabled] = useState(false)
  const [afcEnabled, setAfcEnabled] = useState(false)
  const [tlsEnhancedKeyEnabled, setTlsEnhancedKeyEnabled] = useState(false)
  const [changeTlsEnhancedKey, setChangeTlsEnhancedKey] = useState(false)

  const cellularApModels = useRef<string[]>([])

  const location = useLocation()
  const venueFromNavigate = location.state as { venueId?: string }

  const currentApFirmware = isUseWifiRbacApi
    ? apList?.data?.find(item => item.serialNumber === serialNumber)?.fwVersion
    : apDetails?.firmware

  // the payload would different based on the feature flag
  const retrieveDhcpAp = (dhcpApResponse: DhcpAp) => {
    const result = dhcpApResponse as DhcpApInfo[]
    return result[0]
  }

  useEffect(() => {
    const apModels = wifiCapabilities?.data?.apModels
    if (!wifiCapabilities?.isLoading && apModels) {
      cellularApModels.current = apModels
        .filter(apModel => apModel.canSupportCellular)
        .map(apModel => apModel.model) ?? []
    }
  }, [wifiCapabilities])

  useEffect(() => {
    if (isEditMode && !isVenuesListLoading && !isApDetailsLoading && apDetails) {
      const { venueId, serialNumber, meshRole, deviceGps } = apDetails

      const setData = async (apDetails: ApDeep) => {
        const selectVenue = getVenueById(
          venuesList?.data as unknown as VenueExtended[], venueId)
        const venueLatLng = pick(selectVenue, ['latitude', 'longitude'])
        const options = await getApGroupOptions(venueId)
        let dhcpAp
        if((venueId && serialNumber) || !isUseWifiRbacApi) {
          const dhcpApResponse = await getDhcpAp({
            params: { tenantId },
            payload: isUseWifiRbacApi ?
              [{ venueId, serialNumber }] :
              [serialNumber],
            enableRbac: isUseWifiRbacApi
          }, true).unwrap()
          dhcpAp = retrieveDhcpAp(dhcpApResponse)
        }

        setSelectedVenue(selectVenue as unknown as VenueExtended)
        setApGroupOption(options as DefaultOptionType[])
        setApMeshRoleDisabled(!!meshRole
          && (meshRole !== APMeshRole.DISABLED)
          && (meshRole !== 'DOWN'))
        setDhcpRoleDisabled(checkDhcpRoleDisabled(dhcpAp as DhcpApInfo))
        setDeviceGps((deviceGps || venueLatLng) as unknown as DeviceGps)

        formRef?.current?.setFieldsValue({ description: '', ...apDetails })
        // eslint-disable-next-line
        const afcEnabled = (await getApValidChannel({
          params: { venueId, serialNumber },
          enableRbac: isUseWifiRbacApi
        })).data?.afcEnabled

        if (afcEnabled) {
          setAfcEnabled(afcEnabled)
        }
        if (supportTlsKeyEnhance) {
          // eslint-disable-next-line
          const tlsEnhancedKeyEnabled = (await getVenueApEnhancedKey({ params: { venueId } })).data?.tlsKeyEnhancedModeEnabled
          if (tlsEnhancedKeyEnabled) {
            setTlsEnhancedKeyEnabled(tlsEnhancedKeyEnabled)
          }
        }
      }

      setData(apDetails)
    }
  }, [apDetails, venuesList, isEditMode, isVenuesListLoading, isApDetailsLoading])

  useEffect(() => {
    if (!isVenuesListLoading) {
      setVenueOption(venuesList?.data?.map(item => ({
        label: item.name, value: item.id
      })) ?? [])

      if (venueFromNavigate?.venueId &&
        venuesList?.data.find(venue => venue.id === venueFromNavigate?.venueId)
      ) {
        formRef?.current?.setFieldValue('venueId', venueFromNavigate?.venueId)
        handleVenueChange(venueFromNavigate?.venueId)
      }
    }
  }, [venuesList, isVenuesListLoading])

  useEffect(() => {
    handleUpdateContext()
  }, [deviceGps])

  const handleAddAp = async (values: ApDeep) => {
    const sameAsVenue = isEqual(deviceGps, pick(selectedVenue, ['latitude', 'longitude']))
    try {
      const payload = {
        ...omit(
          values,
          'deviceGps',
          (isUseWifiRbacApi ? 'venueId' : ''),
          (isUseWifiRbacApi ? 'apGroupId' : '')
        ),
        ...(deviceGps && !sameAsVenue && { deviceGps: deviceGps })
      }
      await addAp({
        params: {
          tenantId: tenantId,
          venueId: values.venueId,
          apGroupId: values.apGroupId
        },
        payload: isUseWifiRbacApi ? payload : [payload],
        enableRbac: isUseWifiRbacApi
      }).unwrap()
      navigate(`${basePath.pathname}/wifi`, { replace: true })
    } catch (err) {
      if(!getEnabledDialogImproved()) {
        handleError(err as CatchErrorResponse)
      }
    }
  }

  const handleUpdateAp = async (values: ApDeep) => {
    if (supportVenueMgmtVlan && changeMgmtVlan) {
      showActionModal({
        type: 'confirm',
        width: 450,
        title: $t({ defaultMessage: 'AP Management VLAN Change' }),
        content: (<FormattedMessage
          defaultMessage={
            `Moving to <VenueSingular></VenueSingular>: <b>{venueName}</b> will change the AP
            management VLAN and reboot this AP device. Incorrect
            settings between APs and switches could result in AP access
            loss. Are you sure you want to continue?`
          }
          values={{
            b: (text: string) => <strong>{text}</strong>,
            venueName: selectedVenue.name
          }}/>),
        okText: $t({ defaultMessage: 'Continue' }),
        onOk: async () => {
          handleUpdateTlsKey(values)
        }
      })
    } else {
      handleUpdateTlsKey(values)
    }
  }

  const handleUpdateTlsKey = async (values: ApDeep) => {
    if (supportTlsKeyEnhance && changeTlsEnhancedKey) {
      showActionModal({
        type: 'confirm',
        width: 450,
        title: $t({ defaultMessage: 'TLS Key Change' }),
        content: (<FormattedMessage
          defaultMessage={
            `Moving to <VenueSingular></VenueSingular>: <b>{venueName}</b> will
            alter the current key on the TLS connection and reboot this AP device.
            Are you sure you want to continue?`
          }
          values={{
            b: (text: string) => <strong>{text}</strong>,
            venueName: selectedVenue.name
          }}/>),
        okText: $t({ defaultMessage: 'Continue' }),
        onOk: async () => {
          processUpdateAp(values)
        }
      })
    } else {
      processUpdateAp(values)
    }
  }

  const processUpdateAp = async (values: ApDeep) => {
    const sameAsVenue = isEqual(deviceGps, pick(selectedVenue, ['latitude', 'longitude']))
    try {
      const payload = {
        ...omit(values, 'deviceGps', (isUseWifiRbacApi ? 'venueId' : '')),
        ...(!sameAsVenue && { deviceGps: transformLatLng(values?.deviceGps as string)
          || deviceGps })
      }
      setEditContextData && setEditContextData({
        ...editContextData,
        isDirty: false,
        hasError: false
      })
      if(
        isUseWifiRbacApi &&
        (values.venueId !==apDetails?.venueId ||
        values.apGroupId !== apDetails?.apGroupId)
      ) {
        await moveApToTargetApGroup({
          params: {
            venueId: values.venueId,
            apGroupId: values.apGroupId,
            serialNumber
          }
        }).unwrap()
      }
      await updateAp({
        params: {
          tenantId,
          venueId: values.venueId,
          serialNumber
        },
        payload,
        enableRbac: isUseWifiRbacApi
      }).unwrap()
      if (isOnlyOneTab) {
        redirectPreviousPage(navigate, previousPath, basePath)
      }
    } catch (err) {
      if(!getEnabledDialogImproved()) {
        handleError(err as CatchErrorResponse)
      }
    }
  }

  const handleError = async (error: CatchErrorResponse) => {
    const errorType = (error?.status === 423
      ? 'REQUEST_LOCKING'
      : error?.data?.errors?.[0]?.code) as keyof typeof errorTypeMap

    const errorTypeMap = {
      'WIFI-10130': 'SERIAL_NUMBER_ALREADY_REGISTERED',
      'WIFI-10114': 'SERVICE_IS_NOT_SUPPORTED',
      'WIFI-10126': 'UPGRADE_YOUR_LICENSE',
      'WIFI-10140': 'CELLULAR_AP_CANNOT_BE_MOVED',
      'REQUEST_LOCKING': 'REQUEST_LOCKING'
    }

    const errorMsg = ApErrorHandlingMessages[
          errorTypeMap[errorType] as keyof typeof ApErrorHandlingMessages
    ] ?? ApErrorHandlingMessages.ERROR_OCCURRED

    showActionModal({
      type: 'error',
      title: $t({ defaultMessage: 'Error' }),
      content: (<FormattedMessage
        {...errorMsg}
        values={{
          br: () => <br />,
          action: isEditMode
            ? $t({ defaultMessage: 'updating' })
            : $t({ defaultMessage: 'creating' })
        }}
      />),
      customContent: {
        action: 'SHOW_ERRORS',
        errorDetails: error
      }
    })
  }

  const getApGroupOptions = async (venueId: string) => {
    let result: { label: string; value: string | null }[] = []
    result.push({
      label: $t({ defaultMessage: 'No group (inherit from <VenueSingular></VenueSingular>)' }),
      value: null
    })

    if (isUseWifiRbacApi) {
      const { data: apGroupOptions } = await rbacApGroupList({
        payload: {
          ...defaultApGroupsFilterOptsPayload,
          fields: ['name', 'id', 'isDefault'],
          filters: { venueId: [venueId] }
        },
        enableRbac: isUseWifiRbacApi
      }).unwrap()

      result = result.concat(apGroupOptions.filter(item => {
        if (isEditMode && item.id === apDetails?.apGroupId && item.isDefault) {
          result[0].value = item.id
        }

        return !item.isDefault
      }).map((v) => ({ label: v.name, value: v.id })) || [])
      result[0].value = apGroupOptions?.find(item => item.isDefault)?.id ?? null
    } else {
      const list = venueId ? (await apGroupList({ params: { tenantId, venueId } })).data : []
      if (venueId && list?.length) {
        list?.filter((item) => {
          if (isEditMode && item.id === apDetails?.apGroupId && item.isDefault) {
            result[0].value = item.id
          }
          return !item.isDefault
        })
          .sort((a, b) => (a.name > b.name) ? 1 : -1)
          .forEach((item) => (
            result.push({
              label: item.name,
              value: item.id
            })
          ))
      }
    }


    return result
  }

  const handleVenueChange = async (value: string) => {
    const selectVenue = getVenueById(venuesList?.data as unknown as VenueExtended[], value)
    const options = await getApGroupOptions(value)

    setSelectedVenue(selectVenue as unknown as VenueExtended)
    setApGroupOption(options as DefaultOptionType[])
    const sameAsVenue = isEqual(deviceGps, pick(selectedVenue, ['latitude', 'longitude']))
    if (sameAsVenue) {
      setDeviceGps(pick(selectVenue, ['latitude', 'longitude']) as unknown as DeviceGps)
    }
    formRef?.current?.setFieldValue('apGroupId', options[0]?.value ?? (value ? null : ''))
    if (formRef?.current?.getFieldValue('name')) {
      formRef?.current?.validateFields(['name'])
    }

    if (supportMgmtVlan) {
      const targetVenueMgmtVlan = (await getTargetVenueMgmtVlan(
        { params: { venueId: value } })).data
      if (targetVenueMgmtVlan?.keepAp) {
        setChangeMgmtVlan(false)
      } else if (apDetails?.venueId) {
        const apMgmtVlan = (await getApMgmtVlan(
          { params: { venueId: apDetails?.venueId, serialNumber } })).data
        setChangeMgmtVlan(apMgmtVlan?.vlanId !== targetVenueMgmtVlan?.vlanId)
      }
    }
    if (supportTlsKeyEnhance) {
      const targetVenueTlsKey = (await getVenueApEnhancedKey(
        { params: { venueId: value } })).data
      // eslint-disable-next-line max-len
      setChangeTlsEnhancedKey(tlsEnhancedKeyEnabled !== targetVenueTlsKey?.tlsKeyEnhancedModeEnabled)
    }
  }

  const onSaveCoordinates = (latLng: DeviceGps | null) => {
    setDeviceGps(latLng)
    setGpsModalVisible(false)
  }

  const displayAFCGeolocation = () : boolean => {
    const aps = apList?.data ?? []

    // Should not display under Add AP. Only display under edit mode
    // Or afc is not enabled
    if (!isEditMode || !afcEnabled || aps.length === 0) {
      return false
    }

    const apInfo = find(aps, (ap) => ap.serialNumber === apDetails?.serialNumber)
    const afcInfo = apInfo?.apStatusData?.afcInfo
    const { geoLocation, afcStatus } = afcInfo || {}

    const requiredStatus = [AFCStatus.AFC_NOT_REQUIRED, AFCStatus.WAIT_FOR_LOCATION]
    // AFC info and Geo-location possibly does not exist.
    // Same, and if Status is in requires status, then false.
    if (!geoLocation || (!!afcStatus && requiredStatus.includes(afcStatus))) {
      return false
    }

    return true
  }

  const handleUpdateContext = () => {
    if (isEditMode) {
      const form = formRef?.current as StepsFormLegacyInstance
      const originalData = (isEmpty(apDetails?.deviceGps) ? {
        ...apDetails,
        ...{
          deviceGps: {
            latitude: selectedVenue?.latitude,
            longitude: selectedVenue?.longitude
          }
        }
      } : apDetails) as ApDeep

      setEditContextData && setEditContextData({
        ...editContextData,
        tabTitle: $t({ defaultMessage: 'General' }),
        isDirty: checkFormIsDirty(form, originalData, deviceGps as DeviceGps),
        hasError: checkFormIsInvalid(form),
        updateChanges: () => handleUpdateAp(form?.getFieldsValue() as ApDeep)
      })
    }
  }

  const hasChangeVenueApGroupPermission = hasAllowedOperations([
    getOpsApi(WifiRbacUrlsInfo.moveApToTargetApGroup)
  ])

  const disableVenueCombobox = apMeshRoleDisabled
    || dhcpRoleDisabled
    || !hasChangeVenueApGroupPermission

  const disableApGroupCombobox = !selectedVenue
    || apGroupOption?.length < 2
    || !hasChangeVenueApGroupPermission

  return <>
    {!isEditMode && <PageHeader
      title={$t({ defaultMessage: 'Add AP' })}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Wi-Fi' }) },
        { text: $t({ defaultMessage: 'Access Points' }) },
        { text: $t({ defaultMessage: 'AP List' }), link: '/devices/wifi' }
      ]}
    />}
    <StepsFormLegacy
      formRef={formRef}
      onFinish={!isEditMode ? handleAddAp : handleUpdateAp}
      onFormChange={handleUpdateContext}
      onCancel={() =>
        redirectPreviousPage(navigate, previousPath, basePath)
      }
      buttonLabel={{
        submit: !isEditMode
          ? $t({ defaultMessage: 'Add' })
          : $t({ defaultMessage: 'Apply' })
      }}
    >
      <StepsFormLegacy.StepForm>
        <Row gutter={20}>
          <Col span={8}>
            <Loader states={[{
              isLoading: isVenuesListLoading || isApDetailsLoading,
              isFetching: isApDetailsUpdating
            }]}>
              <Form.Item
                name='venueId'
                style={{ marginBottom: '0px' }}
                label={<>
                  {$t({ defaultMessage: '<VenueSingular></VenueSingular>' })}
                  {(apMeshRoleDisabled || dhcpRoleDisabled) && <Tooltip.Question
                    title={
                      apMeshRoleDisabled
                        ? $t(WifiNetworkMessages.AP_VENUE_MESH_DISABLED_TOOLTIP)
                        : (dhcpRoleDisabled
                          ? $t(WifiNetworkMessages.AP_VENUE_DHCP_DISABLED_TOOLTIP)
                          : ''
                        )
                    }
                    placement='bottom'
                  />}
                </>}
                initialValue={null}
                rules={[{
                  required: true,
                  message: $t({ defaultMessage: 'Please select <venueSingular></venueSingular>' })
                }, {
                  validator: (_, value) => {
                    const venues = venuesList?.data as unknown as VenueExtended[]
                    const selectVenue = getVenueById(venues, value)
                    const originalVenue = getVenueById(venues, apDetails?.venueId as string)
                    if (selectVenue?.countryCode && originalVenue?.countryCode) {
                      // isVenueSameCountry is used for display the AFC Geo-location message
                      // eslint-disable-next-line max-len
                      setIsVenueSameCountry(isEqual(selectVenue.countryCode, originalVenue.countryCode))
                      return checkValues(selectVenue.countryCode, originalVenue.countryCode, true)
                    } else if (selectVenue?.country && originalVenue?.country) {
                      // eslint-disable-next-line max-len
                      setIsVenueSameCountry(isEqual(selectVenue?.country, originalVenue?.country))
                      return checkValues(selectVenue?.country, originalVenue?.country, true)
                    }
                    return Promise.resolve()
                  },
                  message: $t(validationMessages.diffVenueCountry)
                }, {
                  validator: (_, value) => {
                    const venues = venuesList?.data as unknown as VenueExtended[]
                    const selectVenue = getVenueById(venues, value)
                    if (!selectVenue?.dhcp?.enabled) {
                      return checkObjectNotExists( // eslint-disable-next-line max-len
                        cellularApModels.current, apDetails?.model, $t({ defaultMessage: '<VenueSingular></VenueSingular>' })
                      )
                    }
                    return Promise.resolve()
                  },
                  message: $t(validationMessages.cellularApDhcpLimitation)
                }]}
                children={<Select
                  disabled={disableVenueCombobox}
                  options={venueOption}
                  onChange={async (value) => await handleVenueChange(value)}
                />}
              />
              {apDetails?.model && currentApFirmware && <VenueFirmwareInformation
                isEditMode={isEditMode}
                venue={selectedVenue}
                apModel={apDetails.model}
                currentApFirmware={currentApFirmware}
              />}
              { displayAFCGeolocation() && isVenueSameCountry &&
                  <Alert message={
                    $t({ defaultMessage:
                    // eslint-disable-next-line max-len
                    'Moving this device to a new <venueSingular></venueSingular> will reset AFC geolocation. '+
                    '6GHz operation will remain in low power mode ' +
                    'until geolocation information is reestablished.'
                    })
                  }
                  showIcon={true}
                  type={'warning'}
                  />
              }
              <Form.Item
                name='apGroupId'
                label={$t({ defaultMessage: 'AP Group' })}
                initialValue={null}
                children={<Select
                  disabled={disableApGroupCombobox}
                  options={selectedVenue?.id ? apGroupOption : []}
                />}
              />
              <Form.Item
                name='name'
                label={<>
                  {$t({ defaultMessage: 'AP Name' })}
                  <Tooltip.Question
                    title={$t(WifiNetworkMessages.AP_NAME_TOOLTIP)}
                    placement='bottom'
                  />
                </>}
                rules={[
                  { required: true },
                  { min: 2, transform: (value) => value.trim() },
                  { max: 32, transform: (value) => value.trim() },
                  { validator: (_, value) => checkValues(value, 'aaaa') },
                  { validator: (_, value) => hasGraveAccentAndDollarSign(value) },
                  { validator: (_, value) => apNameRegExp(value) },
                  {
                    validator: (_, value) => {
                      const venueId = formRef?.current?.getFieldValue('venueId')
                      const nameList = apList?.data?.filter(item => (
                        item.name !== apDetails?.name
                        && (selectedVenue ? item.venueId === venueId : false)
                      )).map(item => item.name) ?? []
                      return checkObjectNotExists(nameList, value,
                        $t({ defaultMessage: 'AP Name' }), 'value',
                        $t({ defaultMessage: 'in this <VenueSingular></VenueSingular>' })
                      )
                    }
                  }
                ]}
                validateFirst
                hasFeedback
                children={<Input />}
              />
              <Form.Item
                name='serialNumber'
                label={$t({ defaultMessage: 'Serial Number' })}
                rules={[
                  { required: true },
                  { validator: (_, value) => serialNumberRegExp(value) },
                  {
                    validator: (_, value) => {
                      const serialNumbers = apList?.data?.filter(
                        item => item.serialNumber !== apDetails?.serialNumber
                      ).map(item => item.serialNumber) ?? []
                      return checkObjectNotExists(serialNumbers, value,
                        $t({ defaultMessage: 'Serial Number' }), 'value')
                    }
                  }
                ]}
                validateFirst
                hasFeedback
                children={<Input disabled={isEditMode} />}
              />
              <Form.Item
                name='description'
                label={$t({ defaultMessage: 'Description' })}
                initialValue=''
                children={<Input.TextArea rows={4} maxLength={180} />}
              />
              <Form.Item
                name='tags'
                label={$t({ defaultMessage: 'Tags' })}
                rules={[{
                  validator: (_, value) => validateTags(value)
                }]}
                children={<Select mode='tags' maxLength={24} />}
              />
              <GpsCoordinatesFormItem />
            </Loader>
          </Col>
        </Row>

        <CoordinatesModal
          formRef={formRef}
          fieldName='deviceGps'
          selectedVenue={selectedVenue}
          deviceGps={deviceGps}
          gpsModalVisible={gpsModalVisible}
          setGpsModalVisible={setGpsModalVisible}
          onSaveCoordinates={onSaveCoordinates}
          isApAfcEnabled={displayAFCGeolocation()}
        />

      </StepsFormLegacy.StepForm>
    </StepsFormLegacy>
  </>

  function GpsCoordinatesFormItem () {
    const sameAsVenue = isEqual(
      [deviceGps?.latitude, deviceGps?.longitude],
      [selectedVenue?.latitude, selectedVenue?.longitude]
    )
    return <Form.Item
      label={$t({ defaultMessage: 'GPS Coordinates' })}
      children={selectedVenue?.id
        ? <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
          {$t({ defaultMessage: '{latitude}, {longitude} {status}' }, {
            latitude: deviceGps?.latitude || selectedVenue?.latitude,
            longitude: deviceGps?.longitude || selectedVenue?.longitude,
            status: sameAsVenue ? $t({ defaultMessage: '(As <venueSingular></venueSingular>)' }):''
          })}
          <Space size={0} split={<UI.Divider />} >
            <Button
              type='link'
              size='small'
              onClick={() => setGpsModalVisible(true)}>
              {$t({ defaultMessage: 'Change' })}
            </Button>
            {!sameAsVenue && <Button
              type='link'
              size='small'
              onClick={() => {
                const deviceGpsObject = selectedVenue?.latitude ? {
                  latitude: selectedVenue.latitude,
                  longitude: selectedVenue.longitude
                } as unknown as DeviceGps
                  : null
                formRef?.current?.setFieldValue('deviceGps', deviceGpsObject)
                onSaveCoordinates(deviceGpsObject)
              }}
            >
              {$t({ defaultMessage: 'Same as <VenueSingular></VenueSingular>' })}
            </Button>}
          </Space>
        </Space>
        : '-'}
    />
  }
}

function CoordinatesModal (props: {
  formRef: React.MutableRefObject<StepsFormLegacyInstance<ApDeep> | undefined>,
  fieldName: string,
  selectedVenue: VenueExtended,
  deviceGps: DeviceGps | null,
  gpsModalVisible: boolean,
  setGpsModalVisible: (data: boolean) => void,
  onSaveCoordinates: (data: DeviceGps | null) => void,
  isApAfcEnabled: boolean
}) {
  const { $t } = useIntl()
  const isMapEnabled = useIsSplitOn(Features.G_MAP)
  const {
    formRef,
    fieldName,
    selectedVenue,
    deviceGps,
    gpsModalVisible,
    setGpsModalVisible,
    onSaveCoordinates,
    isApAfcEnabled
  } = props

  const [zoom, setZoom] = useState(1)
  const [center, setCenter] = useState<google.maps.LatLngLiteral>({
    lat: 0, lng: 0
  })
  const [marker, setMarker] = useState<google.maps.LatLng>()
  const [coordinatesValid, setCoordinatesValid] = useState(true)
  const default6gEnablementToggle = useIsSplitOn(Features.WIFI_AP_DEFAULT_6G_ENABLEMENT_TOGGLE)

  useEffect(() => {
    setTimeout(() => {
      const coord = deviceGps || selectedVenue
      formRef?.current?.setFieldValue(fieldName, `${coord?.latitude}, ${coord?.longitude}`)
      if (window.google) {
        const latlng = new google.maps.LatLng({
          lat: Number(coord?.latitude),
          lng: Number(coord?.longitude)
        })
        updateMarkerPosition(latlng)
      }
    }, 500)
  }, [gpsModalVisible, window.google])

  const updateMarkerPosition = (latlng: google.maps.LatLng) => {
    setMarker(latlng)
    setCenter(latlng.lat() ? latlng.toJSON() : { lat: 0, lng: 0 })
    setZoom(16)
  }

  const onChangeCoordinates = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const [lat, lng] = e.target.value?.split(',')
    try {
      const isValid = await formRef?.current?.validateFields([fieldName])
      if (isValid) {
        if (window.google) {
          const latlng = new google.maps.LatLng({
            lat: Number(lat),
            lng: Number(lng)
          })
          updateMarkerPosition(latlng)
        }
        setCoordinatesValid(true)
      }
    } catch (error) {
      setCoordinatesValid(false)
      console.log(error) // eslint-disable-line no-console
    }
  }

  const onApplyCoordinates = () => {
    const venueLatLng = pick(selectedVenue, ['latitude', 'longitude'])
    const latLng = transformLatLng(formRef?.current?.getFieldValue(fieldName))
    if (!isEqual(venueLatLng, latLng)) {
      showActionModal({
        type: 'confirm',
        width: 450,
        title: $t({ defaultMessage: 'Please confirm that...' }),
        content: $t({
          defaultMessage: `Your GPS coordinates are outside the <venueSingular></venueSingular>:
            {venueName}. Are you sure you want to place the device in this new position?`
        }, { venueName: selectedVenue.name }),
        okText: $t({ defaultMessage: 'Drop It' }),
        cancelText: $t({ defaultMessage: 'Cancel' }),
        onOk: () => onSaveCoordinates(latLng),
        onCancel: () => setGpsModalVisible(false)
      })
    } else {
      setGpsModalVisible(false)
    }
  }

  const onDragEndMaker = async (event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return

    const latLng = [
      event.latLng.lat().toFixed(6),
      event.latLng.lng().toFixed(6)
    ]

    updateMarkerPosition(event.latLng)
    formRef.current?.setFields([{ name: fieldName, value: latLng.join(', '), errors: [] }])
    formRef?.current?.setFieldValue(fieldName, `${latLng.join(', ')}`)

    if (default6gEnablementToggle && !isApAfcEnabled) {
      try {
        const country = await getCountryFromGpsCoordinates(latLng[0], latLng[1])
        if (country !== selectedVenue.country) {
          setCoordinatesValid(false)
          formRef.current?.setFields([{
            name: fieldName,
            errors: [$t(validationMessages.diffApGpsWithVenueCountry)]
          }])
          return
        }
      } catch (error) {
        console.warn('Failed to validate country:', error) // eslint-disable-line no-console
      }
    }

    setCoordinatesValid(true)
  }

  const getCountryFromGpsCoordinates = (
    latitude: string,
    longitude: string
  ): Promise<string | null> => {
    return new Promise((resolve) => {
      const geocoder = new google.maps.Geocoder()
      geocoder.geocode(
        { location: { lat: Number(latitude), lng: Number(longitude) } },
        (results, status) => {
          if (status === 'OK' && results) {
            const countryComponent = results
              .flatMap((result) => result.address_components)
              .find((component) => component.types.includes('country'))
            resolve(countryComponent?.long_name || null)
          } else {
            // eslint-disable-next-line no-console
            console.warn('Geocoding failed:', status)
          }
        }
      )
    })
  }

  return <Modal
    width={550}
    title={$t({ defaultMessage: 'GPS Coordinates' })}
    subTitle={
      $t({ defaultMessage: 'Drag and drop the marker to the location where this device is placed' })
    }
    visible={gpsModalVisible}
    okText={$t({ defaultMessage: 'Apply' })}
    okButtonProps={{
      disabled: !coordinatesValid
    }}
    onOk={onApplyCoordinates}
    onCancel={() => {
      formRef?.current?.setFields([{ name: fieldName, errors: [] }])
      setGpsModalVisible(false)
    }}
  >
    <GoogleMap.FormItem>
      <Form.Item
        noStyle
        label={false}
        name={fieldName}
        rules={[{
          required: isMapEnabled,
          message: $t(validationMessages.gpsCoordinates)
        }, {
          validator: (_, value) => {
            const latLng = typeof value === 'string'
              ? value.split(',').map((v: string) => v.trim())
              : [value.latitude, value.longitude]
            const sameAsVenue = isEqual([selectedVenue?.latitude, selectedVenue?.longitude], latLng)
            return sameAsVenue
              ? Promise.resolve()
              : gpsRegExp(latLng[0], latLng[1])
          }
        }, {
          validator: async (_, value) => {
            if (default6gEnablementToggle && !isApAfcEnabled) {
              const latLng = typeof value === 'string'
                ? value.split(',').map((v: string) => v.trim())
                : [value.latitude, value.longitude]
              const country = await getCountryFromGpsCoordinates(latLng[0], latLng[1])
              if (country === selectedVenue.country) {
                return Promise.resolve()
              } else {
                return Promise.reject($t(validationMessages.diffApGpsWithVenueCountry))
              }
            } else {
              return Promise.resolve()
            }
          }
        }]}
        validateFirst
      >
        <Input placeholder={$t({
          defaultMessage: 'Enter the latitude and longitude. e.g. 37.4117499, -122.0193697'
        })}
        autoComplete='off'
        data-testid='coordinates-input'
        onChange={onChangeCoordinates}
        />
      </Form.Item>
      {isMapEnabled ?
        <GoogleMapWithPreference
          libraries={['places']}
          mapTypeControl={false}
          streetViewControl={false}
          fullscreenControl={false}
          zoom={zoom}
          center={center}
        >
          {marker && <GoogleMapMarker
            position={marker}
            draggable={true}
            onDragEnd={onDragEndMaker}
          />}
        </GoogleMapWithPreference>
        :
        <GoogleMap.NotEnabled />
      }
    </GoogleMap.FormItem>

  </Modal>
}

function getVenueById (venuesList: VenueExtended[], venueId: string) {
  const selectVenue = venuesList?.filter(item => item.id === venueId)[0] ?? {}

  return { ...selectVenue,
    latitude: gpsToFixed(selectVenue?.latitude),
    longitude: gpsToFixed(selectVenue?.longitude)
  }
}

function checkDhcpRoleDisabled (dhcpAp: DhcpApInfo) {
  return (
    (dhcpAp?.venueDhcpMode === DhcpModeEnum.EnableOnMultipleAPs
    || dhcpAp?.venueDhcpMode === DhcpModeEnum.EnableOnHierarchicalAPs
    ) && (dhcpAp?.dhcpApRole === ApDhcpRoleEnum.PrimaryServer
    || dhcpAp?.dhcpApRole === ApDhcpRoleEnum.BackupServer
    ))
}

function transformLatLng (value: string) {
  const latLng = value?.split(',').map((v: string) => v.trim())
  return (
    latLng?.length ? {
      latitude: latLng[0],
      longitude: latLng[1]
    } : null
  ) as DeviceGps
}

function checkFormIsDirty (
  form: StepsFormLegacyInstance,
  originalData: ApDeep,
  deviceGps: DeviceGps
) {
  const formData = form?.getFieldsValue()
  const checkFields = Object.keys(form?.getFieldsValue() ?? {}).concat(['deviceGps'])
  const oldData = pick(originalData, checkFields)
  const newData = { ...omit(formData, 'deviceGps'), deviceGps: deviceGps }
  //omitBy({ ...omit(formData, 'deviceGps'), deviceGps: deviceGps }, v => !v)
  return !!Object.values(formData).length &&
    !isEqual(omitBy(oldData, isEmpty), omitBy(newData, isEmpty))
}

function checkFormIsInvalid (form: StepsFormLegacyInstance) {
  return form?.getFieldsError().map(item => item.errors).flat().length > 0
}
