import { useContext, useState, useRef, useEffect, Key } from 'react'

import { Col, Divider, Form, Input, Space, Switch } from 'antd'
import { isEqual }                                  from 'lodash'

import { Button, Loader, showToast, StepsForm, StepsFormInstance } from '@acx-ui/components'
import { ConfigurationOutlined }                                   from '@acx-ui/icons'
import {
  useConfigProfilesQuery,
  useVenueSwitchSettingQuery,
  useUpdateVenueSwitchSettingMutation } from '@acx-ui/rc/services'
import { ConfigurationProfile, ProfileTypeEnum, networkWifiIpRegExp, VenueSwitchConfiguration } from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink, useParams }                                                from '@acx-ui/react-router-dom'
import { getIntl }                                                                              from '@acx-ui/utils'

import { VenueEditContext, EditContext } from '../../index'

import { CliProfileDetailModal }                       from './CliProfileDetailModal'
import { ConfigProfileModal }                          from './ConfigProfileModal'
import { RegularProfileDetailModal }                   from './RegularProfileDetailModal'
import { ButtonWrapper, DeleteOutlinedIcon, RowStyle } from './styledComponents'
import { SyslogServerModal }                           from './SyslogServerModal'

export interface FormState {
  changeModalvisible: boolean,
  regularModalvisible: boolean,
  cliModalvisible: boolean,
  syslogModalvisible: boolean,
  cliApplied: boolean,
  configProfiles: ConfigurationProfile[]
}

const defaultState = {
  changeModalvisible: false,
  regularModalvisible: false,
  cliModalvisible: false,
  syslogModalvisible: false,
  cliApplied: false,
  configProfiles: []
}
const defaultFormData = {
  profileId: [],
  dns: [],
  syslogEnabled: false,
  syslogPrimaryServer: '',
  syslogSecondaryServer: ''
}

