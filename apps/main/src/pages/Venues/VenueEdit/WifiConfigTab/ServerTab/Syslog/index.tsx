import { useContext, useEffect, useState } from 'react'

import { Form, Select, Space, Switch, Typography } from 'antd'
import { isEqual }                                 from 'lodash'
import { useIntl }                                 from 'react-intl'

import { Loader, StepsFormLegacy } from '@acx-ui/components'
import {
  useGetSyslogPolicyListQuery,
  useGetVenueSyslogApQuery,
  useUpdateVenueSyslogApMutation
} from '@acx-ui/rc/services'
import {
  facilityLabelMapping,
  flowLevelLabelMapping,
  FacilityEnum,
  FlowLevelEnum,
  SyslogPolicyDetailType,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType
} from '@acx-ui/rc/utils'
import {
  TenantLink,
  useParams
} from '@acx-ui/react-router-dom'

import { VenueEditContext } from '../../../'
import * as UI              from '../../styledComponents'


export interface VenueSettings {
  serviceProfileId?: string,
  enabled?: boolean
}

export function Syslog () {
  const { Paragraph } = Typography
  const { $t } = useIntl()
  const { tenantId, venueId } = useParams()
  const {
    editContextData,
    setEditContextData,
    editServerContextData,
    setEditServerContextData
  } = useContext(VenueEditContext)

  const syslogPolicyList = useGetSyslogPolicyListQuery({ params: { tenantId } })
  const venueSettings = useGetVenueSyslogApQuery({ params: { venueId } })
  const [updateVenueSyslog, {
    isLoading: isUpdatingVenueSyslog }] = useUpdateVenueSyslogApMutation()

  const apSyslogOptions = syslogPolicyList?.data?.map(m => ({ label: m.name, value: m.id })) ?? []
  const [venueSyslogOrinData, setVenueSyslogOrinData] = useState({} as VenueSettings)
  const [enableServerRadio, setEnableServerRadio] = useState(false)
  const [defaultSyslogValue, setDefaultSyslogValue] = useState('')
  const [syslogValue, setSyslogValue] = useState({} as SyslogPolicyDetailType | undefined)

  useEffect(() => {
    const { data } = venueSettings
    if (!venueSettings?.isLoading) {
      setEnableServerRadio(data?.enabled ?? false)
      setVenueSyslogOrinData({ serviceProfileId: data?.serviceProfileId, enabled: data?.enabled })
      setDefaultSyslogValue(data?.serviceProfileId ?? '')
    }
    if (!venueSettings?.isLoading && syslogPolicyList.data) {
      setSyslogValue(syslogPolicyList.data.find(p => p.id === data?.serviceProfileId))
    }
  }, [venueSettings, syslogPolicyList])

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
    setSyslogValue(syslogPolicyList.data?.find(p => p.id === id))
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
          payload
        }).unwrap()
      }
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const discardSyslog = async (orinData: VenueSettings) => {
    setEnableServerRadio(orinData.enabled ?? false)
  }


  return (
    <Loader states={[{
      isLoading: syslogPolicyList.isLoading,
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
            <TenantLink
              to={getPolicyRoutePath({
                type: PolicyType.SYSLOG,
                oper: PolicyOperation.CREATE
              })}
              style={{ marginLeft: '20px' }}
            >
              {$t({ defaultMessage: 'Add Server Profile:' })}
            </TenantLink>
          </Form.Item>
          {defaultSyslogValue &&
          <UI.FieldGroup>
            <label style={{ height: '33px' }}>
              {$t({ defaultMessage: 'Primary Server:' })}
            </label>
            <Paragraph>
              {`${syslogValue?.primary?.server}
              :${syslogValue?.primary?.port} ${syslogValue?.primary?.protocol}`}
            </Paragraph>
            <label style={{ height: '33px' }}>
              {$t({ defaultMessage: 'Secondary Server:' })}
            </label>
            <Paragraph>
              {syslogValue?.secondary?.server ? `${syslogValue?.secondary?.server}
              :${syslogValue?.secondary?.port} ${syslogValue?.secondary?.protocol}` : ''}
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

