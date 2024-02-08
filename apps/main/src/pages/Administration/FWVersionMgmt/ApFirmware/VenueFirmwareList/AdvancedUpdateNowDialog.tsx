import { useEffect, useMemo, useState } from 'react'

import { Radio, RadioChangeEvent, Space } from 'antd'
import { DefaultOptionType }              from 'antd/lib/select'
import { defineMessage, useIntl }         from 'react-intl'

import { Modal, Tooltip }   from '@acx-ui/components'
import { InformationSolid } from '@acx-ui/icons'
import {
  FirmwareCategory,
  FirmwareVenue,
  FirmwareVersion,
  UpdateNowRequest
} from '@acx-ui/rc/utils'

import { findMaxActiveABFVersion, findMaxEolABFVersions, getActiveApModels, getVersionLabel, isBetaFirmware, MaxABFVersionMap } from '../../FirmwareUtils'

import * as UI                                                                                       from './styledComponents'
import { SupportedAPModelsList }                                                                     from './SupportedAPModelsList'
import { firmwareNote1, firmwareNote2 }                                                              from './UpdateNowDialog'
import { EolApFirmwareGroup, getRemainingApModels, UpgradableApModelsAndFamilies, useApEolFirmware } from './useApEolFirmware'

const abfLabelMessage = defineMessage({ defaultMessage: 'Available firmware' })
// eslint-disable-next-line max-len
const abfLabelMessageWithApModelFamilies = defineMessage({ defaultMessage: 'Available firmware for {families} AP' })

type UpdateNowRequestWithoutVenues = Exclude<UpdateNowRequest, 'venueIds'> | null

export interface AdvancedUpdateNowDialogProps {
  onCancel: () => void,
  onSubmit: (data: UpdateNowRequest[]) => void,
  data?: FirmwareVenue[],
  availableVersions?: FirmwareVersion[]
}

