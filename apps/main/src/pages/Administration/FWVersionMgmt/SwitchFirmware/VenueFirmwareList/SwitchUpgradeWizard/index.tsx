
import { useState } from 'react'

import { Form }    from 'antd'
import _           from 'lodash'
import moment      from 'moment'
import { useIntl } from 'react-intl'

import {
  Modal, ModalType, StepsForm, showActionModal
} from '@acx-ui/components'
import { WarningCircleOutlined }          from '@acx-ui/icons'
import { useSwitchFirmwareUtils }         from '@acx-ui/rc/components'
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
import * as UI                from '../styledComponents'

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

export function SwitchUpgradeWizard (props: UpdateNowWizardProps) {
  const [form] = Form.useForm()
  const { $t } = useIntl()
  const params = useParams()
  const { wizardType } = props
  const { checkCurrentVersions } = useSwitchFirmwareUtils()
  const [updateVenueSchedules] = useUpdateSwitchVenueSchedulesMutation()

  const [upgradeVersions, setUpgradeVersions] = useState<FirmwareVersion[]>([])
  const [showSubTitle, setShowSubTitle] = useState<boolean>(true)
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
  const [upgradeSwitchList, setUpgradeSwitchList] = useState<SwitchFirmware[]>([])
  const [upgradeVenueList, setUpgradeVenueList] = useState<FirmwareSwitchVenue[]>([])

  const wizardTitle = {
    [SwitchFirmwareWizardType.update]: $t({ defaultMessage: 'Update Now' }),
    [SwitchFirmwareWizardType.schedule]: $t({ defaultMessage: 'Update Schedule' }),
    [SwitchFirmwareWizardType.skip]: $t({ defaultMessage: 'Skip Updates' })
  }

  const wizardSubmitButton = {
    [SwitchFirmwareWizardType.update]: $t({ defaultMessage: 'Run Update' }),
    [SwitchFirmwareWizardType.schedule]: $t({ defaultMessage: 'Save' }),
    [SwitchFirmwareWizardType.skip]: $t({ defaultMessage: 'Skip' })
  }

  const wizardWidth = {
    [SwitchFirmwareWizardType.update]: '1180px',
    [SwitchFirmwareWizardType.schedule]: '1180px',
    [SwitchFirmwareWizardType.skip]: '1120px'
  }

  const [skipSwitchUpgradeSchedules] = useSkipSwitchUpgradeSchedulesMutation()

  const wizardFinish = {
    [SwitchFirmwareWizardType.update]: async () => {
      try {
        await updateVenueSchedules({
          params: { ...params },
          payload: {
            venueIds: form.getFieldValue('selectedVenueRowKeys') || [],
            switchIds: _.map(upgradeSwitchList, 'switchId'),
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
            date: moment(form.getFieldValue('selectDateStep')).format('YYYY-MM-DD') || '',
            time: form.getFieldValue('selectTimeStep') || '',
            preDownload: form.getFieldValue('preDownloadChecked') || false,
            venueIds: form.getFieldValue('selectedVenueRowKeys') || [],
            switchIds: _.map(upgradeSwitchList, 'switchId'),
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
      const upgradeList: {
        currentUpgradeSwitchList: SwitchFirmware[],
        currentUpgradeVenueList: FirmwareSwitchVenue[]
      } = saveSwitchStep()
      form.validateFields()

      const venueIds = form.getFieldValue('selectedVenueRowKeys') || []
      const switchIds = _.map(upgradeList.currentUpgradeSwitchList, 'switchId')

      const selectedItemMap = {
        'true,true': $t({ defaultMessage: 'items' }),
        'true,false': $t({ defaultMessage: '<venuePlural></venuePlural>' }),
        'false,true': $t({ defaultMessage: 'switches' }),
        'false,false': $t({ defaultMessage: 'items' })
      }

      const selectedItem = selectedItemMap[`${venueIds.length > 0},${switchIds.length > 0}`]

      showActionModal({
        type: 'confirm',
        width: 460,
        title: $t({ defaultMessage: 'Skip This Update?' }),
        content: $t({
          defaultMessage:
            // eslint-disable-next-line max-len
            'Please confirm that you wish to exclude the selected {selectedItem} from this scheduled update'
        }, { selectedItem }),
        okText: $t({ defaultMessage: 'Skip' }),
        cancelText: $t({ defaultMessage: 'Cancel' }),
        async onOk () {
          try {
            await skipSwitchUpgradeSchedules({
              params: { ...params },
              payload: {
                venueIds,
                switchIds
              }
            })
            form.resetFields()
            props.setVisible(false)
          } catch (error) {
            console.log(error) // eslint-disable-line no-console
          }
        },
        onCancel () {}
      })

    }
  }

  const saveSwitchStep = function () {
    // eslint-disable-next-line max-len
    let filterVersions: FirmwareVersion[] = [...availableVersions as FirmwareVersion[] ?? []]
    let nonIcx8200Count = 0, icx8200Count = 0
    let currentUpgradeSwitchList = [] as SwitchFirmware[]
    let currentUpgradeVenueList = [] as FirmwareSwitchVenue[]

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
          const fw = row.currentFirmware || ''
          if (row.switchId) {
            currentUpgradeSwitchList = currentUpgradeSwitchList.concat(row)
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
    currentUpgradeVenueList =
            _.filter(props.data, obj =>
              selectedVenueRowKeys.includes(obj.id)) as FirmwareSwitchVenue[]

    setUpgradeSwitchList(currentUpgradeSwitchList)
    setUpgradeVenueList(currentUpgradeVenueList)
    setHasVenue(selectedVenueRowKeys.length > 0 || (nonIcx8200Count + icx8200Count === 0))
    setUpgradeVersions(filterVersions)
    setNonIcx8200Count(nonIcx8200Count)
    setIcx8200Count(icx8200Count)
    return { currentUpgradeSwitchList, currentUpgradeVenueList }
  }

  const getSubTitle = function () {
    if (!showSubTitle) {return <></>}else {
      return <div><WarningCircleOutlined
        style={{
          marginBottom: '-5px',
          width: '18px',
          height: '18px',
          marginRight: '3px'
        }} />
      { // eslint-disable-next-line max-len
        $t({ defaultMessage: 'The following list will only display the connected switch under the <venueSingular></venueSingular>.' })}
      </div>
    }
  }

  return <Modal
    title={wizardTitle[wizardType]}
    type={ModalType.ModalStepsForm}
    visible={props.visible}
    destroyOnClose={true}
    mask={true}
    width={wizardWidth[wizardType]}
    subTitle={getSubTitle()}
    children={
      <UI.SwitchFirmwareStepsForm
        wizardtype={wizardType}
        form={form}
        editMode={false}
        buttonLabel={{ submit: wizardSubmitButton[wizardType] }}
        onCancel={()=>{
          form.resetFields()
          props.setVisible(false)}}
        onFinish={wizardFinish[wizardType]}
      >
        <StepsForm.StepForm
          title={$t({ defaultMessage: 'Select Switch(es)' })}
          key='selectSwitches'
          name='selectSwitches'
          layout='horizontal'
          onFinish={async () => { saveSwitchStep() }}
        >
          <SelectSwitchStep
            setShowSubTitle={setShowSubTitle}
            data={props.data as FirmwareSwitchVenue[]}
            wizardtype={wizardType} />
        </StepsForm.StepForm>

        {(wizardType !== SwitchFirmwareWizardType.skip) &&
          <StepsForm.StepForm
            name='firmware'
            title={$t({ defaultMessage: 'Select Firmware' })}
          >
            {
              wizardType === SwitchFirmwareWizardType.update ?
                <UpdateNowStep
                  setShowSubTitle={setShowSubTitle}
                  visible={true}
                  hasVenue={hasVenue}
                  availableVersions={filterVersions(upgradeVersions)}
                  nonIcx8200Count={nonIcx8200Count}
                  icx8200Count={icx8200Count}
                /> : <ScheduleStep
                  setShowSubTitle={setShowSubTitle}
                  visible={true}
                  hasVenue={hasVenue}
                  data={props.data}
                  upgradeVenueList={upgradeVenueList as FirmwareSwitchVenue[]}
                  upgradeSwitchList={upgradeSwitchList as SwitchFirmware[]}
                  availableVersions={filterVersions(upgradeVersions)}
                  nonIcx8200Count={nonIcx8200Count}
                  icx8200Count={icx8200Count}
                />
            }
          </StepsForm.StepForm>
        }
      </UI.SwitchFirmwareStepsForm>
    }
  />
}


