
import { useState } from 'react'

import { Form }    from 'antd'
import _           from 'lodash'
import moment      from 'moment'
import { useIntl } from 'react-intl'

import {
  Modal,
  ModalType,
  StepsForm,
  showActionModal
} from '@acx-ui/components'
import { WarningCircleOutlined }               from '@acx-ui/icons'
import { useSwitchFirmwareUtils }              from '@acx-ui/rc/components'
import {
  useBatchUpdateSwitchVenueSchedulesV1001Mutation,
  useGetSwitchDefaultFirmwareListV1001Query,
  useGetSwitchAvailableFirmwareListV1001Query,
  useBatchSkipSwitchUpgradeSchedulesMutation } from '@acx-ui/rc/services'
import {
  FirmwareSwitchVenueV1002,
  SwitchFirmwareVersion1002,
  UpdateScheduleRequest,
  FirmwareSwitchV1002,
  getSwitchModelGroup,
  SwitchFirmwareModelGroup,
  SwitchFirmwareV1002
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import * as UI from '../styledComponents'

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
  data: FirmwareSwitchVenueV1002[],
}

export function SwitchUpgradeWizard (props: UpdateNowWizardProps) {
  const [form] = Form.useForm()
  const { $t } = useIntl()
  const params = useParams()
  const { wizardType } = props
  const { checkCurrentVersionsV1002 } = useSwitchFirmwareUtils()
  const [batchUpdateSwitchVenueSchedules] = useBatchUpdateSwitchVenueSchedulesV1001Mutation()
  const { data: availableVersions } = useGetSwitchAvailableFirmwareListV1001Query({ params })
  const { data: defaultReleaseVersions } = useGetSwitchDefaultFirmwareListV1001Query({ params })

  const [upgradeVersions, setUpgradeVersions] = useState<SwitchFirmwareVersion1002[]>([])
  const [showSubTitle, setShowSubTitle] = useState<boolean>(true)
  const [hasVenue, setHasVenue] = useState<boolean>(false)
  const [upgradeSwitchList, setUpgradeSwitchList] = useState<SwitchFirmwareV1002[]>([])
  const [upgradeVenueList, setUpgradeVenueList] = useState<FirmwareSwitchVenueV1002[]>([])

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
    [SwitchFirmwareWizardType.update]: '1450px',
    [SwitchFirmwareWizardType.schedule]: '1450px',
    [SwitchFirmwareWizardType.skip]: '1120px'
  }

  const [batchSkipSwitchUpgradeSchedules] = useBatchSkipSwitchUpgradeSchedulesMutation()

  const getVersionsPayload = function () {

    let versionsPayload = []
    if (form.getFieldValue('selectedICX71Version')) {
      versionsPayload.push({
        modelGroup: SwitchFirmwareModelGroup.ICX71,
        version: form.getFieldValue('selectedICX71Version')
      })
    }
    if (form.getFieldValue('selectedICX7XVersion')) {
      versionsPayload.push({
        modelGroup: SwitchFirmwareModelGroup.ICX7X,
        version: form.getFieldValue('selectedICX7XVersion')
      })
    }
    if (form.getFieldValue('selectedICX81Version')) {
      versionsPayload.push({
        modelGroup: SwitchFirmwareModelGroup.ICX81,
        version: form.getFieldValue('selectedICX81Version')
      })
    }
    if (form.getFieldValue('selectedICX82Version')) {
      versionsPayload.push({
        modelGroup: SwitchFirmwareModelGroup.ICX82,
        version: form.getFieldValue('selectedICX82Version')
      })
    }
    return versionsPayload
  }

  const wizardFinish = {
    [SwitchFirmwareWizardType.update]: async () => {
      try {
        const versions = getVersionsPayload()
        const venueIds = form.getFieldValue('selectedVenueRowKeys')
        const venueRequests = Object.keys(venueIds).map(item => ({
          params: { venueId: venueIds[item] },
          payload: {
            versions
          }
        }))
        await batchUpdateSwitchVenueSchedules(venueRequests)

        const switchVenueGroups = _.groupBy(upgradeSwitchList, 'venueId')
        const switchRequests = Object.keys(switchVenueGroups).map(key =>
          ({
            params: { venueId: key },
            payload: {
              switchIds: switchVenueGroups[key].map(item => item.switchId),
              versions
            }
          }))
        await batchUpdateSwitchVenueSchedules(switchRequests)

        form.resetFields()
        props.setVisible(false)
      } catch (error) {
        console.log(error) // eslint-disable-line no-console
      }
    },
    [SwitchFirmwareWizardType.schedule]: async () => {
      try {
        const versions = getVersionsPayload()
        const venueIds = form.getFieldValue('selectedVenueRowKeys')
        const venueRequests = Object.keys(venueIds).map(item => ({
          params: { venueId: venueIds[item] },
          payload: {
            date: moment(form.getFieldValue('selectDateStep')).format('YYYY-MM-DD') || '',
            time: form.getFieldValue('selectTimeStep') || '',
            preDownload: form.getFieldValue('preDownloadChecked') || false,
            versions
          }
        }))
        await batchUpdateSwitchVenueSchedules(venueRequests)

        const switchVenueGroups = _.groupBy(upgradeSwitchList, 'venueId')
        const switchRequests = Object.keys(switchVenueGroups).map(key =>
          ({
            params: { venueId: key },
            payload: {
              date: moment(form.getFieldValue('selectDateStep')).format('YYYY-MM-DD') || '',
              time: form.getFieldValue('selectTimeStep') || '',
              preDownload: form.getFieldValue('preDownloadChecked') || false,
              switchIds: switchVenueGroups[key].map(item => item.switchId),
              versions
            }
          }))
        await batchUpdateSwitchVenueSchedules(switchRequests)

        form.resetFields()
        props.setVisible(false)
      } catch (error) {
        console.log(error) // eslint-disable-line no-console
      }
    },
    [SwitchFirmwareWizardType.skip]: async () => {
      const upgradeList: {
        currentUpgradeSwitchList: SwitchFirmwareV1002[],
        currentUpgradeVenueList: FirmwareSwitchVenueV1002[]
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
            const venueRequests = Object.keys(venueIds).map(item => ({
              params: { venueId: venueIds[item] },
              payload: {}
            }))
            await batchSkipSwitchUpgradeSchedules(venueRequests)

            const switchVenueGroups = _.groupBy(upgradeList.currentUpgradeSwitchList, 'venueId')
            const switchRequests = Object.keys(switchVenueGroups).map(key =>
              ({ params: { venueId: key },
                payload: { switchIds: switchVenueGroups[key].map(item => item.switchId) } }))
            await batchSkipSwitchUpgradeSchedules(switchRequests)

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
    let filterVersions: SwitchFirmwareVersion1002[] = availableVersions || []
    let currentUpgradeSwitchList = [] as SwitchFirmwareV1002[]
    let currentUpgradeVenueList = [] as FirmwareSwitchVenueV1002[]

    const nestedData = form.getFieldValue('nestedData')
    const selectedVenueRowKeys = form.getFieldValue('selectedVenueRowKeys')

    props.data.forEach((row: FirmwareSwitchVenueV1002) => {
      if (selectedVenueRowKeys.includes(row.venueId)) {
        filterVersions = checkCurrentVersionsV1002(
          row, filterVersions || [], (defaultReleaseVersions || []))

      } else if (nestedData[row.venueId]) {
        nestedData[row.venueId].selectedData.forEach((row: SwitchFirmwareV1002) => {
          if (row.switchId) {
            currentUpgradeSwitchList = currentUpgradeSwitchList.concat(row)
          }

          const modelGroup = getSwitchModelGroup(row.model)
          const selectedSwitch: FirmwareSwitchV1002 = {
            versions: [{ modelGroup, version: row.currentFirmware }],
            switchCounts: [{ modelGroup, count: 1 }]
          }
          filterVersions = checkCurrentVersionsV1002(
            selectedSwitch, filterVersions || [], (defaultReleaseVersions || []))
        })
      }
    })
    currentUpgradeVenueList = _.filter(props.data, obj =>
      selectedVenueRowKeys.includes(obj.venueId)) as FirmwareSwitchVenueV1002[]

    setUpgradeSwitchList(currentUpgradeSwitchList)
    setUpgradeVenueList(currentUpgradeVenueList)
    setHasVenue(selectedVenueRowKeys.length > 0)
    setUpgradeVersions(filterVersions)
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
            data={props.data as FirmwareSwitchVenueV1002[]}
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
                  upgradeVenueList={upgradeVenueList as FirmwareSwitchVenueV1002[]}
                  upgradeSwitchList={upgradeSwitchList as SwitchFirmwareV1002[]}
                  availableVersions={upgradeVersions}
                /> : <ScheduleStep
                  setShowSubTitle={setShowSubTitle}
                  visible={true}
                  hasVenue={hasVenue}
                  data={props.data}
                  upgradeVenueList={upgradeVenueList as FirmwareSwitchVenueV1002[]}
                  upgradeSwitchList={upgradeSwitchList as SwitchFirmwareV1002[]}
                  availableVersions={upgradeVersions}
                />
            }
          </StepsForm.StepForm>
        }
      </UI.SwitchFirmwareStepsForm>
    }
  />
}


