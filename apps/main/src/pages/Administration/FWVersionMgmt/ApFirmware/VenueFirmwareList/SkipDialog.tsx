import { useEffect, useState } from 'react'

import { Col, Select, Form, FormInstance, Input, Radio, RadioChangeEvent, Row, Space } from 'antd'
import { useForm }                                                             from 'antd/lib/form/Form'
import { useIntl }                                                             from 'react-intl'

import { noDataSymbol }                                               from '@acx-ui/analytics/utils'
import { Button, Modal }                                              from '@acx-ui/components'
import { DeleteOutlinedIcon }                                         from '@acx-ui/icons'
import { useLazyGetMacRegListQuery, useLazyGetPersonaGroupByIdQuery } from '@acx-ui/rc/services'
import { MacAddressFilterRegExp, MacRegistrationPool }                from '@acx-ui/rc/utils'
import {
  firmwareTypeTrans,
  FirmwareVenue,
  FirmwareVersion,
  FirmwareType,
  UpdateNowRequest,
  usePollingTableQuery
} from '@acx-ui/rc/utils'


import * as UI from './styledComponents'
// import { PersonaDeviceItem } from './PersonaDevicesForm'

enum DevicesImportMode {
  FromClientDevices,
  Manually
}

interface DevicesImportDialogProps {
  visible: boolean,
  onCancel: () => void,
  onSubmit: (data: []) => void,
  personaGroupId?: string
}

export interface SkipDialogProps {
  visible: boolean,
  onCancel: () => void,
  onSubmit: (data: []) => void,
  firmwareType: FirmwareType,
  data?: FirmwareVenue[],
  availableVersions?: any,
  eol?: boolean,
  eolName?: string,
  latestEolVersion?: string,
  eolModels?: any
}

