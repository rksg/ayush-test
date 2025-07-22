import { useEffect, useState } from 'react'

import { Col, Divider, Form, Row, Select, Typography } from 'antd'

import { cssStr, Modal, Tooltip }                                                                                  from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                                  from '@acx-ui/feature-toggle'
import { useLazyGetSwitchConfigProfileQuery, useLazyGetSwitchConfigProfileTemplateQuery }                          from '@acx-ui/rc/services'
import { ConfigurationProfile, useConfigTemplate, useConfigTemplateLazyQueryFnSwitcher, VenueSwitchConfiguration } from '@acx-ui/rc/utils'
import { getIntl }                                                                                                 from '@acx-ui/utils'

import { CliConfiguration } from './styledComponents'

import { FormState, getProfilesByKeys } from './index'

export function CliProfileDetailModal (props: {
  formState: FormState,
  formData: VenueSwitchConfiguration,
  setFormState: (data: FormState) => void
}) {
  const { $t } = getIntl()
  const { formState, setFormState, formData } = props
  const { isTemplate } = useConfigTemplate()
  const profileKeys = getProfilesByKeys(formState.configProfiles, formData.profileId)
  const enableTemplateRbac = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const resolvedEnableRbac = isTemplate ? enableTemplateRbac : true
  const [ getSwitchConfigProfile ] = useConfigTemplateLazyQueryFnSwitcher<ConfigurationProfile>({
    useLazyQueryFn: useLazyGetSwitchConfigProfileQuery,
    useLazyTemplateQueryFn: useLazyGetSwitchConfigProfileTemplateQuery
  })

  const [selectedProfile, setSelectedProfile] =
    useState<ConfigurationProfile>({} as ConfigurationProfile)

  const switchModels = selectedProfile?.venueCliTemplate?.switchModels?.split(',') ?? []
  const getSelectedProfile = async function (profileId: string) {
    let profile = await getSwitchConfigProfile({
      params: { profileId },
      enableRbac: resolvedEnableRbac
    }).unwrap()

    const pk = profileKeys.find(p => p.id === profileId)
    if (pk) {
      profile = { ...profile, venues: pk.venues }
    }

    setSelectedProfile(profile)
  }

  useEffect(() => {
    if (profileKeys?.[0]?.id) {
      getSelectedProfile(profileKeys?.[0].id)
    }
  }, [profileKeys?.[0].id])

  const closeModal = () => {
    setFormState({
      ...formState,
      cliModalvisible: false
    })
  }

  return (<Modal
    title={$t({ defaultMessage: 'VLAN (L2) Profile Details' })}
    visible={formState?.cliModalvisible}
    width={900}
    cancelButtonProps={{ style: { display: 'none' } }}
    destroyOnClose={true}
    onOk={closeModal}
    onCancel={closeModal}
  >
    <Form
      layout='horizontal'
      labelAlign='left'
      labelCol={{ span: 10 }}
      wrapperCol={{ span: 14 }}
    >
      <Row gutter={24}>
        <Col span={10}>
          <Form.Item
            label={$t({ defaultMessage: 'Select Profile' })}
            children={<Select
              defaultActiveFirstOption
              value={selectedProfile?.id}
              options={profileKeys?.map(p => ({ label: p.name, value: p.id }))}
              onChange={(value) => {
                getSelectedProfile(value)
              }}
            />}
          />
        </Col>
      </Row>
      <Divider style={{ margin: '4px 0px 20px', background: cssStr('--acx-neutrals-30') }}/>
      <Row gutter={24} style={{ marginBottom: '12px' }}>
        <Col span={10}>
          <Form.Item
            label={$t({ defaultMessage: 'Profile Name' })}
            children={selectedProfile?.name}
          />
          <Form.Item
            label={$t({ defaultMessage: 'Switch Models' })}
            children={
              <Tooltip
                title={switchModels.length > 1
                  ? switchModels?.map((m, idx) => <div key={idx}>{m}</div>)
                  : ''}
                placement='bottom'
              >{
                  switchModels.length > 1
                    ? `${switchModels.length} ${$t({ defaultMessage: 'models' })}`
                    : switchModels[0]
                }</Tooltip>
            }
          />
          <Form.Item
            label={$t({ defaultMessage: '<VenuePlural></VenuePlural> to apply' })}
            children={
              selectedProfile?.venues && selectedProfile?.venues?.length > 1
                // eslint-disable-next-line max-len
                ? `${selectedProfile?.venues.length} ${$t({ defaultMessage: '<VenuePlural></VenuePlural>' })}`
                : selectedProfile?.venues
            }
          />
        </Col>
        <Col span={1}>
          <Divider
            type='vertical'
            style={{ height: '100%', background: cssStr('--acx-neutrals-30') }}
          />
        </Col>
        <Col span={13}>
          <Typography.Text style={{
            display: 'block', marginBottom: '4px',
            fontSize: cssStr('--acx-body-4-font-size'),
            color: cssStr('--acx-neutrals-60')
          }}>
            {$t({ defaultMessage: 'CLI Configuration:' })}
          </Typography.Text>
          {/* TODO: should replace with codemirror */}
          <CliConfiguration
            style={{ height: '250px' }}
            value={selectedProfile?.venueCliTemplate?.cli}
          />
        </Col>
      </Row>
    </Form>
  </Modal>)
}