export function AdvancedUpdateNowDialog (props: AdvancedUpdateNowDialogProps) {
  const {
    getAvailableEolApFirmwareGroups,
    getEolABFOtherVersionsOptions,
    getDefaultEolVersionLabel,
    findUpgradableApModelsAndFamilies
  } = useApEolFirmware()
  const intl = useIntl()
  const { onSubmit, onCancel, data: venuesData = [], availableVersions } = props
  const eolApFirmwareGroups = getAvailableEolApFirmwareGroups(venuesData)
  const eolABFOtherVersion = getEolABFOtherVersionsOptions(venuesData)
  const [disableSave, setDisableSave] = useState(false)
  const [updateNowRequestPayload, setUpdateNowRequestPayload] = useState<
    { [abfName: string]: UpdateNowRequestWithoutVenues }
  >()

  // eslint-disable-next-line max-len
  const defaultActiveVersion: FirmwareVersion | undefined = getDefaultActiveVersion(availableVersions)
  const otherActiveVersions: FirmwareVersion[] = filteredOtherActiveVersions(availableVersions)

  // eslint-disable-next-line max-len
  const [upgradableApModelsAndFamilies, setUpgradableApModelsAndFamilies] = useState<UpgradableApModelsAndFamilies>()
  const maxABFVersions: MaxABFVersionMap = useMemo(() => {
    const eolABFVersions = findMaxEolABFVersions(venuesData)
    const activeABFVersons = findMaxActiveABFVersion(venuesData)

    return {
      ...eolABFVersions,
      active: { ...activeABFVersons, latestVersion: '' }
    }
  }, [venuesData])

  const compactUpdateNowRequestPayload = () => {
    return Object.values(updateNowRequestPayload ?? {})
      .filter(value => value !== null && value.firmwareVersion !== '')
  }

  useEffect(() => {
    setDisableSave(compactUpdateNowRequestPayload().length === 0)
  }, [updateNowRequestPayload])

  useEffect(() => {
    if (!updateNowRequestPayload || !maxABFVersions) return

    const targetVersions: string[] = []
    Object.keys(maxABFVersions).forEach(abfId => {
      // eslint-disable-next-line max-len
      targetVersions.push(updateNowRequestPayload?.[abfId]?.firmwareVersion ?? maxABFVersions[abfId].maxVersion)
    })

    setUpgradableApModelsAndFamilies(findUpgradableApModelsAndFamilies(targetVersions, venuesData))
  }, [updateNowRequestPayload, maxABFVersions])

  const otherActiveVersionOptions = otherActiveVersions.map((version) => {
    return {
      label: getVersionLabel(intl, version, isBetaFirmware(version.category)),
      value: version.name
    }
  })

  const createRequest = (): UpdateNowRequest[] => {
    return compactUpdateNowRequestPayload().map(req => {
      return { ...req, venueIds: venuesData.map(venue => venue.id) }
    })
  }

  const triggerSubmit = () => {
    onSubmit(createRequest())
    onModalCancel()
  }

  const onModalCancel = () => {
    setUpdateNowRequestPayload({})
    onCancel()
  }

  const updateSelectedABF = (abfId: string, value: UpdateNowRequestWithoutVenues) => {
    setUpdateNowRequestPayload((current) => ({
      ...(current ?? {}),
      [abfId]: value
    }))
  }

  return (
    <Modal
      title={intl.$t({ defaultMessage: 'Update Now' })}
      visible={true}
      width={560}
      okText={intl.$t({ defaultMessage: 'Update Firmware' })}
      onOk={triggerSubmit}
      onCancel={onModalCancel}
      okButtonProps={{ disabled: disableSave }}
      destroyOnClose={true}
    >
      <UI.Section key='active'>{
        defaultActiveVersion
          ?
          <ABFSelector
            abfName={'active'}
            upgradableApModelsAndFamilies={upgradableApModelsAndFamilies}
            defaultChecked={true}
            defaultVersionId={defaultActiveVersion.id}
            defaultVersionLabel={getVersionLabel(intl, defaultActiveVersion)}
            otherVersions={otherActiveVersionOptions}
            update={updateSelectedABF}
          />
          : <ABFUpgradeWarning
            abfName={'active'}
            apModels={getActiveApModels(venuesData)}
            upgradableApModelsAndFamilies={upgradableApModelsAndFamilies}
            isLegacyABF={false}
          />
      }
      </UI.Section>
      { eolApFirmwareGroups.length > 0
        ? eolApFirmwareGroups.map((eol: EolApFirmwareGroup) => {
          return <UI.Section key={eol.name}>
            {eol.isUpgradable
              ? <ABFSelector
                abfName={eol.name}
                upgradableApModelsAndFamilies={upgradableApModelsAndFamilies}
                defaultChecked={true}
                defaultVersionId={eol.latestEolVersion}
                defaultVersionLabel={getDefaultEolVersionLabel(eol.latestEolVersion)}
                otherVersions={eolABFOtherVersion[eol.name] ? eolABFOtherVersion[eol.name] : []}
                update={updateSelectedABF}
              />
              : <ABFUpgradeWarning
                abfName={eol.name}
                apModels={eol.apModels}
                upgradableApModelsAndFamilies={upgradableApModelsAndFamilies}
                isLegacyABF={true}
              />
            }
          </UI.Section>
        })
        : null
      }
      <UI.Section>
        <UI.Ul>
          <UI.Li>{intl.$t(firmwareNote1)}</UI.Li>
          <UI.Li>{intl.$t(firmwareNote2)}</UI.Li>
        </UI.Ul>
      </UI.Section>
    </Modal>
  )
}

function findDefaultActiveVersionIndex (availableVersions: FirmwareVersion[]): number {
  if (availableVersions.length === 0) return -1

  const firstIndex = availableVersions.findIndex(v => v.category === FirmwareCategory.RECOMMENDED)
  return firstIndex === -1 ? 0 : firstIndex
}

// eslint-disable-next-line max-len
export function getDefaultActiveVersion (availableVersions?: FirmwareVersion[]): FirmwareVersion | undefined {
  if (!availableVersions) return

  const index = findDefaultActiveVersionIndex(availableVersions)
  return index === -1 ? undefined : { ...availableVersions[index] }
}

// eslint-disable-next-line max-len
export function filteredOtherActiveVersions (availableVersions?: FirmwareVersion[]): FirmwareVersion[] {
  if (!availableVersions) return []

  const index = findDefaultActiveVersionIndex(availableVersions)

  if (index === -1) return []

  const copied = [...availableVersions]
  copied.splice(index, 1)

  return copied
}

