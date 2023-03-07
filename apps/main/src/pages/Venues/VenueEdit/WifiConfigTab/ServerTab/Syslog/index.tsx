import { useContext, useEffect, useState } from 'react'

import { Form, Select, Space, Switch } from 'antd'
import { isEqual }                     from 'lodash'
import { useIntl }                     from 'react-intl'

import { Loader, StepsForm }       from '@acx-ui/components'
import { Features, useIsSplitOn }  from '@acx-ui/feature-toggle'
import {
  useGetSyslogPolicyListQuery,
  useGetVenueSyslogApQuery,
  useUpdateVenueSyslogApMutation
} from '@acx-ui/rc/services'
import {
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType
} from '@acx-ui/rc/utils'
import {
  TenantLink,
  useParams
} from '@acx-ui/react-router-dom'

import { VenueEditContext } from '../../../'

export interface VenueSettings {
  serviceProfileId?: string,
  enabled?: boolean
}

export function Syslog () {
  const { $t } = useIntl()
  const { tenantId, venueId } = useParams()

  const unreleased = useIsSplitOn(Features.UNRELEASED)

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
  const defaultSyslogValue = venueSettings?.data?.serviceProfileId ?? ''
  const [venueSyslogOrinData, setVenueSyslogOrinData] = useState({} as VenueSettings)
  const [enableServerRadio, setEnableServerRadio] = useState(false)

  useEffect(() => {
    if (!venueSettings?.isLoading) {
      const { data } = venueSettings
      setEnableServerRadio(data?.enabled ?? false)
      setVenueSyslogOrinData({ serviceProfileId: data?.serviceProfileId, enabled: data?.enabled })
    }
  }, [venueSettings])

  const handleEnableChange = (checked: boolean) => {
    setEnableServerRadio(checked)
    const newData = { serviceProfileId: defaultSyslogValue, enabled: checked }
    setEditContextData({
      ...editContextData,
      unsavedTabKey: 'servers',
      tabTitle: $t({ defaultMessage: 'Servers' }),
      isDirty: !isEqual(newData, venueSyslogOrinData)
    })

    setEditServerContextData && setEditServerContextData({
      ...editServerContextData,
      updateSyslog: () => updateSyslog(newData),
      discardSyslog: () => discardSyslog(venueSyslogOrinData)
    })
  }

  const handleSyslogChange = (id: string) => {
    const newData = { serviceProfileId: id, enabled: enableServerRadio }
    setEditContextData({
      ...editContextData,
      unsavedTabKey: 'servers',
      tabTitle: $t({ defaultMessage: 'Servers' }),
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
      <Space>
        <StepsForm.FieldLabel
          width='max-content'
          style={{ height: '48px', display: 'flex', alignItems: 'center' }}
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
        </StepsForm.FieldLabel>
        {enableServerRadio &&
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
          {unreleased &&
          <TenantLink
            to={getPolicyRoutePath({
              type: PolicyType.SYSLOG,
              oper: PolicyOperation.CREATE
            })}
            style={{ marginLeft: '20px' }}
          >
            {$t({ defaultMessage: 'Add Server Profile' })}
          </TenantLink>
          }
        </Form.Item>
        }
      </Space>
    </Loader>
  )
}