export function GeneralSettingForm () {
  const { $t } = getIntl()
  const navigate = useNavigate()
  const { tenantId, venueId, activeSubTab } = useParams()
  const basePath = useTenantLink('/venues/')
  const { editContextData, setEditContextData } = useContext(VenueEditContext)

  const formRef = useRef<StepsFormInstance<VenueSwitchConfiguration>>()
  const venueSwitchSetting = useVenueSwitchSettingQuery({ params: { tenantId, venueId } })
  const configProfiles = useConfigProfilesQuery({ params: { tenantId, venueId }, payload: {} })
  const [updateVenueSwitchSetting] = useUpdateVenueSwitchSettingMutation()

  const [formState, setFormState] = useState<FormState>(defaultState)
  const [formData, setFormData] = useState<VenueSwitchConfiguration>(defaultFormData)
  const selectedProfiles = getProfilesByKeys(formState.configProfiles, formData.profileId)

  useEffect(() => {
    // set default data when switching sub tab
    const tab = activeSubTab as keyof EditContext['tempData']
    const data = editContextData?.tempData?.[tab] || undefined
    setEditContextData({
      ...editContextData,
      tabTitle: $t({ defaultMessage: 'General' }),
      oldData: data,
      newData: data,
      isDirty: false,
      updateChanges: handleUpdate,
      setData: setFormData
    })
  }, [navigate])

  useEffect(() => {
    if (venueSwitchSetting?.isSuccess) {
      const { data } = venueSwitchSetting
      setFormState({
        ...formState,
        cliApplied: data?.cliApplied ?? false,
        configProfiles: configProfiles.data ?? []
      })
      setFormData({
        profileId: data.profileId ?? [],
        dns: data.dns ?? [],
        syslogEnabled: data?.syslogEnabled ?? false,
        syslogPrimaryServer: data?.syslogPrimaryServer,
        syslogSecondaryServer: data?.syslogSecondaryServer
      })
      formRef?.current?.setFieldsValue({
        dns: data.dns ?? []
      })
    }
  }, [venueSwitchSetting, configProfiles])

  useEffect(() => {
    const errors = formRef?.current?.getFieldsError()?.map(item => item?.errors)
    const { data } = venueSwitchSetting

    setEditContextData({
      ...editContextData,
      tabKey: activeSubTab,
      tabTitle: $t({ defaultMessage: 'General' }),
      newData: {
        ...formData
      },
      oldData: {
        profileId: data?.profileId ?? [],
        dns: data?.dns ?? [],
        syslogEnabled: data?.syslogEnabled ?? false,
        syslogPrimaryServer: data?.syslogPrimaryServer,
        syslogSecondaryServer: data?.syslogSecondaryServer
      },
      isDirty: editContextData?.oldData ? !isEqual(editContextData?.oldData, formData) : false,
      hasError: errors ? errors.flat()?.length > 0 : false,
      setData: setFormData,
      updateChanges: handleUpdate
    })
  }, [formData])

  const handleSyslogServer = (checked: boolean) => {
    setFormState({
      ...formState,
      syslogModalvisible: checked
    })
    setFormData({
      ...formData,
      dns: formRef?.current?.getFieldsValue()?.dns,
      syslogEnabled: !checked ? !formData.syslogEnabled : false
    })
  }

  const handleUpdate = async (redirect?: boolean) => {
    try {
      setEditContextData({
        ...editContextData,
        oldData: editContextData?.newData,
        isDirty: false
      })
      await updateVenueSwitchSetting({ params: { tenantId }, payload: {
        ...formRef?.current?.getFieldsValue(),
        id: venueId,
        profileId: formData?.profileId,
        syslogEnabled: formData?.syslogEnabled,
        syslogPrimaryServer: formData?.syslogPrimaryServer,
        syslogSecondaryServer: formData?.syslogSecondaryServer
      } })
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
    <Loader states={[{ isLoading: venueSwitchSetting.isLoading || configProfiles.isLoading }]}>
      <StepsForm
        formRef={formRef}
        onFinish={() => handleUpdate(true)}
        onCancel={() => navigate({
          ...basePath,
          pathname: `${basePath.pathname}/${venueId}/venue-details/overview`
        })}
        buttonLabel={{ submit: $t({ defaultMessage: 'Save' }) }}
      >
        <StepsForm.StepForm
          layout='horizontal'
          labelAlign='left'
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 12 }}
          initialValues={{
            dns: venueSwitchSetting?.data?.dns
          }}
        >
          <RowStyle gutter={20}>
            <Col span={12}>
              <Form.Item
                label={$t({ defaultMessage: 'Configuration Profile' })}
                validateFirst
                children={
                  <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', display: 'flex' }} >
                      {selectedProfiles?.length > 1
                        ? `${selectedProfiles?.length} 
                          ${$t({ defaultMessage: 'CLI profiles selected' })}`
                        : (selectedProfiles?.length
                          ? `${selectedProfiles[0]?.name} (${selectedProfiles[0]?.profileType})`
                          : $t({ defaultMessage: 'No Profile is selected' })
                        )
                      }
                    </span>
                    <ButtonWrapper size={0}
                      split={selectedProfiles?.length > 0 && <Divider type='vertical' />}
                    >
                      { selectedProfiles?.length > 0 &&
                          <Button type='link'
                            key='view'
                            onClick={() => {
                              const selectedCLI = selectedProfiles?.filter(p =>
                                p.profileType === ProfileTypeEnum.CLI)?.length
                              selectedCLI
                                ? setFormState({ ...formState, cliModalvisible: true })
                                : setFormState({ ...formState, regularModalvisible: true })
                            }}>
                            {$t({ defaultMessage: 'View Details' })}
                          </Button> }

                      <Button type='link'
                        key='select'
                        onClick={() => {
                          setFormState({ ...formState, changeModalvisible: true })
                        }}>{
                          selectedProfiles?.length
                            ? $t({ defaultMessage: 'Change' })
                            : $t({ defaultMessage: 'Select' })
                        }</Button>
                    </ButtonWrapper>
                  </Space>
                }
              />
              <Form.Item
                label={$t({ defaultMessage: 'DNS' })}
                children={<Space direction='vertical' style={{ width: '100%' }}>
                  <Button
                    type='link'
                    size='small'
                    style={{ float: 'right' }}
                    disabled={formData?.dns?.length === 4}
                    onClick={() => {
                      setFormData({ ...formData, dns: [...(formData?.dns ?? []), ''] })
                    }}>{$t({ defaultMessage: 'Add IP Address' })}</Button>
                  {
                    formData?.dns?.map((dns, index) => <Form.Item key={dns}
                      name={['dns', index]}
                      rules={[{
                        required: true,
                        message: $t({ defaultMessage: 'Please enter valid DNS Server IPs' })
                      }, {
                        validator: (_, value) => networkWifiIpRegExp(value),
                        message: $t({ defaultMessage: 'Please enter valid DNS Server IPs' })
                      }]}
                      validateFirst
                      children={
                        <Input
                          size='small'
                          suffix={
                            <DeleteOutlinedIcon
                              role='deleteBtn'
                              onClick={()=> {
                                const dns = formRef?.current?.getFieldsValue()?.dns
                                const data = dns?.filter((d: string, idx:number) => idx !== index)
                                setFormData({ ...formData, dns: data })
                                formRef.current?.setFieldsValue({ dns: data })
                              }}
                            />}
                        />
                      } />
                    )}
                </Space>}
              />
              <Form.Item
                name='syslogEnabled'
                label={$t({ defaultMessage: 'Syslog Server' })}
                valuePropName='checked'
                initialValue={formData.syslogEnabled}
                children={<Space>
                  <Switch
                    defaultChecked={formData.syslogEnabled}
                    checked={formData.syslogEnabled}
                    onClick={(checked, event) => {
                      event.stopPropagation()
                      handleSyslogServer(checked)
                    }}
                  />
                  <Button ghost
                    role='configBtn'
                    icon={<ConfigurationOutlined />}
                    onClick={() => {
                      setFormState({
                        ...formState,
                        syslogModalvisible: true
                      })
                    }}
                  />
                </Space>}
              />
            </Col>
          </RowStyle>
          <ConfigProfileModal {...{ formState, setFormState, formData, setFormData }} />
          { formState.cliModalvisible &&
            <CliProfileDetailModal {...{ formState, setFormState, formData }} /> }
          { formState.syslogModalvisible &&
            <SyslogServerModal {...{ formState, setFormState, formData, setFormData }} /> }
          { formState.regularModalvisible &&
            <RegularProfileDetailModal {...{ formState, setFormState, formData }} /> }
        </StepsForm.StepForm>
      </StepsForm>
    </Loader>
  )
}

export function getProfilesByKeys (profiles: ConfigurationProfile[], keys: Key[]) {
  return profiles.filter(p => keys?.includes(p.id))
}

export function getProfilesByType (profiles: ConfigurationProfile[], type: string) {
  return profiles.filter(p => p.profileType === type)
}

export function getProfileKeysByType (profiles: ConfigurationProfile[], type: string) {
  return profiles.filter(p => p.profileType === type).map(p => p.id)
}