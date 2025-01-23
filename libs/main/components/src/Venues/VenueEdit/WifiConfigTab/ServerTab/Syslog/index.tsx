import { useContext, useEffect, useState } from 'react'

import { Button, Form, Select, Space, Switch, Typography } from 'antd'
import { isEqual }                                         from 'lodash'
import { useIntl }                                         from 'react-intl'

import { AnchorContext, Loader, StepsFormLegacy }          from '@acx-ui/components'
import { Features, useIsSplitOn }                          from '@acx-ui/feature-toggle'
import { PROFILE_MAX_COUNT, usePathBasedOnConfigTemplate } from '@acx-ui/rc/components'
import {
  useGetSyslogPolicyTemplateListQuery,
  useGetVenueSyslogApQuery,
  useGetVenueTemplateSyslogSettingsQuery,
  useSyslogPolicyListQuery,
  useUpdateVenueSyslogApMutation,
  useUpdateVenueTemplateSyslogSettingsMutation
} from '@acx-ui/rc/services'
import {
  facilityLabelMapping,
  flowLevelLabelMapping,
  FacilityEnum,
  FlowLevelEnum,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType,
  SyslogPolicyListType,
  useConfigTemplateQueryFnSwitcher,
  TableResult,
  VenueSyslogSettingType,
  useConfigTemplateMutationFnSwitcher,
  useTemplateAwarePolicyPermission
} from '@acx-ui/rc/utils'
import {
  useLocation,
  useNavigate,
  useParams
} from '@acx-ui/react-router-dom'

import { VenueEditContext, VenueWifiConfigItemProps } from '../../..'
import * as UI                                        from '../../styledComponents'



export interface VenueSettings {
  serviceProfileId?: string,
  enabled?: boolean
}

