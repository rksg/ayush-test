import { useEffect, useState } from 'react'


import { Form, Radio, RadioChangeEvent, Space } from 'antd'
import _                                        from 'lodash'
import { useIntl }                              from 'react-intl'

import {
  Subtitle,
  useStepFormContext
} from '@acx-ui/components'
import { useSwitchFirmwareUtils }             from '@acx-ui/rc/components'
import { useGetSwitchFirmwareListV1001Query } from '@acx-ui/rc/services'
import {
  compareSwitchVersion,
  SwitchFirmwareVersion1002,
  SwitchFirmwareModelGroup,
  FirmwareSwitchVenueV1002,
  SwitchFirmwareV1002
} from '@acx-ui/rc/utils'

import * as UI                              from '../../styledComponents'
import { NoteButton }                       from '../../styledComponents'
import { NoteProps, NotesEnum, SwitchNote } from '../SwitchNote'

export interface UpdateNowStepProps {
  visible: boolean,
  availableVersions: SwitchFirmwareVersion1002[]
  hasVenue: boolean,
  upgradeVenueList: FirmwareSwitchVenueV1002[],
  upgradeSwitchList: SwitchFirmwareV1002[],
  setShowSubTitle: (visible: boolean) => void
}

export function UpdateNowStep (props: UpdateNowStepProps) {
  const { $t } = useIntl()
  const intl = useIntl()
  const { form, current } = useStepFormContext()
  const { availableVersions, hasVenue, setShowSubTitle,
    upgradeVenueList } = props
  const { getVersionOptionV1002 } = useSwitchFirmwareUtils()

  const [selectedICX71Version, setSelecteedICX71Version] = useState('')
  const [selectedICX7XVersion, setSelecteedICX7XVersion] = useState('')
  const [selectedICX82Version, setSelecteedICX82Version] = useState('')

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [switchNoteData, setSwitchNoteData] = useState([] as NoteProps[])

  const ICX71Count = availableVersions?.filter(
    v => v.modelGroup === SwitchFirmwareModelGroup.ICX71)[0]?.switchCount || 0
  const ICX7XCount = availableVersions?.filter(
    v => v.modelGroup === SwitchFirmwareModelGroup.ICX7X)[0]?.switchCount || 0
  const ICX82Count = availableVersions?.filter(
    v => v.modelGroup === SwitchFirmwareModelGroup.ICX82)[0]?.switchCount || 0

  const { data: getSwitchFirmwareList } = useGetSwitchFirmwareListV1001Query({
    payload: {
      venueIdList: upgradeVenueList.map(item => item.venueId),
      searchFilter: 'ICX7150-C08P',
      searchTargetFields: ['model']
    }
  }, { skip: upgradeVenueList.length === 0 })

  useEffect(() => {
    let noteData: NoteProps[] = []

    setSwitchNoteData(noteData)
  }, [getSwitchFirmwareList])


  const handleICX71Change = (value: RadioChangeEvent) => {
    setSelecteedICX71Version(value.target.value)
    form.setFieldValue('selectedICX71Version', value.target.value)
    form.validateFields()
  }
  const handleICX7XChange = (value: RadioChangeEvent) => {
    setSelecteedICX7XVersion(value.target.value)
    form.setFieldValue('selectedICX7XVersion', value.target.value)
    form.validateFields()
  }
  const handleICX82Change = (value: RadioChangeEvent) => {
    setSelecteedICX82Version(value.target.value)
    form.setFieldValue('selectedICX82Version', value.target.value)
    form.validateFields()
  }

  const getAvailableVersions =
    (modelGroup: SwitchFirmwareModelGroup) => {
      let firmwareAvailableVersions = availableVersions?.filter(
        (v: SwitchFirmwareVersion1002) => v.modelGroup === modelGroup
      )

      if (_.isArray(firmwareAvailableVersions) && firmwareAvailableVersions.length > 0) {
        return firmwareAvailableVersions[0].versions.sort((a, b) =>
          compareSwitchVersion(a.id, b.id))
      }

      return []
    }


  useEffect(() => {
    setShowSubTitle(false)
  }, [current])


  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getNoteButton = (type: NotesEnum) => {
    const scrollToTarget = () => {
      const targetElement = document.getElementById(type)
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }

    const noteIndex = switchNoteData.findIndex(note => note.type === type)
    if(noteIndex === -1) {
      return null
    }
    return<NoteButton
      size='small'
      ghost={true}
      onClick={scrollToTarget} >
      {'[' + (noteIndex + 1) + ']'}
    </NoteButton>
  }

  return (
    <div
      data-testid='update-now-step'
      id='update-now-step'
      style={{
        minHeight: '50vh',
        marginBottom: '30px'
      }}>
      <Form.Item>
        <UI.ValidateField
          style={{ position: 'fixed', marginTop: '-25px' }}
          name='selectVersionStep'
          rules={[
            {
              validator: () => {
                const selectedVersions = [
                  form.getFieldValue('selectedICX82Version'),
                  form.getFieldValue('selectedICX71Version'),
                  form.getFieldValue('selectedICX7XVersion')
                ]
                if (selectedVersions.every(_.isEmpty)) {
                  return Promise.reject('Please select at least 1 firmware version')
                }

                return Promise.resolve()
              }
            }
          ]}
          validateFirst
          children={<> </>}
        />

        {(hasVenue || ICX82Count > 0) && <>
          <Subtitle level={4}>
            {intl.$t({ defaultMessage: 'Firmware available for ICX 8200 Series' })}
            &nbsp;
            ({ICX82Count} {intl.$t({ defaultMessage: 'switches' })})
          </Subtitle>
          <Radio.Group
            style={{ margin: '5px 0 40px 0', fontSize: '14px' }}
            onChange={handleICX82Change}
            value={selectedICX82Version}>
            <Space direction={'vertical'}>
              { getAvailableVersions(SwitchFirmwareModelGroup.ICX82)?.map(v =>
                <Radio value={v.id} key={v.id} disabled={v.inUse}>
                  {getVersionOptionV1002(intl, v)}
                </Radio>) }
              <Radio value='' key='0' style={{ fontSize: 'var(--acx-body-3-font-size)' }}>
                {intl.$t({ defaultMessage: 'Do not update firmware on these switches' })}
              </Radio>
            </Space>
          </Radio.Group>
        </>}


        {(hasVenue || ICX7XCount > 0) && <>
          <Subtitle level={4}>
            {intl.$t({ defaultMessage: 'Firmware available for ICX 7550-7850 Series' })}
            &nbsp;
            ({ICX7XCount} {intl.$t({ defaultMessage: 'switches' })})
          </Subtitle>
          <Radio.Group
            style={{ margin: '5px 0 40px 0', fontSize: '14px' }}
            onChange={handleICX7XChange}
            value={selectedICX7XVersion}>
            <Space direction={'vertical'}>
              {getAvailableVersions(SwitchFirmwareModelGroup.ICX7X)?.map(v =>
                <Radio value={v.id} key={v.id} disabled={v.inUse}>
                  {getVersionOptionV1002(intl, v)}
                </Radio>)}
              <Radio value='' key='0' style={{ fontSize: 'var(--acx-body-3-font-size)' }}>
                {intl.$t({ defaultMessage: 'Do not update firmware on these switches' })}
              </Radio>
            </Space>
          </Radio.Group>
        </>}


        {(hasVenue || ICX71Count > 0) && <>
          <Subtitle level={4}>
            {intl.$t({ defaultMessage: 'Firmware available for ICX 7150 Series' })}
            &nbsp;
            ({ICX71Count} {intl.$t({ defaultMessage: 'switches' })})
          </Subtitle>
          <Radio.Group
            style={{ margin: '5px 0 20px 0', fontSize: '14px' }}
            onChange={handleICX71Change}
            value={selectedICX71Version}>
            <Space direction={'vertical'}>
              { // eslint-disable-next-line max-len
                getAvailableVersions(SwitchFirmwareModelGroup.ICX71)?.map(v =>
                  <Radio value={v.id} key={v.id} disabled={v.inUse}>
                    {getVersionOptionV1002(intl, v)}
                  </Radio>)}
              <Radio value='' key='0' style={{ fontSize: 'var(--acx-body-3-font-size)' }}>
                {intl.$t({ defaultMessage: 'Do not update firmware on these switches' })}
              </Radio>
            </Space>
          </Radio.Group>
        </>}

        <UI.Section>
          <UI.Ul>
            <li>
              <label>
                { // eslint-disable-next-line max-len
                  $t({ defaultMessage: 'Please note that during the firmware update, the switches in this <venueSingular></venueSingular> will reboot, and your network will be unavailable for customer operation.' })}
              </label>
            </li>
            <li>
              <label>
                { // eslint-disable-next-line max-len
                  $t({ defaultMessage: 'This action cannot be canceled once initiated.' })}
              </label>
            </li>
            <li>
              <label>
                { // eslint-disable-next-line max-len
                  $t({ defaultMessage: 'You will be notified once the update process has finished.' })}
              </label>
            </li>
          </UI.Ul>
        </UI.Section>
      </Form.Item>
      {switchNoteData.length > 0 && <SwitchNote notes={switchNoteData} />}
    </div>
  )
}