export function SkipDialog (props: SkipDialogProps) {
  const { $t } = useIntl()
  const [form] = useForm()
  const [importMode, setImportMode] = useState(DevicesImportMode.FromClientDevices)
  const [getPersonaGroupById] = useLazyGetPersonaGroupByIdQuery()
  const [getMacRegistrationById] = useLazyGetMacRegListQuery()
  const [macRegistrationPool, setMacRegistrationPool] = useState<MacRegistrationPool>()
  const { visible, onSubmit, onCancel, data, availableVersions, eol } = props
  const subTitle = 'Skip This Update?'
  // const [versionOptions, setVersionOptions] = useState<FirmwareVersion[]>([])
  let versionOptions: FirmwareVersion[] = []
  // const [otherVersions, setOtherVersions] = useState<FirmwareVersion[]>([])
  let otherVersions: FirmwareVersion[] = []

  let title: string
  // let versionOptions: FirmwareVersion[] = availableVersions
  let versionRadio: string = 'latestVersion'
  let eolRadio: string = 'eolVersion'
  // let otherVersions: any = []
  let firmwareType: FirmwareType
  // let FirmwareType = FirmwareType
  // let data: any = null
  let selectedVersion: any = null
  // let eol: boolean = false
  let eolName: string = ''
  let latestEolVersion: string= ''
  let eolModels: any = null

    // this.firmwareType = this.params.firmwareType
    // this.availableVersions = this.params.availableVersions
    // this.data = this.params.data
    // if (this.availableVersions.length > 1) {
    //   this.initFirstRow()
    // }
    // this.initTitle()
    // this.initEol()

  const initFirstRow = () => {
    let copyAvailableVersions = availableVersions ? [...availableVersions] : []
    let firstIndex = copyAvailableVersions.findIndex(isRecommanded)
    if (firstIndex > 0) {
      let removed = copyAvailableVersions.splice(firstIndex, 1)
      // setVersionOptions([...removed, ...copyAvailableVersions])
      versionOptions = [...removed, ...copyAvailableVersions]
    } else {
      // setVersionOptions([...copyAvailableVersions])
      versionOptions = [...copyAvailableVersions]
    }
    // setOtherVersions(versionOptions.slice(1))
    // setOtherVersions([...copyAvailableVersions])
    otherVersions = [...copyAvailableVersions]
    setOptionLabel()
  }

  const isRecommanded = (e: FirmwareVersion) => {
    return e.category === 'RECOMMENDED'
  }

  const initEol = () => {
    // this.eol = this.params?.eol
    // this.eolName = this.params?.eolName
    // this.latestEolVersion = this.params?.latestEolVersion
    // this.eolModels = this.params?.eolModels
  }

  const initTitle = () => {
    title = 'Choose which version to update the venue to:'
  }

  // btnClicked = () => {
  // const request = this.createUpdateScheduleRequest()

  // this.deferred.resolve(request)
  // this.dialogService.close('UpdateApNowDialogComponent')
  // }

  const setOptionLabel = (): void => {
    // otherVersions = otherVersions.map((v: any) => {
    //   v['optionLabel'] = getVersionLabel(v)
    //   return v
    // })
  }

  const transform = firmwareTypeTrans()

  const getVersionLabel = (version: FirmwareVersion): string => {
    const versionName = version.name
    const versionType = transform(version.category)
    const versionOnboardDate = transformToUserDate(version)

    return `${versionName} (${versionType}) ${versionOnboardDate ? '- ' + versionOnboardDate : ''}`
  }

  const transformToUserDate = (firmwareVersion: FirmwareVersion): string | undefined => {
    // return this.firmwareUpgradeService.transformToUserDate(firmwareVersion.onboardDate)
    return firmwareVersion.onboardDate
  }

  const createUpdateScheduleRequest = (): UpdateNowRequest[] => {
    let version
    if (versionRadio === 'latestVersion') {
      version = versionOptions[0]
    } else {
      version = selectedVersion
    }
    // const venuesData = this.params.data as FirmwareVenue[]
    const venuesData = [] as FirmwareVenue[]
    let request = []
    if (version) {
      request.push({
        firmwareCategoryId: 'active',
        firmwareVersion: version.id,
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

    // console.table(request)

    return request
  }

  initFirstRow()
  // useEffect(() => {
  //   initFirstRow()
  // }, [])
  // initFirstRow()
  // useEffect(() => {
  //   if (!personaGroupId) return

  //   getPersonaGroupById({ params: { groupId: personaGroupId } })
  //     .then(result => {
  //       if (!result.data || !result.data?.macRegistrationPoolId) return

  //       getMacRegistrationById({
  //         params: { policyId: result.data.macRegistrationPoolId }
  //       }).then(result => {
  //         if (!result.data) return
  //         setMacRegistrationPool(result.data)
  //       })
  //     })
  // }, [personaGroupId])

  const triggerSubmit = () => {
    // FIXME: need to filter unique device items, but it have type issue
    form.validateFields()
      .then(values => {
        // console.log('Current dialog fields value = ', values)
        onSubmit(values.devices ?? [])
        onModalCancel()
      })
  }

  const onImportModeChange = (e: RadioChangeEvent) => {
    setImportMode(e.target.value)
  }

  const onModalCancel = () => {
    form.resetFields()
    setImportMode(DevicesImportMode.FromClientDevices)
    onCancel()
  }

  const disableSave = false

  return (
    <Modal
      title={$t({ defaultMessage: 'Skip Now' })}
      subTitle={subTitle}
      visible={visible}
      width={560}
      okText={$t({ defaultMessage: 'Skip' })}
      onOk={triggerSubmit}
      onCancel={onModalCancel}
      okButtonProps={{ disabled: disableSave }}
    >
      <Form
        form={form}
        name={'deviceModalForm'}
      >
        <Form.Item
          name={'importDevicesMode'}
          initialValue={DevicesImportMode.FromClientDevices}
        >
          <UI.TitleActive>
          Please confirm that you wish to exclude the selected venues from this scheduled update</UI.TitleActive>
        </Form.Item>
      </Form>
    </Modal>
  )
}
