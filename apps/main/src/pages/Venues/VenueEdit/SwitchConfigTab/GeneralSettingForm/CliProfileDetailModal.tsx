import { useState } from 'react'

import { Col, Divider, Form, Row, Select, Tooltip, Typography } from 'antd'

import { cssStr, Modal }                                  from '@acx-ui/components'
import { ConfigurationProfile, VenueSwitchConfiguration } from '@acx-ui/rc/utils'
import { getIntl }                                        from '@acx-ui/utils'

import { CliConfiguration } from './styledComponents'

import { getProfilesByKeys, FormState } from './index'

export function CliProfileDetailModal (props: {
  formState: FormState,
  formData: VenueSwitchConfiguration,
  setFormState: (data: FormState) => void
}) {
  const { $t } = getIntl()
  const { formState, setFormState, formData } = props
  const profiles = getProfilesByKeys(formState.configProfiles, formData.profileId)
  const [selectedProfile, setSelectedProfile] = useState<ConfigurationProfile>(profiles?.[0])
  const switchModels = selectedProfile?.venueCliTemplate?.switchModels?.split(',') ?? []

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
              value={selectedProfile?.id}
              options={profiles?.map(p => ({ label: p.name, value: p.id }))}
              onChange={(value) => {
                setSelectedProfile(profiles.filter(p => p.id === value)[0])
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
            label={$t({ defaultMessage: 'Venues to apply' })}
            children={
              selectedProfile?.venues && selectedProfile?.venues?.length > 1
                ? `${selectedProfile?.venues.length} ${$t({ defaultMessage: 'Venues' })}`
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