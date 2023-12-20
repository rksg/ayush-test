import { useEffect, useState } from 'react'

import { Radio, RadioChangeEvent, Space } from 'antd'
import { DefaultOptionType }              from 'antd/lib/select'
import _                                  from 'lodash'
import { useIntl }                        from 'react-intl'

import { Modal }     from '@acx-ui/components'
import {
  FirmwareCategory,
  FirmwareVenue,
  FirmwareVersion,
  UpdateNowRequest
} from '@acx-ui/rc/utils'

import { getVersionLabel, isBetaFirmware } from '../../FirmwareUtils'

import * as UI                                  from './styledComponents'
import { firmwareNote1, firmwareNote2 }         from './UpdateNowDialog'
import { EolApFirmwareGroup, useApEolFirmware } from './useApEolFirmware'

type UpdateNowRequestWithoutVenues = Exclude<UpdateNowRequest, 'venueIds'>

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
    getDefaultEolVersionLabel
  } = useApEolFirmware()
  const intl = useIntl()
  const { onSubmit, onCancel, data: venuesData = [], availableVersions } = props
  const eolApFirmwareGroups = getAvailableEolApFirmwareGroups(venuesData)
  const eolABFOtherVersion = getEolABFOtherVersionsOptions(venuesData)
  const [disableSave, setDisableSave] = useState(false)
  const [updateNowRequestPayload, setUpdateNowRequestPayload] = useState<
    { [key: string]: UpdateNowRequestWithoutVenues | null }
  >()

  const EOL_ABF_LABEL = {
    'ABF2-3R': intl.$t({ defaultMessage: 'Available firmware for Wi-Fi 6, 6E and 11ac wave2 AP' }),
    'eol-ap-2022-12': intl.$t({ defaultMessage: 'Available firmware for 11ac AP' })
  } as { [key: string]: string }

  // eslint-disable-next-line max-len
  const defaultActiveVersion: FirmwareVersion | undefined = getDefaultActiveVersion(availableVersions)
  const otherActiveVersions: FirmwareVersion[] = filteredOtherActiveVersions(availableVersions)
  const activeApModels = venuesData
    .map(venue => {
      return venue.apModels
        ? _.difference(venue.apModels, venue.currentVenueUnsupportedApModels ?? []) // filter out the unsupported AP models, ACX-44848
        : []
    })
    .flat()
  const uniqueActiveApModels = [...new Set(activeApModels)].join(', ')

  const getUpdateNowRequestPayload = () => {
    return Object.values(updateNowRequestPayload ?? {})
      .filter(value => value !== null && value.firmwareVersion !== '')
  }

  useEffect(() => {
    setDisableSave(getUpdateNowRequestPayload().length === 0)
  }, [updateNowRequestPayload])

  const otherActiveVersionOptions = otherActiveVersions.map((version) => {
    return {
      label: getVersionLabel(intl, version, isBetaFirmware(version.category)),
      value: version.name
    }
  })

  const createRequest = (): UpdateNowRequest[] => {
    return getUpdateNowRequestPayload().map(req => {
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

  const updateSelectedABF = (abfId: string, value: UpdateNowRequestWithoutVenues | null) => {
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
      { defaultActiveVersion
        ? <UI.Section>
          <ABFSelector
            categoryId={'active'}
            abfLabel={intl.$t({ defaultMessage: 'Available firmware for Wi-Fi 7 AP' })}
            defaultChecked={true}
            defaultVersionId={defaultActiveVersion.id}
            defaultVersionLabel={getVersionLabel(intl, defaultActiveVersion)}
            apModels={uniqueActiveApModels}
            otherVersions={otherActiveVersionOptions}
            update={updateSelectedABF}
          />
        </UI.Section>
        : (uniqueActiveApModels && <UI.Section>
          <div>{// eslint-disable-next-line max-len
            intl.$t({ defaultMessage: 'There are one or more devices in selected venues ({apModels}).' }, { apModels: uniqueActiveApModels })}
          </div>
          <div>{intl.$t({ defaultMessage: 'No available firmware.' })}</div>
        </UI.Section>)
      }
      { eolApFirmwareGroups.length > 0
        ? eolApFirmwareGroups.map((eol: EolApFirmwareGroup) => {
          return <UI.Section key={eol.name}>
            {eol.isUpgradable
              ? <ABFSelector
                categoryId={eol.name}
                abfLabel={EOL_ABF_LABEL[eol.name]}
                defaultChecked={true}
                defaultVersionId={eol.latestEolVersion}
                defaultVersionLabel={getDefaultEolVersionLabel(eol.latestEolVersion)}
                apModels={eol.apModels?.join(', ')}
                otherVersions={eolABFOtherVersion[eol.name] ? eolABFOtherVersion[eol.name] : []}
                update={updateSelectedABF}
              />
              : <><div>{// eslint-disable-next-line max-len
                intl.$t({ defaultMessage: 'There are one or more legacy devices in selected venues ({eolApModels}).' }, { eolApModels: eol.apModels.join(', ') })}
              </div>
              <div>{intl.$t({ defaultMessage: 'No available firmware.' })}</div></>
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
  categoryId: string
  abfLabel: string
  defaultChecked?: boolean
  defaultVersionId: string
  defaultVersionLabel: string
  apModels?: string
  otherVersions?: DefaultOptionType[]
  update: (abfId: string, value: UpdateNowRequestWithoutVenues | null) => void
}

function ABFSelector (props: ABFSelectorProps) {
  const { categoryId, abfLabel, defaultChecked = false, defaultVersionId, defaultVersionLabel,
    otherVersions = [], update, apModels = '' } = props
  const { $t } = useIntl()
  const [ selectedVersion, setSelectedVersion ] = useState(defaultChecked ? defaultVersionId : '')

  const getFirmwareResult = (): UpdateNowRequestWithoutVenues | null => {
    if (!selectedVersion) return null

    return {
      firmwareCategoryId: categoryId,
      firmwareVersion: selectedVersion
    } as UpdateNowRequestWithoutVenues
  }

  const doUpdate = () => {
    update(categoryId, getFirmwareResult())
  }

  const onSelectedVersionChange = (e: RadioChangeEvent) => {
    setSelectedVersion(e.target.value)
  }

  useEffect(() => {
    doUpdate()
  }, [selectedVersion])

  return (<>
    <UI.TitleActive>
      {abfLabel}&nbsp;
      ({ apModels
        ? apModels
        // eslint-disable-next-line max-len
        : <span className='empty'>{$t({ defaultMessage: 'No Access Point in selected venue(s)' })}</span>
      })
    </UI.TitleActive>
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
