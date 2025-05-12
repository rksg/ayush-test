/* eslint-disable max-len */
import { useCallback, useContext, useEffect, useState } from 'react'

import { Col, Row, Select, Space, Radio }                              from 'antd'
import { MessageDescriptor, defineMessage, useIntl, FormattedMessage } from 'react-intl'

import {
  cssStr
} from '@acx-ui/components'
import {
  SelectItemOption
} from '@acx-ui/rc/components'
import {
  ApBandModeSettingsV1Dot1,
  BandModeEnum
} from '@acx-ui/rc/utils'

import { ApDataContext } from '../..'

export interface ApBandManagementPorps {
  venueBandMode: BandModeEnum
  apGroupBandMode: BandModeEnum
  currentApBandModeData: ApBandModeSettingsV1Dot1
  setCurrentApBandModeData: (data: ApBandModeSettingsV1Dot1) => void,
  venueOrApGroupDisplayName: string,
  disabled?: boolean
}

const bandCombinationLabelMapping: Record<BandModeEnum, MessageDescriptor> = {
  [BandModeEnum.DUAL]: defineMessage({ defaultMessage: 'Dual-band' }),
  [BandModeEnum.TRIPLE]: defineMessage({ defaultMessage: 'Tri-band' })
}

export const ApBandManagementV1Dot1 = ({ venueBandMode, apGroupBandMode, currentApBandModeData, setCurrentApBandModeData,
  venueOrApGroupDisplayName, disabled }: ApBandManagementPorps) => {

  const { $t } = useIntl()

  const { apCapabilities } = useContext(ApDataContext)

  const [bandCombinationOptions, setBandCombinationOptions] = useState<SelectItemOption[]>([])

  const getCurrentBandMode = useCallback(() => {
    return (currentApBandModeData?.useVenueOrApGroupSettings ? (venueOrApGroupDisplayName ? venueBandMode : apGroupBandMode) : currentApBandModeData?.bandMode)
  }, [currentApBandModeData, venueBandMode, apGroupBandMode, venueOrApGroupDisplayName])

  const onChangeBandCombination = (value: BandModeEnum) => {
    console.info('[RadioSettings][ApBandManagement] onChangeBandCombination, value = ', value) // eslint-disable-line no-console
    setCurrentApBandModeData({ ...currentApBandModeData, bandMode: value })
  }

  useEffect(() => {
    const {
      supportTriRadio = false,
      supportBandCombination = false,
      bandCombinationCapabilities = []
    } = apCapabilities || {}

    setBandCombinationOptions(((!supportBandCombination && supportTriRadio)? [BandModeEnum.DUAL, BandModeEnum.TRIPLE] : bandCombinationCapabilities).map(bandMode => ({ label: $t(bandCombinationLabelMapping[bandMode]), value: bandMode })))
  }, [apCapabilities])

  return (<div style={{ marginTop: '1em' }}>
    <Row gutter={0}>
      <Col span={4} style={{ fontWeight: '600', paddingLeft: '2px' }}>
          Band Management:
      </Col>
    </Row>
    <Row gutter={20}>
      <Col span={12}>
        <Space style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '14px',
          paddingTop: '20px',
          paddingLeft: '5px',
          paddingBottom: '20px' }}
        >
          {
            <Radio.Group
              data-testid='ap-bandManagement'
              value={currentApBandModeData?.useVenueOrApGroupSettings}
              onChange={(e) => {
                setCurrentApBandModeData({
                  ...currentApBandModeData,
                  useVenueOrApGroupSettings: e.target.value
                })
              }}
            >
              <Space direction='vertical'>
                <Radio value={true} data-testid='ap-bandManagement-useVenueOrApGroupSettings'>
                  <FormattedMessage
                    defaultMessage={'Use inherited settings from <venueOrApGroupName></venueOrApGroupName>'}
                    values={{
                      venueOrApGroupName: () => {
                        return venueOrApGroupDisplayName ? 'AP Group' : 'Venue'
                      }
                    }}
                  />
                </Radio>
                <Radio value={false} data-testid='ap-bandManagement-customize'>
                  {$t({ defaultMessage: 'Customize settings' })}
                </Radio>
              </Space>
            </Radio.Group>
          }
        </Space>
      </Col>
    </Row>
    <Row gutter={20}>
      <Col span={14}>
        <div style={{ color: cssStr('--acx-neutrals-60'), paddingLeft: '5px' }}>
          {$t({ defaultMessage: 'Band Operation Mode' })}
        </div>
      </Col>
    </Row>
    <Row gutter={20} style={{ alignItems: 'center', padding: '5px 0', paddingLeft: '5px' }}>
      <Col span={8}>
        {
          disabled || currentApBandModeData?.useVenueOrApGroupSettings ? (
            <div>
              {
                bandCombinationOptions.find(
                  (option) => option.value === getCurrentBandMode()
                )?.label
              }
            </div>
          ) : (
            <Select
              style={{ width: '100%' }}
              defaultValue={getCurrentBandMode()}
              value={getCurrentBandMode()}
              options={bandCombinationOptions}
              onChange={onChangeBandCombination}
            />
          )
        }
      </Col>
    </Row>
  </div>)
}