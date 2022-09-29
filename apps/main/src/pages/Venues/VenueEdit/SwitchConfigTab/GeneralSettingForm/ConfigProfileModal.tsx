import { useState, Key } from 'react'

import { Radio, Space, Tabs, Tooltip, Typography } from 'antd'
import _                                           from 'lodash'
import { FormattedMessage }                        from 'react-intl'

import { Button, cssStr, Modal, Table, TableProps }                                       from '@acx-ui/components'
import { ConfigurationProfile, ProfileTypeEnum, VenueMessages, VenueSwitchConfiguration } from '@acx-ui/rc/utils'
import { getIntl }                                                                        from '@acx-ui/utils'

import { Picker, Notification  } from './styledComponents'

import { getProfilesByKeys, getProfilesByType, getProfileKeysByType, FormState } from './index'

import type { RadioChangeEvent } from 'antd'

export function ConfigProfileModal (props: {
  formState: FormState,
  formData: VenueSwitchConfiguration,
  setFormState: (data: FormState) => void,
  setFormData: (data: VenueSwitchConfiguration) => void,
}) {
  const { $t } = getIntl()
  const { formState, setFormState, formData, setFormData } = props
  const [disableButton, setDisableButton] = useState(false) 
  const [selectedProfileKeys, setSelectedProfileKeys] = useState('')
  const [selectedCliProfileKeys, setSelectedCliProfileKeys] = useState([] as Key[])

  const { configProfiles, changeModalvisible } = formState
  const selectedProfiles = getProfilesByKeys(configProfiles, formData.profileId)
  const selectedCLIKeys = getProfileKeysByType(selectedProfiles, ProfileTypeEnum.CLI)
  const regularProfiles = getProfilesByType(configProfiles, ProfileTypeEnum.REGULAR)
  const cliProfiles = getProfilesByType(configProfiles, ProfileTypeEnum.CLI)

  const onChangeRegular = (e: RadioChangeEvent) => {
    setSelectedProfileKeys(e.target.value)
  }

  const onChangeCLI = (selectedRowKeys: Key[]) => {
    const selected = getProfilesByKeys(formState.configProfiles, selectedRowKeys)
    const switchModels = selected.flatMap(s => s?.venueCliTemplate?.switchModels?.split(','))
    setDisableButton(switchModels.length !== _.uniq(switchModels).length)
    setSelectedCliProfileKeys(selectedRowKeys)
  }

  const onCancel = () => {
    setFormState({ ...formState, changeModalvisible: false })
  }

  const onOk = () => {
    const selectedProfileId = selectedCliProfileKeys.length
      ? selectedCliProfileKeys
      : [selectedProfileKeys]

    setFormState({ ...formState, changeModalvisible: false })
    setFormData({ ...formData, profileId: selectedProfileId })
  }

  const columns: TableProps<ConfigurationProfile>['columns'] = [{
    title: $t({ defaultMessage: 'Profile Name' }),
    dataIndex: 'name',
    key: 'name',
    sorter: true
  }, {
    title: $t({ defaultMessage: 'Model Affected' }),
    dataIndex: ['venueCliTemplate', 'switchModels'],
    key: 'venueCliTemplate',
    render: (data) => {
      const models = (data as string)?.split(',') ?? []
      const title = <>{models.map((m, idx) => <div key={idx}>{m}</div>)}</>
      const content = models?.length > 1 ? `${models.length} models` : data
      return <Tooltip title={title} placement='bottom'>{ content }</Tooltip>
    }
  }, {
    title: $t({ defaultMessage: 'Venues' }),
    dataIndex: 'venues',
    key: 'venues',
    render: (data) => {
      const title = data
        ? <>{(data as string[])?.map((v, idx) => <div key={idx}>{v}</div>)}</>
        : null
      const count = (data as string[])?.length ?? 0
      return <Tooltip title={title} placement='bottom'>{ count }</Tooltip>
    }
  }]

  return (<Modal
    title={$t({ defaultMessage: 'Select configuration profile' })}
    visible={changeModalvisible}
    width={500}
    destroyOnClose={true}
    footer={[
      <Button key='back' onClick={onCancel}>Cancel</Button>,
      <Tooltip
        placement='top'
        key='disableTooltip'
        title={disableButton ? $t(VenueMessages.MODEL_OVERLAPPING_TOOLTIP) : null}
      >
        <Space style={{ marginLeft: '8px' }}> {/* Fix Tooltip on disabled button */}
          <Button key='submit' type='primary' disabled={disableButton} onClick={onOk}>
            {$t({ defaultMessage: 'OK' })}
          </Button>
        </Space>
      </Tooltip>
    ]}
  >
    <Tabs defaultActiveKey={formState.cliApplied
      ? ProfileTypeEnum.CLI
      : ProfileTypeEnum.REGULAR}>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Regular Profiles' })}
        key={ProfileTypeEnum.REGULAR}
        disabled={formState.cliApplied}
      >
        <Typography.Text>
          {$t({ defaultMessage: 'Select a configuration profile to apply:' })}
        </Typography.Text>
        <Picker>
          <Radio.Group defaultValue={'none'} onChange={onChangeRegular} value={selectedProfileKeys}>
            { regularProfiles?.map(p =>
              <Radio value={p.id} key={p.id}>{p.name}</Radio>)}
            <Radio value='none' key='none' style={{ color: cssStr('--acx-semantics-red-50') }}>
              {$t({ defaultMessage: 'No Profile' })}
            </Radio>
          </Radio.Group>
        </Picker>
        <Button type='link' size='small' disabled>
          {$t({ defaultMessage: 'Add configuration profile' })}
        </Button>
      </Tabs.TabPane>

      <Tabs.TabPane tab={$t({ defaultMessage: 'CLI Profiles' })} key={ProfileTypeEnum.CLI}>
        <>
          <Notification> {
            <FormattedMessage
              {...VenueMessages.CLI_PROFILE_NOTIFICATION}
              values={{
                ul: (text: string) => <ul>{text}</ul>,
                li: (text: string) => <li>{text}</li>
              }}
            />
          } </Notification>
          <Table
            columns={columns}
            dataSource={cliProfiles}
            rowKey='id'
            rowSelection={{
              type: 'checkbox',
              alwaysShowAlert: true,
              defaultSelectedRowKeys: selectedCLIKeys,
              onChange: onChangeCLI
            }}
            // TODO: 
            actions={[{
              label: 'Add CLI Profile',
              onClick: () => {}
            }]}
          />
        </>
      </Tabs.TabPane>
    </Tabs>
  </Modal>)
}