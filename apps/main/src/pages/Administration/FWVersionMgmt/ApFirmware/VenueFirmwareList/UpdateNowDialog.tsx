import { useEffect, useState } from 'react'

import { Select, Form, Radio, RadioChangeEvent, Space, Typography } from 'antd'
import { useForm }                                                  from 'antd/lib/form/Form'
import { defineMessage, useIntl }                                   from 'react-intl'

import {
  Modal
} from '@acx-ui/components'
import {
  FirmwareVenue,
  FirmwareVersion,
  UpdateNowRequest
} from '@acx-ui/rc/utils'

import {
  getVersionLabel
} from '../../FirmwareUtils'

import * as UI from './styledComponents'

export enum VersionsSelectMode {
  Radio,
  Dropdown,
  Radio_None
}

// eslint-disable-next-line max-len
export const firmwareNote1 = defineMessage({ defaultMessage: 'Please note, during firmware update your network device(s) will reboot, and service may be interrupted for up to 15 minutes.' })
// eslint-disable-next-line max-len
export const firmwareNote2 = defineMessage({ defaultMessage: 'You will be notified once the update process has finished.' })

export interface UpdateApNowDialogProps {
  visible: boolean,
  onCancel: () => void,
  onSubmit: (data: UpdateNowRequest[]) => void,
  data?: FirmwareVenue[],
  availableVersions?: FirmwareVersion[],
  eol?: boolean,
  eolName?: string,
  latestEolVersion?: string,
  eolModels?: string[]
}

export function UpdateNowDialog (props: UpdateApNowDialogProps) {
  const { $t } = useIntl()
  const intl = useIntl()
  const [form] = useForm()
  // eslint-disable-next-line max-len
  const { visible, onSubmit, onCancel, data, availableVersions, eol, eolName, latestEolVersion, eolModels } = props
  const [selectMode, setSelectMode] = useState(VersionsSelectMode.Radio)
  const [selectedVersion, setSelectedVersion] = useState('')
  const [disableSave, setDisableSave] = useState(false)

  useEffect(() => {
    if (availableVersions && availableVersions[0]) {
      let firstIndex = availableVersions.findIndex(isRecommanded)
      if (firstIndex > -1) {
        setSelectedVersion(availableVersions[firstIndex].name)
      }
    }
  }, [availableVersions])

  useEffect(() => {
    if (selectMode === VersionsSelectMode.Dropdown && !selectedVersion) {
      setDisableSave(true)
    } else {
      setDisableSave(false)
    }
  }, [selectMode, selectedVersion])

  let versionOptions: FirmwareVersion[] = []
  let otherVersions: FirmwareVersion[] = []

  const isRecommanded = (e: FirmwareVersion) => {
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
      label: getVersionLabel(intl, version),
      value: version.name,
      title: '',
      style: { fontSize: 12 }
    }
  })

  const handleChange = (value: string) => {
    setSelectedVersion(value)
  }

  const createRequest = (): UpdateNowRequest[] => {
    let version
    if (selectMode === VersionsSelectMode.Radio && versionOptions.length > 0) {
      version = versionOptions[0].id
    }
    if (selectMode === VersionsSelectMode.Dropdown) {
      version = selectedVersion
    }
    const venuesData = data as FirmwareVenue[]
    let request = []
    if (version) {
      request.push({
        firmwareCategoryId: 'active',
        firmwareVersion: version,
        venueIds: venuesData.map(venue => venue.id)
      })
    }
    if (eol) {
      request.push({
        firmwareCategoryId: eolName,
        firmwareVersion: latestEolVersion,
        venueIds: venuesData.map(venue => venue.id)
      })
    }
    return request
  }

  const triggerSubmit = () => {
    form.validateFields()
      .then(() => {
        onSubmit(createRequest())
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
              <Typography style={{ fontWeight: 700 }}>
                { // eslint-disable-next-line max-len
                  $t({ defaultMessage: 'Choose which version to update the venue to:' })}
              </Typography>
              <UI.TitleActive>{$t({ defaultMessage: 'Active Device' })}</UI.TitleActive>
              <Radio.Group
                style={{ margin: 12 }}
                onChange={onSelectModeChange}
                value={selectMode}>
                <Space direction={'vertical'}>
                  <Radio value={VersionsSelectMode.Radio}>
                    {getVersionLabel(intl, versionOptions[0])}
                  </Radio>
                  { otherVersions.length > 0 ?
                    <UI.SelectDiv>
                      <Radio value={VersionsSelectMode.Dropdown}>
                        <Select
                          style={{ width: '420px', fontSize: '12px' }}
                          placeholder={$t({ defaultMessage: 'Select other version...' })}
                          onChange={handleChange}
                          options={otherOptions}
                        />
                      </Radio>
                    </UI.SelectDiv>
                    : null
                  }
                </Space>
              </Radio.Group>
            </div>
            : null
          }
          { eol ?
            <UI.Section>
              <UI.TitleLegacy>{$t({ defaultMessage: 'Legacy Device' })}</UI.TitleLegacy>
              <Radio
                defaultChecked
                style={{ margin: 12 }}>
                {latestEolVersion}
              </Radio>
              <UI.ItemModel>
                {$t({
                  defaultMessage: 'AP Models: {apModels}'
                }, {
                  apModels: eolModels?.join(', ')
                })}
              </UI.ItemModel>
            </UI.Section>
            : null
          }
          <UI.Section>
            <UI.Ul>
              <UI.Li>{$t(firmwareNote1)}</UI.Li>
              <UI.Li>{$t(firmwareNote2)}</UI.Li>
            </UI.Ul>
          </UI.Section>
        </Form.Item>
      </Form>
    </Modal>
  )
}