export function Syslog (props: VenueWifiConfigItemProps) {
  const { Paragraph } = Typography
  const { $t } = useIntl()
  const { venueId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const toPolicyPath = usePathBasedOnConfigTemplate('')
  const { isAllowEdit=true } = props
  const {
    editContextData,
    setEditContextData,
    editServerContextData,
    setEditServerContextData
  } = useContext(VenueEditContext)
  const { setReadyToScroll } = useContext(AnchorContext)
  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const enableTemplateRbac = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const {
    data: syslogPolicyList,
    isLoading: isSyslogPolicyListLoading
  } = useConfigTemplateQueryFnSwitcher<TableResult<SyslogPolicyListType>>({
    useQueryFn: useSyslogPolicyListQuery,
    useTemplateQueryFn: useGetSyslogPolicyTemplateListQuery,
    payload: { page: 1, pageSize: PROFILE_MAX_COUNT },
    enableRbac
  })

  const {
    data: venueSyslogSettings,
    isLoading: isVenueSyslogSettingsLoading
  } = useConfigTemplateQueryFnSwitcher<VenueSyslogSettingType>({
    useQueryFn: useGetVenueSyslogApQuery,
    useTemplateQueryFn: useGetVenueTemplateSyslogSettingsQuery,
    enableRbac
  })

  const [
    updateVenueSyslog,
    { isLoading: isUpdatingVenueSyslog }
  ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useUpdateVenueSyslogApMutation,
    useTemplateMutationFn: useUpdateVenueTemplateSyslogSettingsMutation
  })

  const apSyslogOptions = syslogPolicyList?.data?.map(m => ({ label: m.name, value: m.id })) ?? []
  const [venueSyslogOrinData, setVenueSyslogOrinData] = useState({} as VenueSettings)
  const [enableServerRadio, setEnableServerRadio] = useState(false)
  const [defaultSyslogValue, setDefaultSyslogValue] = useState('')
  const [syslogValue, setSyslogValue] = useState<SyslogPolicyListType>()

  useEffect(() => {
    if (venueSyslogSettings && !isVenueSyslogSettingsLoading) {
      setEnableServerRadio(venueSyslogSettings?.enabled ?? false)
      // eslint-disable-next-line max-len
      setVenueSyslogOrinData({ serviceProfileId: venueSyslogSettings.serviceProfileId, enabled: venueSyslogSettings.enabled })
      setDefaultSyslogValue(venueSyslogSettings.serviceProfileId ?? '')

      if (syslogPolicyList?.data) {
        // eslint-disable-next-line max-len
        setSyslogValue(syslogPolicyList.data.find(p => p.id === venueSyslogSettings?.serviceProfileId))

        setReadyToScroll?.(r => [...(new Set(r.concat('Syslog-Server')))])
      }
    }
  }, [venueSyslogSettings, syslogPolicyList, setReadyToScroll])

  const handleEnableChange = (checked: boolean) => {
    setEnableServerRadio(checked)
    const newData = { serviceProfileId: defaultSyslogValue, enabled: checked }
    setEditContextData({
      ...editContextData,
      unsavedTabKey: 'servers',
      tabTitle: $t({ defaultMessage: 'Network Control' }),
      isDirty: !isEqual(newData, venueSyslogOrinData)
    })

    setEditServerContextData && setEditServerContextData({
      ...editServerContextData,
      updateSyslog: () => updateSyslog(newData),
      discardSyslog: () => discardSyslog(venueSyslogOrinData)
    })
  }

  const handleSyslogChange = (id: string) => {
    setDefaultSyslogValue(id)
    setSyslogValue(syslogPolicyList?.data?.find(p => p.id === id))
    const newData = { serviceProfileId: id, enabled: enableServerRadio }
    setEditContextData({
      ...editContextData,
      unsavedTabKey: 'servers',
      tabTitle: $t({ defaultMessage: 'Network Control' }),
      isDirty: !isEqual(newData, venueSyslogOrinData)
    })

    setEditServerContextData && setEditServerContextData({
      ...editServerContextData,
      updateSyslog: () => updateSyslog(newData),
      discardSyslog: () => discardSyslog(venueSyslogOrinData)
    })
  }

  const updateSyslog = async (data?: VenueSettings) => {
    try {
      setEditContextData({
        ...editContextData,
        isDirty: false,
        hasError: false
      })
      const payload = data
      if (payload) {
        await updateVenueSyslog({
          params: { venueId },
          payload,
          enableRbac, enableTemplateRbac
        }).unwrap()
      }
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const discardSyslog = async (orinData: VenueSettings) => {
    setEnableServerRadio(orinData.enabled ?? false)
  }

  const hasAddProfilePermission = useTemplateAwarePolicyPermission(
    PolicyType.SYSLOG, PolicyOperation.CREATE
  )

  return (
    <Loader states={[{
      isLoading: isSyslogPolicyListLoading,
      isFetching: isUpdatingVenueSyslog
    }]}>
      <Space align='start'>
        <StepsFormLegacy.FieldLabel
          width='max-content'
          style={{ height: '32px', display: 'flex', alignItems: 'center' }}
        >
          <span>{$t({ defaultMessage: 'Enable Server' })}</span>
          <Switch
            data-testid='syslog-switch'
            disabled={!isAllowEdit}
            checked={enableServerRadio}
            onClick={(checked) => {
              handleEnableChange(checked)
            }}
            style={{ marginLeft: '20px' }}
          />
        </StepsFormLegacy.FieldLabel>
        {enableServerRadio &&
        <Space direction='vertical'>
          <Form.Item style={{ margin: '0' }}>
            <Select
              data-testid='syslog-select'
              disabled={!isAllowEdit}
              defaultValue={defaultSyslogValue}
              options={[
                { label: $t({ defaultMessage: 'Select Service...' }), value: '' },
                ...apSyslogOptions
              ]}
              onChange={(value => {
                handleSyslogChange(value)
              })}
              style={{ width: '200px' }}
            />
            { isAllowEdit && hasAddProfilePermission &&
            <Button type='link'
              style={{ marginLeft: '20px' }}
              onClick={async () => {
                await setEditContextData({
                  ...editContextData,
                  isDirty: false,
                  hasError: false
                })

                const policyRoutePath = getPolicyRoutePath({
                  type: PolicyType.SYSLOG,
                  oper: PolicyOperation.CREATE
                })
                // eslint-disable-next-line max-len
                await navigate(`${toPolicyPath.pathname}/${policyRoutePath}`, { state: { from: location } })
              }}
            >
              {$t({ defaultMessage: 'Add Server Profile' })}
            </Button> }
          </Form.Item>
          {defaultSyslogValue &&
          <UI.FieldGroup>
            <label style={{ height: '33px' }}>
              {$t({ defaultMessage: 'Primary Server:' })}
            </label>
            <Paragraph>
              {syslogValue?.primaryServer ?? ''}
            </Paragraph>
            <label style={{ height: '33px' }}>
              {$t({ defaultMessage: 'Secondary Server:' })}
            </label>
            <Paragraph>
              {syslogValue?.secondaryServer ?? ''}
            </Paragraph>
            <label style={{ height: '33px' }}>
              {$t({ defaultMessage: 'Event Facility:' })}
            </label>
            <Paragraph>
              {// eslint-disable-next-line max-len
                syslogValue?.facility ? $t(facilityLabelMapping[syslogValue?.facility as FacilityEnum]) : ''}
            </Paragraph>
            <label style={{ height: '33px' }}>
              {$t({ defaultMessage: 'Send Logs:' })}
            </label>
            <Paragraph>
              {// eslint-disable-next-line max-len
                syslogValue?.flowLevel ? $t(flowLevelLabelMapping[syslogValue?.flowLevel as FlowLevelEnum]) : ''}
            </Paragraph>
          </UI.FieldGroup>
          }
        </Space>
        }
      </Space>
    </Loader>
  )
}

