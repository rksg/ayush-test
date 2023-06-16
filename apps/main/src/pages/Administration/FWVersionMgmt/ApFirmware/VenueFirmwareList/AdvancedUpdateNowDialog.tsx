import { ReactNode, useEffect, useState } from 'react'

import { Select, Radio, RadioChangeEvent, Space, Typography, Checkbox } from 'antd'
import { CheckboxChangeEvent }                                          from 'antd/lib/checkbox'
import { useIntl }                                                      from 'react-intl'

import { Modal }     from '@acx-ui/components'
import {
  EolApFirmware,
  FirmwareCategory,
  FirmwareVenue,
  FirmwareVersion,
  UpdateNowRequest
} from '@acx-ui/rc/utils'

import { getVersionLabel } from '../../FirmwareUtils'

import * as UI                                              from './styledComponents'
import { firmwareNote1, firmwareNote2, VersionsSelectMode } from './UpdateNowDialog'

type UpdateNowRequestWithoutVenues = Exclude<UpdateNowRequest, 'venueIds'>

export interface AdvancedUpdateNowDialogProps {
  visible: boolean,
  onCancel: () => void,
  onSubmit: (data: UpdateNowRequest[]) => void,
  data?: FirmwareVenue[],
  availableVersions?: FirmwareVersion[],
  eolApFirmwares?: EolApFirmware[]
}

export function AdvancedUpdateNowDialog (props: AdvancedUpdateNowDialogProps) {
  const { $t } = useIntl()
  const intl = useIntl()
  const {
    visible,
    onSubmit,
    onCancel,
    data: venuesData = [],
    availableVersions,
    eolApFirmwares = []
  } = props
  const [disableSave, setDisableSave] = useState(false)
  const [updateNowRequestPayload, setUpdateNowRequestPayload] = useState<
    { [key: string]: UpdateNowRequestWithoutVenues | null }
  >()

  // eslint-disable-next-line max-len
  const defaultActiveVersion: FirmwareVersion | undefined = getDefaultActiveVersion(availableVersions)
  const otherActiveVersions: FirmwareVersion[] = filteredOtherActiveVersions(availableVersions)

  const getUpdateNowRequestPayload = () => {
    return Object.values(updateNowRequestPayload ?? {}).filter(value => value !== null)
  }

  useEffect(() => {
    setDisableSave(getUpdateNowRequestPayload().length === 0)
  }, [updateNowRequestPayload])

  const otherActiveVersionOptions = otherActiveVersions.map((version) => {
    return {
      label: getVersionLabel(intl, version),
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
    onCancel()
  }

  // eslint-disable-next-line max-len
  const updateSelectedABF = (abfId: string, value: UpdateNowRequestWithoutVenues | null) => {
    setUpdateNowRequestPayload({
      ...(updateNowRequestPayload ?? {}),
      [abfId]: value
    })
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
      destroyOnClose={true}
    >
      { defaultActiveVersion &&
        <div>
          <Typography style={{ fontWeight: 700 }}>
            {$t({ defaultMessage: 'Choose which version to update the venue to:' })}
          </Typography>
          <ABFSelector
            categoryId={'active'}
            abfLabel={$t({ defaultMessage: 'Active Device' })}
            defaultVersionId={defaultActiveVersion.id}
            defaultVersionLabel={getVersionLabel(intl, defaultActiveVersion)}
            otherVersions={otherActiveVersionOptions}
            update={updateSelectedABF}
          />
        </div>
      }
      { eolApFirmwares.length > 0
        ? eolApFirmwares.map((eol: EolApFirmware) => {
          return (
            <UI.Section key={eol.name}>
              <ABFSelector
                categoryId={eol.name}
                // eslint-disable-next-line max-len
                abfLabel={$t({ defaultMessage: 'Legacy Device ({eolName})' }, { eolName: eol.name })}
                defaultVersionId={eol.latestEolVersion}
                defaultVersionLabel={eol.latestEolVersion}
                defaultVersionExtraComponent={
                  <div style={{ marginLeft: '24px' }}>
                    {$t({ defaultMessage: 'AP Models: {apModels}' }, {
                      apModels: eol.apModels?.join(', ')
                    })}
                  </div>
                }
                update={updateSelectedABF}
              />
            </UI.Section>
          )
        })
        : null
      }
      <UI.Section>
        <UI.Ul>
          <UI.Li>{$t(firmwareNote1)}</UI.Li>
          <UI.Li>{$t(firmwareNote2)}</UI.Li>
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
  defaultVersionId: string
  defaultVersionLabel: string
  defaultVersionExtraComponent?: ReactNode
  otherVersions?: { label: string, value: string }[]
  update: (abfId: string, value: UpdateNowRequestWithoutVenues | null) => void
}

function ABFSelector (props: ABFSelectorProps) {
  const { categoryId, abfLabel, defaultVersionId, defaultVersionLabel, otherVersions = [],
    update, defaultVersionExtraComponent } = props
  const { $t } = useIntl()
  const [ disabledABF, setDisabledABF ] = useState(true)
  const [ selectMode, setSelectMode ] = useState(VersionsSelectMode.Radio)
  const [ selectedOtherVersion, setSelectedOtherVersion ] = useState('')

  const getSelectedActiveVersion = (): string => {
    return selectMode === VersionsSelectMode.Radio ? defaultVersionId : selectedOtherVersion
  }

  const getFirmwareResult = (): UpdateNowRequestWithoutVenues => {
    return {
      firmwareCategoryId: categoryId,
      firmwareVersion: getSelectedActiveVersion()
    } as UpdateNowRequestWithoutVenues
  }

  const doUpdate = (removed: boolean) => {
    update(categoryId, removed ? null : getFirmwareResult())
  }

  const onEnabledABFChange = (e: CheckboxChangeEvent) => {
    setDisabledABF(!e.target.checked)
  }

  const onSelectModeChange = (e: RadioChangeEvent) => {
    setSelectMode(e.target.value)
  }

  const onOtherVersionChange = (value: string) => {
    setSelectedOtherVersion(value)
  }

  useEffect(() => {
    doUpdate(disabledABF)
  }, [disabledABF, selectMode, selectedOtherVersion])

  return (<>
    <Checkbox onChange={onEnabledABFChange}>
      <UI.TitleActive>{abfLabel}</UI.TitleActive>
    </Checkbox>
    <UI.ValueContainer className={disabledABF ? 'disabled' : ''}>
      <Radio.Group
        onChange={onSelectModeChange}
        value={selectMode}
        disabled={disabledABF}
      >
        <Space direction={'vertical'}>
          <Radio value={VersionsSelectMode.Radio}>{defaultVersionLabel}</Radio>
          { defaultVersionExtraComponent }
          { otherVersions.length > 0 ?
            <UI.SelectDiv>
              <Radio value={VersionsSelectMode.Dropdown} />
              <Select
                style={{ width: '420px', fontSize: '12px' }}
                placeholder={$t({ defaultMessage: 'Select other version...' })}
                value={selectedOtherVersion}
                onChange={onOtherVersionChange}
                options={otherVersions}
                disabled={disabledABF}
              />
            </UI.SelectDiv>
            : null
          }
        </Space>
      </Radio.Group>
    </UI.ValueContainer>
  </>)
}
