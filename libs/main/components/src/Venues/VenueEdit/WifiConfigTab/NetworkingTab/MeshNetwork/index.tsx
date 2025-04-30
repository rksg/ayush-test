/* eslint-disable max-len */
import { useContext, useEffect, useMemo, useRef, useState } from 'react'

import { Button, Form, Input, Radio, RadioChangeEvent, Space, Switch } from 'antd'
import { useIntl }                                                     from 'react-intl'
import { useParams }                                                   from 'react-router-dom'

import { Loader, StepsFormLegacy, Tooltip, showActionModal, AnchorContext }                            from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                      from '@acx-ui/feature-toggle'
import { ApCompatibilityDrawer, ApCompatibilityToolTip, ApCompatibilityType, InCompatibilityFeatures } from '@acx-ui/rc/components'
import {
  useLazyApListQuery,
  useGetVenueSettingsQuery,
  useUpdateVenueMeshMutation,
  useGetVenueTemplateSettingsQuery,
  useUpdateVenueTemplateMeshMutation,
  useGetVenueMeshQuery,
  useGetDHCPProfileListQuery,
  useGetDhcpTemplateListQuery,
  useGetVenueTemplateMeshQuery,
  useVenueDefaultRegulatoryChannelsQuery,
  useGetVenueTemplateDefaultRegulatoryChannelsQuery
} from '@acx-ui/rc/services'
import {
  APMeshRole,
  DHCPSaveData,
  Mesh,
  VenueSettings,
  generateAlphanumericString,
  useConfigTemplate,
  VenueDefaultRegulatoryChannels
} from '@acx-ui/rc/utils'
import { validationMessages } from '@acx-ui/utils'

import {
  useVenueConfigTemplateMutationFnSwitcher,
  useVenueConfigTemplateQueryFnSwitcher
} from '../../../../venueConfigTemplateApiSwitcher'
import { VenueEditContext, VenueWifiConfigItemProps } from '../../../index'

import { ErrorMessageDiv, MeshInfoBlock, MeshPassphraseDiv, MeshSsidDiv, ZeroTouchMeshDiv } from './styledComponents'

const LABEL_WIDTH = '180px'

const isSupport6G = (channels?: VenueDefaultRegulatoryChannels) : boolean => {
  if (!channels || !channels['6GChannels']) return false
  return Object.keys(channels['6GChannels']).length > 0
}

const MeshInfoIcon = () => {
  const { $t } = useIntl()

  return <Tooltip.Info isFilled
    title={
      $t({ defaultMessage: 'To prevent networking issues, you can change this property only once, when activating the mesh option. It is highly recommended not to change them unless there is an urgent operational need.' })
    }
  />
}

export type MeshCompatibilityProps = {
  compatibilityEnabled: boolean,
  venueId: string
}

const Mesh6GhzInfoIcon = (props: MeshCompatibilityProps) => {
  const { $t } = useIntl()
  const { compatibilityEnabled, venueId } = props
  const [mesh5g6gOnlyDrawerVisible, setMesh5g6gOnlyDrawerVisible] = useState(false)

  const mesh6GhzTitle = $t({ defaultMessage: 'When selecting the 6GHz radio to link other mesh APs, 2R APs and 3R APs will form mesh networks independently, with 2R APs forming on the 5GHz band and 3R APs (2/5/6) forming on the 6GHz band.' })

  return compatibilityEnabled ?
    <>
      <ApCompatibilityToolTip
        title={mesh6GhzTitle}
        showDetailButton
        placement='top'
        onClick={() => setMesh5g6gOnlyDrawerVisible(true)}
        icon={<Tooltip.Info iconStyle={{
          position: 'absolute',
          bottom: '0px'
        }}
        isFilled />}
      />
      <ApCompatibilityDrawer
        visible={mesh5g6gOnlyDrawerVisible}
        type={ApCompatibilityType.VENUE}
        venueId={venueId}
        featureName={InCompatibilityFeatures.MESH_5G_ONLY_6G_ONLY}
        onClose={() => setMesh5g6gOnlyDrawerVisible(false)}
      />
    </>
    :
    <Tooltip.Info iconStyle={{
      position: 'absolute',
      bottom: '0px'
    }}
    isFilled
    title={
      mesh6GhzTitle
    }
    />
}

