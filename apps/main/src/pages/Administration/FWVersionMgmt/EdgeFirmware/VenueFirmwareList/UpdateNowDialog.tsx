import { useEffect, useState } from 'react'

import { Form, Radio, RadioChangeEvent, Select, Space, Typography } from 'antd'
import { useForm }                                                  from 'antd/lib/form/Form'
import { useIntl }                                                  from 'react-intl'

import {
  Modal
} from '@acx-ui/components'
import {
  EdgeFirmwareVersion
} from '@acx-ui/rc/utils'

import {
  getVersionLabel
} from '../../FirmwareUtils'

import * as UI from './styledComponents'

enum VersionsSelectMode {
  Radio,
  Dropdown
}

export interface UpdateApNowDialogProps {
  visible: boolean,
  onCancel: () => void,
  onSubmit: (data: string) => void,
  availableVersions?: EdgeFirmwareVersion[],
}

export function UpdateNowDialog (props: UpdateApNowDialogProps) {
  const { $t } = useIntl()
  const [form] = useForm()
  // eslint-disable-next-line max-len
  const { visible, onSubmit, onCancel, availableVersions } = props
  const [selectMode, setSelectMode] = useState(VersionsSelectMode.Radio)
  const [selectedVersion, setSelectedVersion] = useState('')
  const [disableSave, setDisableSave] = useState(false)

  useEffect(() => {
    if (availableVersions && availableVersions[0]) {
      let firstIndex = availableVersions.findIndex(isRecommanded)
      setSelectedVersion(availableVersions[firstIndex].name)
    }
  }, [availableVersions])

  useEffect(() => {
    if (selectMode === VersionsSelectMode.Dropdown && !selectedVersion) {
      setDisableSave(true)
    } else {
      setDisableSave(false)
    }
  }, [selectMode, selectedVersion])

  let versionOptions: EdgeFirmwareVersion[] = []
  let otherVersions: EdgeFirmwareVersion[] = []

  const isRecommanded = (e: EdgeFirmwareVersion) => {
    return e.category === 'RECOMMENDED'
  }

  let copyAvailableVersions = availableVersions ? [...availableVersions] : []
  let firstIndex = copyAvailableVersions.findIndex(isRecommanded)
  if (firstIndex > 0) {
    let removed = copyAvailableVersions.splice(firstIndex, 1)
    versionOptions = [...removed, ...copyAvailableVersions]
  } else {
    versionOptions = [...copyAvailableVersions]
  }
  otherVersions = copyAvailableVersions.slice(1)

  const onSelectModeChange = (e: RadioChangeEvent) => {
    setSelectMode(e.target.value)
  }

  const otherOptions = otherVersions.map((version) => {
    return {
      label: getVersionLabel(version),
      value: version.name
    }
  })

  const handleChange = (value: string) => {
    setSelectedVersion(value)
  }

  const triggerSubmit = () => {
    form.validateFields()
      .then(() => {
        let version
        if(selectMode === VersionsSelectMode.Radio) {
          version = versionOptions[0].id || ''
        } else {
          version = selectedVersion
        }
        onSubmit(version)
        onModalCancel()
      })
  }

  const onModalCancel = () => {
    form.resetFields()
    setSelectMode(VersionsSelectMode.Radio)
    onCancel()
  }


  return (
    <Modal
      title={$t({ defaultMessage: 'Update Now' })}
      visible={visible}
      width={560}
      okText={$t({ defaultMessage: 'Run Update' })}
      onOk={triggerSubmit}
      onCancel={onModalCancel}
      okButtonProps={{ disabled: disableSave }}
    >
      <Form
        form={form}
        name={'updateModalForm'}
      >
        <Form.Item
          initialValue={VersionsSelectMode.Radio}
        >
          { versionOptions.length > 0 ?
            <div>
              <Typography>
                { // eslint-disable-next-line max-len
                  $t({ defaultMessage: 'Choose which version to update the venue to:' })
                }
              </Typography>
              <UI.TitleActive>Active Device</UI.TitleActive>
              <Radio.Group
                style={{ margin: 12 }}
                onChange={onSelectModeChange}
                value={selectMode}>
                <Space direction={'vertical'}>
                  <Radio value={VersionsSelectMode.Radio}>
                    {getVersionLabel(versionOptions[0])}
                  </Radio>
                  {
                    otherVersions.length > 0 ?
                      <Radio value={VersionsSelectMode.Dropdown}>
                        <Select
                          style={{ width: '100%', fontSize: '12px' }}
                          placeholder='Select other version...'
                          onChange={handleChange}
                          options={otherOptions}
                        />
                      </Radio>
                      : null
                  }
                </Space>
              </Radio.Group>
            </div>
            : null
          }
          <UI.Section>
            <UI.Ul>
              { // eslint-disable-next-line max-len
                <UI.Li>Please note, during firmware update your network device(s) might reboot, and service may be interrupted for up to 15 minutes.</UI.Li>}
              <UI.Li>You will be notified once the update process has finished.</UI.Li>
            </UI.Ul>
          </UI.Section>
        </Form.Item>
      </Form>
    </Modal>
  )
}
