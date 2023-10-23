
import { useState } from 'react'

import { Form }    from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import {
  Modal, ModalType, StepsForm, showActionModal
} from '@acx-ui/components'
import {
  useGetSwitchAvailableFirmwareListQuery,
  useGetSwitchLatestFirmwareListQuery,
  useSkipSwitchUpgradeSchedulesMutation,
  useUpdateSwitchVenueSchedulesMutation } from '@acx-ui/rc/services'
import {
  FirmwareCategory,
  FirmwareSwitchVenue,
  FirmwareVersion,
  SwitchFirmware,
  UpdateScheduleRequest
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import { getReleaseFirmware } from '../../../FirmwareUtils'

import { ScheduleStep }     from './ScheduleStep'
import { SelectSwitchStep } from './SelectSwitchStep'
import { UpdateNowStep }    from './UpdateNowStep'


export enum SwitchFirmwareWizardType {
  update = 'UPDATE',
  schedule = 'SCHEDULE',
  skip = 'SKIP'
}

export interface UpdateNowWizardProps {
  wizardType: SwitchFirmwareWizardType,
  visible: boolean,
  setVisible: (visible: boolean) => void,
  onSubmit: (data: UpdateScheduleRequest) => void,
  data: FirmwareSwitchVenue[],
}

export function UpdateNowWizard (props: UpdateNowWizardProps) {
  const [form] = Form.useForm()
  const { $t } = useIntl()
  const params = useParams()
  const { wizardType } = props
  const [updateVenueSchedules] = useUpdateSwitchVenueSchedulesMutation()

  const [upgradeVersions, setUpgradeVersions] = useState<FirmwareVersion[]>([])
  const filterVersions = function (availableVersions: FirmwareVersion[]) {

    return availableVersions?.map((version) => {
      if (version?.category === FirmwareCategory.RECOMMENDED && !isLatestVersion(version)) {
        return {
          ...version,
          id: version?.id, name: version?.name, category: FirmwareCategory.REGULAR
        }
      } return version
    })
  }
  const { data: availableVersions } = useGetSwitchAvailableFirmwareListQuery({ params })
  const { data: latestReleaseVersions } = useGetSwitchLatestFirmwareListQuery({ params })

  const isLatestVersion = function (currentVersion: FirmwareVersion) {
    if(_.isEmpty(currentVersion?.id)) return false
    const latestVersions = getReleaseFirmware(latestReleaseVersions)
    const latestFirmware = latestVersions.filter(v => v.id.startsWith('090'))[0]
    const latestRodanFirmware = latestVersions.filter(v => v.id.startsWith('100'))[0]
    return (currentVersion.id === latestFirmware?.id ||
      currentVersion.id === latestRodanFirmware?.id)
  }

  const [nonIcx8200Count, setNonIcx8200Count] = useState<number>(0)
  const [icx8200Count, setIcx8200Count] = useState<number>(0)
  const [hasVenue, setHasVenue] = useState<boolean>(false)
  const [upgradeSwitchList, setUpgradeSwitchList] = useState<string[]>([])

  const wizardTitle = {
    [SwitchFirmwareWizardType.update]: $t({ defaultMessage: 'Update Now' }),
    [SwitchFirmwareWizardType.schedule]: $t({ defaultMessage: 'Update Schedule' }),
    [SwitchFirmwareWizardType.skip]: $t({ defaultMessage: 'Skip Updates' })
  }

  const wizardWidth = {
    [SwitchFirmwareWizardType.update]: '95%',
    [SwitchFirmwareWizardType.schedule]: '95%',
    [SwitchFirmwareWizardType.skip]: '75%'
  }

  const [skipSwitchUpgradeSchedules] = useSkipSwitchUpgradeSchedulesMutation()

  const wizardFinish = {
    [SwitchFirmwareWizardType.update]: async () => {
      try {
        await updateVenueSchedules({
          params: { ...params },
          payload: {
            venueIds: form.getFieldValue('selectedVenueRowKeys') || [],
            switchIds: upgradeSwitchList,
            switchVersion: form.getFieldValue('switchVersion') || '',
            switchVersionAboveTen: form.getFieldValue('switchVersionAboveTen') || ''
          }
        }).unwrap()
        form.resetFields()
        props.setVisible(false)
      } catch (error) {
        console.log(error) // eslint-disable-line no-console
      }
    },
    [SwitchFirmwareWizardType.schedule]: async () => {
      try {
        await updateVenueSchedules({
          params: { ...params },
          payload: {
            date: form.getFieldValue('selectedDate') || '',
            time: form.getFieldValue('selectedTime') || '',
            preDownload: form.getFieldValue('preDonloadChecked') || false,
            venueIds: form.getFieldValue('selectedVenueRowKeys') || [],
            switchIds: upgradeSwitchList,
            switchVersion: form.getFieldValue('switchVersion') || '',
            switchVersionAboveTen: form.getFieldValue('switchVersionAboveTen') || ''
          }
        }).unwrap()
        form.resetFields()
        props.setVisible(false)
      } catch (error) {
        console.log(error) // eslint-disable-line no-console
      }
    },
    [SwitchFirmwareWizardType.skip]: async () => {
      form.validateFields()
      showActionModal({
        type: 'confirm',
        width: 460,
        title: $t({ defaultMessage: 'Skip This Update?' }),
        content: $t({
          defaultMessage:
            'Please confirm that you wish to exclude the selected venues from this scheduled update'
        }),
        okText: $t({ defaultMessage: 'Skip' }),
        cancelText: $t({ defaultMessage: 'Cancel' }),
        async onOk () {
          try {
            await skipSwitchUpgradeSchedules({
              params: { ...params },
              payload: {
                venueIds: form.getFieldValue('selectedVenueRowKeys') || [],
                switchIds: upgradeSwitchList
              }
            })
            form.resetFields()
            props.setVisible(false)
          } catch (error) {
            console.log(error) // eslint-disable-line no-console
          }
        },
        onCancel () { }
      })

    }
  }

  return <Modal
    title={wizardTitle[wizardType]}
    type={ModalType.ModalStepsForm}
    visible={props.visible}
    destroyOnClose={true}
    mask={true}
    width={wizardWidth[wizardType]}
    children={
      <StepsForm
        form={form}
        editMode={false}
        onCancel={()=>{
          form.resetFields()
          props.setVisible(false)}}
        onFinish={wizardFinish[wizardType]}
      >
        <StepsForm.StepForm
          key='selectSwitches'
          name='selectSwitches'
          title={$t({ defaultMessage: 'Select Switch(es)' })}
          layout='horizontal'
          onFinish={async () => {
            // eslint-disable-next-line max-len
            let filterVersions: FirmwareVersion[] = [...availableVersions as FirmwareVersion[] ?? []]
            let nonIcx8200Count = 0, icx8200Count = 0
            let currentUpgradeSwitchList = [] as string[]

            const nestedData = form.getFieldValue('nestedData')
            const selectedVenueRowKeys = form.getFieldValue('selectedVenueRowKeys')


            props.data.forEach((row: FirmwareSwitchVenue) => {
              if (selectedVenueRowKeys.includes(row.id)) {
                const version = row.switchFirmwareVersion?.id
                const rodanVersion = row.switchFirmwareVersionAboveTen?.id
                filterVersions = checkCurrentVersions(version, rodanVersion, filterVersions)
                nonIcx8200Count = nonIcx8200Count + (row.switchCount ? row.switchCount : 0)
                icx8200Count = icx8200Count +
                  (row.aboveTenSwitchCount ? row.aboveTenSwitchCount : 0)
              } else if (nestedData[row.id]) {
                nestedData[row.id].selectedData.forEach((row: SwitchFirmware) => {
                  const fw = row.currentFirmware
                  if (row.switchId) {
                    currentUpgradeSwitchList = currentUpgradeSwitchList.concat(row.switchId)
                  }
                  if (fw.includes('090')) { //Need use regular expression
                    filterVersions = checkCurrentVersions(fw, '', filterVersions)
                    nonIcx8200Count = nonIcx8200Count +1
                  } else if (fw.includes('100')) {
                    filterVersions = checkCurrentVersions('', fw, filterVersions)
                    icx8200Count = icx8200Count+1
                  }
                })
              }
            })

            setUpgradeSwitchList(currentUpgradeSwitchList)
            setHasVenue(selectedVenueRowKeys.length > 0)
            setUpgradeVersions(filterVersions)
            setNonIcx8200Count(nonIcx8200Count)
            setIcx8200Count(icx8200Count)
            return true

          }}
        >
          <SelectSwitchStep data={props.data as FirmwareSwitchVenue[]} />
        </StepsForm.StepForm>

        {(wizardType !== SwitchFirmwareWizardType.skip) &&
          <StepsForm.StepForm
            name='firmware'
            title={$t({ defaultMessage: 'Select Firmware' })}
          >
            {
              wizardType === SwitchFirmwareWizardType.update ?
                <UpdateNowStep
                  visible={true}
                  hasVenue={hasVenue}
                  availableVersions={filterVersions(upgradeVersions)}
                  nonIcx8200Count={nonIcx8200Count}
                  icx8200Count={icx8200Count}
                /> : <ScheduleStep
                  visible={true}
                  hasVenue={hasVenue}
                  availableVersions={filterVersions(upgradeVersions)}
                  nonIcx8200Count={nonIcx8200Count}
                  icx8200Count={icx8200Count}
                />
            }

          </StepsForm.StepForm>
        }

      </StepsForm>

    }
  />
}
function checkCurrentVersions (version: string,
  rodanVersion: string,
  filterVersions: FirmwareVersion[]): FirmwareVersion[] {
  let inUseVersions = [] as FirmwareVersion[]
  filterVersions.forEach((v: FirmwareVersion) => {
    if (v.id === version || v.id === rodanVersion) {
      v = { ...v, inUse: true }
    }
    inUseVersions.push(v)
  })
  return inUseVersions
}
