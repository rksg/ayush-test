import { Form, Radio, Space, Typography } from 'antd'
import { useForm, useWatch }              from 'antd/lib/form/Form'
import { useIntl }                        from 'react-intl'

import { Modal }               from '@acx-ui/components'
import { EdgeFirmwareVersion } from '@acx-ui/rc/utils'

import { getVersionLabel } from '../../FirmwareUtils'

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
  const intl = useIntl()
  const [form] = useForm()
  const selectMode = useWatch('selectMode', form)
  const selectedVersion = useWatch('selectedVersion', form)
  // eslint-disable-next-line max-len
  const { visible, onSubmit, onCancel, availableVersions } = props

  let versionOptions: EdgeFirmwareVersion[] = []
  // let otherVersions: EdgeFirmwareVersion[] = []

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
  // otherVersions = copyAvailableVersions.slice(1)

  // const otherOptions = otherVersions.map((version) => {
  //   return {
  //     label: getVersionLabel(version),
  //     value: version.name
  //   }
  // })

  const handleFinish = () => {
    if(selectMode === VersionsSelectMode.Radio) {
      onSubmit(versionOptions[0].id || '')
    } else {
      onSubmit(selectedVersion)
    }
    onModalCancel()
  }

  const onModalCancel = () => {
    form.resetFields()
    onCancel()
  }

  return (
    <Modal
      title={$t({ defaultMessage: 'Update Now' })}
      visible={visible}
      width={560}
      okText={$t({ defaultMessage: 'Run Update' })}
      onOk={() => form.submit()}
      onCancel={onModalCancel}
      okButtonProps={{
        disabled: selectMode === undefined ||
          (selectMode === VersionsSelectMode.Dropdown && !!!selectedVersion)
      }}
    >
      <Form
        form={form}
        onFinish={handleFinish}
      >
        { versionOptions.length > 0 &&
          <div>
            <Typography>
              { // eslint-disable-next-line max-len
                $t({ defaultMessage: 'Choose which version to update the venue to:' })
              }
            </Typography>
            <UI.TitleActive>{$t({ defaultMessage: 'Active Device' })}</UI.TitleActive>
            <Form.Item
              name='selectMode'
              initialValue={VersionsSelectMode.Radio}
            >
              <Radio.Group
                style={{ margin: 12 }}
              >
                <Space direction={'vertical'}>
                  <Radio value={VersionsSelectMode.Radio}>
                    {getVersionLabel(intl, versionOptions[0])}
                  </Radio>
                  {
                    // otherVersions.length > 0 ?
                    //   <Radio value={VersionsSelectMode.Dropdown}>
                    //     <Form.Item name='selectedVersion'>
                    //       <Select
                    //         style={{ width: '100%', fontSize: '12px' }}
                    //         placeholder='Select other version...'
                    //         options={otherOptions}
                    //       />
                    //     </Form.Item>
                    //   </Radio>
                    //   : null
                  }
                </Space>
              </Radio.Group>
            </Form.Item>
          </div>
        }
        <UI.Section>
          <UI.Ul>
            <UI.Li>
              {
                // eslint-disable-next-line max-len
                $t({ defaultMessage: 'Please note, during firmware update your network device(s) might reboot, and service may be interrupted for up to 15 minutes.' })
              }
            </UI.Li>
            <UI.Li>
              {$t({ defaultMessage: 'You will be notified once the update process has finished.' })}
            </UI.Li>
          </UI.Ul>
        </UI.Section>
      </Form>
    </Modal>
  )
}