const Mesh5GhzInfoIcon = (props: MeshCompatibilityProps) => {
  const { $t } = useIntl()
  const { compatibilityEnabled, venueId } = props
  const [mesh5g6gOnlyDrawerVisible, setMesh5g6gOnlyDrawerVisible] = useState(false)

  const mesh5GhzTitle = $t({ defaultMessage: 'When selecting the 5GHz radio to link other mesh APs, 2R APs (2/6) will form mesh on the 6GHz band.' })

  return compatibilityEnabled ?
    <>
      <ApCompatibilityToolTip
        title={mesh5GhzTitle}
        showDetailButton
        placement='top'
        onClick={() => setMesh5g6gOnlyDrawerVisible(true)}
        icon={<Tooltip.Info iconStyle={{
          position: 'absolute',
          bottom: '0px'
        }}
        isFilled />}
      />
      <ApCompatibilityDrawer
        visible={mesh5g6gOnlyDrawerVisible}
        type={ApCompatibilityType.VENUE}
        venueId={venueId}
        featureName={InCompatibilityFeatures.MESH_5G_ONLY_6G_ONLY}
        onClose={() => setMesh5g6gOnlyDrawerVisible(false)}
      />
    </>
    :
    <Tooltip.Info iconStyle={{
      position: 'absolute',
      bottom: '0px'
    }}
    isFilled
    title={
      mesh5GhzTitle
    }
    />
}

const useVenueWifiSettings = (venueId: string | undefined): VenueSettings | undefined => {
  const { isTemplate } = useConfigTemplate()
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
  const enableTemplateRbac = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const resolvedRbacEnabled = isTemplate ? enableTemplateRbac : isWifiRbacEnabled
  const isWifiMeshIndependents56GEnable = useIsSplitOn(Features.WIFI_MESH_CONFIGURATION_FOR_5G_6G_ONLY)

  const { data: venueSettings } = useVenueConfigTemplateQueryFnSwitcher<VenueSettings>({
    useQueryFn: useGetVenueSettingsQuery,
    useTemplateQueryFn: useGetVenueTemplateSettingsQuery,
    skip: resolvedRbacEnabled
  })

  const queryPayload = {
    fields: ['id', 'venueIds'],
    filters: { venueIds: [venueId] }
  }
  const { data: dhcpList } = useVenueConfigTemplateQueryFnSwitcher<DHCPSaveData[]>({
    useQueryFn: useGetDHCPProfileListQuery,
    useTemplateQueryFn: useGetDhcpTemplateListQuery,
    skip: !resolvedRbacEnabled,
    payload: queryPayload,
    templatePayload: queryPayload,
    enableRbac: resolvedRbacEnabled
  })

  const { data: venueMeshSettings } = useVenueConfigTemplateQueryFnSwitcher<Mesh>({
    useQueryFn: useGetVenueMeshQuery,
    useTemplateQueryFn: useGetVenueTemplateMeshQuery,
    skip: !resolvedRbacEnabled,
    extraQueryArgs: { isWifiMeshIndependents56GEnable }
  })

  const rbacVerData = useMemo(() => {
    return {
      dhcpServiceSetting: { enabled: !!dhcpList?.[0] },
      mesh: venueMeshSettings
    } as VenueSettings
  }, [venueMeshSettings, dhcpList])

  return resolvedRbacEnabled
    ? ((venueMeshSettings && dhcpList)
      ? rbacVerData
      : undefined)
    : venueSettings
}

