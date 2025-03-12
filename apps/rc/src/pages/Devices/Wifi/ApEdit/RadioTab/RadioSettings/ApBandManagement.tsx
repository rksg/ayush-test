/* eslint-disable max-len */
import { useCallback, useContext, useEffect, useState } from 'react'

import { Col, Row, Select }                          from 'antd'
import { MessageDescriptor, defineMessage, useIntl } from 'react-intl'

import {
  Button,
  cssStr
} from '@acx-ui/components'
import {
  SelectItemOption
} from '@acx-ui/rc/components'
import {
  ApBandModeSettings,
  BandModeEnum,
  VenueExtended
} from '@acx-ui/rc/utils'

import { ApDataContext } from '../..'

import { VenueNameDisplay } from './RadioSettings'

export interface ApBandManagementPorps {
  venue: VenueExtended | undefined
  venueBandMode: BandModeEnum
  isSupportDual5GAp: boolean
  isSupportTriBandRadioAp: boolean
  currentApBandModeData: ApBandModeSettings
  setCurrentApBandModeData: (data: ApBandModeSettings) => void,
  disabled?: boolean
}

const bandCombinationLabelMapping: Record<BandModeEnum, MessageDescriptor> = {
  [BandModeEnum.DUAL]: defineMessage({ defaultMessage: 'Dual-band' }),
  [BandModeEnum.TRIPLE]: defineMessage({ defaultMessage: 'Tri-band' })
}

export const ApBandManagement = ({ venue, venueBandMode, isSupportDual5GAp, isSupportTriBandRadioAp,
  currentApBandModeData, setCurrentApBandModeData, disabled }: ApBandManagementPorps) => {

  const { $t } = useIntl()

  const { apCapabilities } = useContext(ApDataContext)

  const [bandCombinationOptions, setBandCombinationOptions] = useState<SelectItemOption[]>([])

  const getCurrentBandMode = useCallback(() => {
    return (currentApBandModeData?.useVenueSettings ? venueBandMode : currentApBandModeData?.bandMode)
  }, [currentApBandModeData, venueBandMode])

  const onClickUseVenueSettings = () => {
    setCurrentApBandModeData({ ...currentApBandModeData,
      useVenueSettings: !currentApBandModeData.useVenueSettings })
  }

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
      <Col span={4}>
        Band Management
      </Col>
      { currentApBandModeData.useVenueSettings && <Col span={4}>
        {$t({ defaultMessage: '(as <venueSingular></venueSingular>: <venuelink></venuelink>)' }, {
          venuelink: () => venue ? <VenueNameDisplay venue={venue} /> : ''
        })}
      </Col> }
    </Row>
    <Row gutter={20} style={{ alignItems: 'center', padding: '5px 0' }}>
      <Col span={8}>
        <Select
          style={{ width: '100%' }}
          defaultValue={getCurrentBandMode()}
          value={getCurrentBandMode()}
          disabled={disabled || currentApBandModeData?.useVenueSettings}
          options={bandCombinationOptions}
          onChange={onChangeBandCombination}
        />
      </Col>
      <Col span={3} style={{ paddingLeft: '8px' }}>
        <Button type='link' disabled={disabled} onClick={onClickUseVenueSettings}>
          { currentApBandModeData.useVenueSettings ? $t({ defaultMessage: 'Change' }) : $t({ defaultMessage: 'Same as <VenueSingular></VenueSingular>' }) }
        </Button>
      </Col>
    </Row>
    <Row gutter={20}>
      <Col span={14}>
        <div style={{ color: cssStr('--acx-neutrals-50'), paddingLeft: '5px', marginBottom: '24px' }}>
          {
            $t(
              { defaultMessage: 'Operating bands: {context}' },
              { context: '2.4 GHz, ' + ((!isSupportDual5GAp || getCurrentBandMode() === BandModeEnum.TRIPLE) ? '5 GHz' : 'Lower/Upper 5 GHz') + ((isSupportTriBandRadioAp && getCurrentBandMode() === BandModeEnum.TRIPLE) ? ', and 6 GHz' : '') }
            )
          }
        </div>
      </Col>
    </Row>
  </div>)
}