interface ABFSelectorProps {
  abfName: string
  upgradableApModelsAndFamilies?: UpgradableApModelsAndFamilies
  defaultChecked?: boolean
  defaultVersionId: string
  defaultVersionLabel: string
  otherVersions?: DefaultOptionType[]
  update: (abfId: string, value: UpdateNowRequestWithoutVenues ) => void
}

function ABFSelector (props: ABFSelectorProps) {
  const { abfName, upgradableApModelsAndFamilies, defaultChecked = false,
    defaultVersionId, defaultVersionLabel, otherVersions = [], update } = props
  const { $t } = useIntl()
  const [ selectedVersion, setSelectedVersion ] = useState(defaultChecked ? defaultVersionId : '')
  const targetUpgradableAbfInfo = upgradableApModelsAndFamilies?.[abfName]
  const abfLabel = (targetUpgradableAbfInfo?.familyNames ?? []).length > 0
    // eslint-disable-next-line max-len
    ? $t(abfLabelMessageWithApModelFamilies, { families: targetUpgradableAbfInfo!.familyNames.join(', ') })
    : $t(abfLabelMessage)
  const apModels = (targetUpgradableAbfInfo?.apModels ?? []).join(', ')

  const getFirmwareResult = (): UpdateNowRequestWithoutVenues => {
    if (!selectedVersion) return null

    return {
      firmwareCategoryId: abfName,
      firmwareVersion: selectedVersion
    } as UpdateNowRequestWithoutVenues
  }

  const doUpdate = () => {
    update(abfName, getFirmwareResult())
  }

  const onSelectedVersionChange = (e: RadioChangeEvent) => {
    setSelectedVersion(e.target.value)
  }

  useEffect(() => {
    doUpdate()
  }, [selectedVersion])

  return (<>
    <UI.LabelWithHint>
      <UI.TitleActive>
        {abfLabel}&nbsp;
        ({ apModels
          ? apModels
          // eslint-disable-next-line max-len
          : <span className='empty'>{$t({ defaultMessage: 'No affected AP for this upgrade' })}</span>
        })
      </UI.TitleActive>
      <Tooltip
        overlayInnerStyle={{ minWidth: '500px' }}
        children={<InformationSolid />}
        title={<SupportedAPModelsList />}
      />
    </UI.LabelWithHint>
    <UI.ValueContainer>
      <Radio.Group
        onChange={onSelectedVersionChange}
        value={selectedVersion}
      >
        <Space direction={'vertical'} size={12}>
          <Radio key={defaultVersionId} value={defaultVersionId}>
            {defaultVersionLabel}
          </Radio>
          { otherVersions.map(versionOption => {
            return <Radio key={versionOption.value} value={versionOption.value}>
              {versionOption.label}
            </Radio>
          })
          }
          <Radio key={'NONE'} value={''}>
            {$t({ defaultMessage: 'Do not update firmware on selected venue(s)' })}
          </Radio>
        </Space>
      </Radio.Group>
    </UI.ValueContainer>
  </>)
}

interface ABFUpgradeWarningProp {
  abfName: string
  apModels: string[]
  upgradableApModelsAndFamilies?: UpgradableApModelsAndFamilies
  isLegacyABF: boolean
}
export function ABFUpgradeWarning (props: ABFUpgradeWarningProp) {
  const { abfName, apModels, upgradableApModelsAndFamilies, isLegacyABF } = props
  const { $t } = useIntl()
  const remainingApModels = getRemainingApModels(abfName, apModels, upgradableApModelsAndFamilies)

  if (remainingApModels.length === 0) return null

  // eslint-disable-next-line max-len
  const legacyDevicesMessage = defineMessage({ defaultMessage: 'There are one or more legacy devices in selected venues ({apModels}).' })
  // eslint-disable-next-line max-len
  const activeDevicesMessage = defineMessage({ defaultMessage: 'There are one or more devices in selected venues ({apModels}).' })

  return <>
    <div>{
      $t(isLegacyABF
        ? legacyDevicesMessage
        : activeDevicesMessage,
      { apModels: remainingApModels.join(', ') })
    }</div>
    <div>{$t({ defaultMessage: 'No available firmware.' })}</div>
  </>
}