export function MeshNetwork (props: VenueWifiConfigItemProps) {
  const { $t } = useIntl()
  const params = useParams()
  const { isTemplate } = useConfigTemplate()
  const { isAllowEdit=true } = props
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
  const isConfigTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const resolvedRbacEnabled = isTemplate ? isConfigTemplateRbacEnabled : isWifiRbacEnabled
  const isWifiMeshIndependents56GEnable = useIsSplitOn(Features.WIFI_MESH_CONFIGURATION_FOR_5G_6G_ONLY)
  const isR370ToggleEnable = useIsSplitOn(Features.WIFI_R370_TOGGLE)
  const {
    editContextData,
    setEditContextData,
    editNetworkingContextData,
    setEditNetworkingContextData
  } = useContext(VenueEditContext)
  const { setReadyToScroll } = useContext(AnchorContext)

  const supportZeroTouchMesh = useIsSplitOn(Features.ZERO_TOUCH_MESH)

  const [apList] = useLazyApListQuery()
  const [updateVenueMesh, { isLoading: isUpdatingVenueMesh }] = useVenueConfigTemplateMutationFnSwitcher(
    useUpdateVenueMeshMutation,
    useUpdateVenueTemplateMeshMutation
  )

  const defaultToolTip = $t({ defaultMessage: 'Not available' })
  const [isAllowEnableMesh, setIsAllowEnableMesh] = useState(true)
  const [hasMeshAPs, setHasMeshAPs] = useState(false)
  const [isReadOnly, setIsReadOnly] = useState(false)
  const [meshEnabled, setMeshEnabled] = useState(false)
  const [meshSsid, setMeshSsid]= useState<string>()
  const [isSsidEditMode, setIsSsidEditMode] = useState(false)
  const [ssidError, setSsidError] = useState<string>()

  const [meshPassphrase, setMeshPassphrase] = useState<string>()
  const [isPassphraseEditMode, setIsPassphraseEditMode] = useState(false)
  const [passphraseError, setPassphraseError] = useState<string>()

  const [meshRadioType, setMeshRadioType] = useState<string>(
    (isWifiMeshIndependents56GEnable ? '5-6-GHz' : '5-GHz'))
  const [meshZeroTouchEnabled, setMeshZeroTouchEnabled] = useState(false)

  const origSsid = useRef<string>()
  const origPassphrase = useRef<string>()
  const isUserChanged = useRef(false)

  const [meshToolTipDisabledText, setMeshToolTipDisabledText] = useState(defaultToolTip)

  const wifiSettingsData = useVenueWifiSettings(params.venueId)

  // available channels from this venue country code
  const { data: supportChannelsData } =
    useVenueConfigTemplateQueryFnSwitcher<VenueDefaultRegulatoryChannels>({
      useQueryFn: useVenueDefaultRegulatoryChannelsQuery,
      useTemplateQueryFn: useGetVenueTemplateDefaultRegulatoryChannelsQuery,
      enableRbac: isWifiRbacEnabled
    })
  const isSupport6GRadio = isSupport6G(supportChannelsData)

  useEffect(() => {
    if (wifiSettingsData) {
      const { mesh, dhcpServiceSetting } = wifiSettingsData
      const { enabled = false, ssid, passphrase, radioType, zeroTouchEnabled = false } = mesh || {}
      setMeshEnabled(enabled)
      setIsReadOnly(enabled)

      const enableDhcpSetting = dhcpServiceSetting && dhcpServiceSetting.enabled
      if (enableDhcpSetting) {
        setMeshToolTipDisabledText($t({ defaultMessage: 'You cannot activate the Mesh Network on this <venueSingular></venueSingular> because it already has enable DHCP settings' }))
      } else {
        setMeshToolTipDisabledText('')
      }
      setIsAllowEnableMesh(!enableDhcpSetting as boolean) //TODO: this.rbacService.isRoleAllowed('UpdateMeshButton')

      if (enabled) {
        checkMeshAPs()
      }

      const ssidInitValue = ssid || `Mesh-${generateAlphanumericString(8)}`
      setMeshSsid(ssidInitValue)

      const passphraseInitValue = passphrase || generateAlphanumericString(63)
      setMeshPassphrase(passphraseInitValue)

      setMeshRadioType(radioType || '5-GHz')
      setMeshZeroTouchEnabled(zeroTouchEnabled)

      setReadyToScroll?.(r => [...(new Set(r.concat('Mesh-Network')))])
    }
  }, [wifiSettingsData])

  const checkMeshAPs = async () => {
    const payload = {
      entityType: 'apsList',
      fields: ['serialNumber', 'meshRole'],
      filters: {
        venueId: [params.venueId],
        meshRole: [APMeshRole.MAP, APMeshRole.EMAP]
      },
      pageSize: 1
    }
    const { data } = await apList({ params, payload, enableRbac: isWifiRbacEnabled }, true)
    setHasMeshAPs(!!(data?.totalCount && data.totalCount > 0))
  }

  useEffect(() => {
    if (isUserChanged.current) {
      setEditContextData && setEditContextData({
        ...editContextData,
        unsavedTabKey: 'networking',
        tabTitle: $t({ defaultMessage: 'Networking' }),
        isDirty: true
      })
      setEditNetworkingContextData && setEditNetworkingContextData({
        ...editNetworkingContextData,
        updateMesh: handleUpdateMeshSetting
      })

      isUserChanged.current = false
    }

  }, [meshEnabled, meshSsid, meshPassphrase, meshRadioType, meshZeroTouchEnabled])


  // mesh ssid
  const validateSsid = (v: string) => {
    let errorMsg = ''
    if (!v || v.length === 0) {
      errorMsg = $t({ defaultMessage: 'Please enter the Mesh Network Name' })
    } else if (v.length < 1 || v.length > 32) {
      errorMsg = $t({ defaultMessage: 'The Mesh Network Name must be between 1 and 32 characters' })
    } else if (v.includes('`') || v.includes('$(')) {
      errorMsg = $t(validationMessages.hasGraveAccentAndDollarSign)
    } else if (v.endsWith(' ') || v.startsWith(' ')) {
      errorMsg = $t(validationMessages.leadingTrailingWhitespace)
    } else {
      const re = new RegExp('(^[!-~]([ -~]){0,30}[!-~]$)|(^[!-~]$)')
      if (!re.test(v)) {
        errorMsg = $t({ defaultMessage: 'The Mesh Network Name is invalid' })
      }
    }

    setSsidError(errorMsg)

    return (errorMsg === '')
  }

  const handleSsidEdit = () => {
    origSsid.current = meshSsid
    setIsSsidEditMode(true)
  }

  const handleSsidSave = () => {
    setIsSsidEditMode(false)
  }

  const handleSsidCancel = () => {
    const ssid = origSsid.current || ''
    setMeshSsid(origSsid.current)
    setIsSsidEditMode(false)

    validateSsid(ssid)
  }

  const handleSsidChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSsidEditMode) return

    const newSsid = e.target.value
    setMeshSsid(newSsid)
    isUserChanged.current = true

    validateSsid(newSsid)
  }

  // mesh phrase
  const validatePassphrase = (v: string) => {
    let errorMsg = ''
    if (!v || v.length === 0) {
      errorMsg = $t({ defaultMessage: 'Please enter Mesh PSK' })
    } else if (v.length < 8 || v.length > 64) {
      errorMsg = $t({ defaultMessage: 'PSK must be between 8 and 63 characters or 64 hexadecimal number' })
    } else if (v.endsWith(' ') || v.startsWith(' ')) {
      errorMsg = $t(validationMessages.leadingTrailingWhitespace)
    } else {
      const re = new RegExp('(^[!-~]([ -~]){6,61}[!-~]$)|(^([0-9a-fA-F]){64}$)')
      if (!re.test(v)) {
        errorMsg = $t({ defaultMessage: 'The PSK is invalid' })
      }
    }

    setPassphraseError(errorMsg)

    return (errorMsg === '')
  }

  const handlePassphraseEdit = () => {
    origPassphrase.current = meshPassphrase
    setIsPassphraseEditMode(true)
  }

  const handleSavePassphrase = () => {
    setIsPassphraseEditMode(false)
  }

  const handleCancelPassphrase = () => {
    const passphrase = origPassphrase.current || ''
    setMeshPassphrase(passphrase)
    setIsPassphraseEditMode(false)
    validatePassphrase(passphrase)
  }

  const handlePassphraseChanged = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isPassphraseEditMode) return

    const newPassphrase = e.target.value
    setMeshPassphrase(newPassphrase)
    isUserChanged.current = true

    validatePassphrase(newPassphrase)
  }

  const handleGenPassphrase = () => {
    const newPassphrase = generateAlphanumericString(63)
    setMeshPassphrase(newPassphrase)
    isUserChanged.current = true

    validatePassphrase(newPassphrase)
  }

  const handleRadioTypeChanged = (e: RadioChangeEvent) => {
    const newRadioType = e.target.value
    setMeshRadioType(newRadioType)
    isUserChanged.current = true
  }

  const handleUpdateMeshSetting = async () => {

    try {
      let meshData: Mesh = { enabled: meshEnabled }

      if (meshEnabled) {
        meshData = { ...meshData,
          ssid: meshSsid,
          passphrase: meshPassphrase,
          radioType: meshRadioType,
          zeroTouchEnabled: meshZeroTouchEnabled
        }

        if (!validateSsid(meshSsid || '')) {
          showActionModal({
            type: 'error',
            content: $t({ defaultMessage: 'Invalid Mesh Network Name' })
          })
          return
        } else if (!validatePassphrase(meshPassphrase || '')) {
          showActionModal({
            type: 'error',
            content: $t({ defaultMessage: 'Invalid Mesh PSK' })
          })
          return
        }
      }

      await updateVenueMesh({ params, payload: meshData, enableRbac: resolvedRbacEnabled, isWifiMeshIndependents56GEnable })

      setIsSsidEditMode(false)
      setIsPassphraseEditMode(false)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const toggleMesh = (checked: boolean) => {
    setMeshEnabled(checked)
    isUserChanged.current = true
  }

  const toggleZeroTouchMesh = (checked: boolean) => {
    setMeshZeroTouchEnabled(checked)
    isUserChanged.current = true
  }

  return (<Loader states={[{
    isLoading: !wifiSettingsData || meshToolTipDisabledText === defaultToolTip,
    isFetching: isUpdatingVenueMesh
  }]}>
    <StepsFormLegacy.FieldLabel width={LABEL_WIDTH}>
      {$t({ defaultMessage: 'Mesh Network' })}
      {(hasMeshAPs && meshEnabled)?
        <Space direction='vertical' style={{ width: '400px', paddingBottom: '10px' }}>
          <div>{$t({ defaultMessage: 'On' })}</div>
          <div>{
            $t({ defaultMessage: 'Since there are active mesh links in this <venueSingular></venueSingular>, in order prevent networking issues, you cannot turn mesh networking off' })}
          </div>
        </Space> :
        <Form.Item
          valuePropName='checked'
          initialValue={meshEnabled}
          children={<Tooltip title={meshToolTipDisabledText}>
            <Switch
              data-testid='mesh-switch'
              checked={meshEnabled}
              disabled={!isAllowEdit || !isAllowEnableMesh}
              onClick={toggleMesh}
            />
          </Tooltip>}
        />
      }
    </StepsFormLegacy.FieldLabel>
    {meshEnabled && <>
      <MeshInfoBlock>
        <ul>
          <li>
            {
              $t({ defaultMessage: 'Enabling mesh for a <venueSingular></venueSingular> creates a new WLAN for mesh communication between Access Points' })
            }
          </li>
          <li>
            {
              $t({ defaultMessage: 'Enabling mesh for a <venueSingular></venueSingular> is a global configuration and once mesh links are formed (automatically), it cannot be undone.' })
            }
          </li>
        </ul>
      </MeshInfoBlock>
      <MeshSsidDiv labelWidth={LABEL_WIDTH} isEditMode={isSsidEditMode}>
        {$t({ defaultMessage: 'Mesh Network Name' })}
        <Form.Item children={
          <Input
            bordered={isSsidEditMode}
            value={meshSsid}
            onChange={handleSsidChanged}
          />
        }
        />
        { !isSsidEditMode ? <>
          <Button type='link' disabled={!isAllowEdit || isReadOnly} onClick={handleSsidEdit}>
            {$t({ defaultMessage: 'Change' })}
          </Button>
          <MeshInfoIcon />
        </> : <>
          <Button type='link' disabled={!!ssidError} onClick={handleSsidSave}>
            {$t({ defaultMessage: 'Save' })}
          </Button>
          <Button type='link' onClick={handleSsidCancel}>
            {$t({ defaultMessage: 'Cancel' })}
          </Button>
        </>
        }
      </MeshSsidDiv>
      {ssidError &&
        <StepsFormLegacy.FieldLabel width={LABEL_WIDTH}>
          <div />
          <ErrorMessageDiv>
            {ssidError}
          </ErrorMessageDiv>
        </StepsFormLegacy.FieldLabel>
      }
      <MeshPassphraseDiv labelWidth={LABEL_WIDTH} isEditMode={isPassphraseEditMode}>
        {$t({ defaultMessage: 'Mesh PSK' })}
        <Form.Item children={
          <Input.TextArea
            rows={3}
            maxLength={64}
            bordered={isPassphraseEditMode}
            value={meshPassphrase}
            onChange={handlePassphraseChanged}
          />}
        />
        { !isPassphraseEditMode ? <>
          <Button type='link' disabled={!isAllowEdit || isReadOnly} onClick={handlePassphraseEdit}>
            {$t({ defaultMessage: 'Change' })}
          </Button>
          <MeshInfoIcon />
        </> : <>
          <Button type='link' onClick={handleGenPassphrase}>
            {$t({ defaultMessage: 'Generate' })}
          </Button>
          <Button type='link' disabled={!!passphraseError} onClick={handleSavePassphrase}>
            {$t({ defaultMessage: 'Save' })}
          </Button>
          <Button type='link' onClick={handleCancelPassphrase}>
            {$t({ defaultMessage: 'Cancel' })}
          </Button>
        </>
        }
      </MeshPassphraseDiv>
      {passphraseError &&
        <StepsFormLegacy.FieldLabel width={LABEL_WIDTH}>
          <div />
          <ErrorMessageDiv>
            {passphraseError}
          </ErrorMessageDiv>
        </StepsFormLegacy.FieldLabel>
      }
      <StepsFormLegacy.FieldLabel width={LABEL_WIDTH}>
        {$t({ defaultMessage: 'Mesh Radio' })}
        <Form.Item >
          <Radio.Group
            disabled={!isAllowEdit || isReadOnly}
            value={meshRadioType}
            onChange={handleRadioTypeChanged}>
            { isWifiMeshIndependents56GEnable ? (
              <Space direction='vertical'>
                <Radio value='5-6-GHz' data-testid='radio56'>
                  {$t({ defaultMessage: '5 & 6 GHz' })}
                </Radio>
                <Radio value='5-GHz' data-testid='radio5'>
                  {$t({ defaultMessage: '5 GHz' })}
                  <Mesh5GhzInfoIcon
                    compatibilityEnabled={isR370ToggleEnable}
                    venueId={params.venueId!}/>
                </Radio>
                {
                  isSupport6GRadio ? (
                    <Radio value='6-GHz' data-testid='radio6'>
                      {$t({ defaultMessage: '6 GHz' })}
                      <Mesh6GhzInfoIcon
                        compatibilityEnabled={isR370ToggleEnable}
                        venueId={params.venueId!}
                      />
                    </Radio>
                  ) : (
                    <Tooltip
                      title={$t({
                        defaultMessage: 'Mesh radio with 6GHz is not supported in the current country.'
                      })}
                    >
                      <Radio disabled={true} value='6-GHz' data-testid='radio6'>
                        {$t({ defaultMessage: '6 GHz' })}
                      </Radio>
                    </Tooltip>
                  )
                }
                <Radio value='2.4-GHz' data-testid='radio24'>
                  {$t({ defaultMessage: '2.4 GHz' })}
                </Radio>
              </Space>
            ) : (
              <Space direction='vertical'>
                <Radio value='5-GHz'>{$t({ defaultMessage: '5 & 6 GHz' })}</Radio>
                <Radio value='2.4-GHz'>{$t({ defaultMessage: '2.4 GHz' })}</Radio>
              </Space>
            )}
          </Radio.Group>
        </Form.Item>
      </StepsFormLegacy.FieldLabel>
      { supportZeroTouchMesh &&
        <ZeroTouchMeshDiv labelWidth={LABEL_WIDTH}>
          {$t({ defaultMessage: 'Zero Touch Mesh' })}
          <Form.Item
            valuePropName='checked'
            initialValue={meshZeroTouchEnabled}
            children={
              <Switch
                data-testid='zero-touch-mesh-switch'
                checked={meshZeroTouchEnabled}
                disabled={!isAllowEdit || !isAllowEnableMesh}
                onClick={toggleZeroTouchMesh}
              />
            }
          />
          <Tooltip.Info isFilled
            title={$t({
              defaultMessage: '"Zero touch mesh" is an automated networking technology that allows for seamless setup and expansion of mesh networks without manual intervention. This option is only available when Mesh is enabled for 5 & 6 GHz networks'
            })}
          />
        </ZeroTouchMeshDiv>
      }
    </>}
  </Loader>
  )
}
