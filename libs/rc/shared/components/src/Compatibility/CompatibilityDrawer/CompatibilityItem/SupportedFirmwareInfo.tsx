import React from 'react'

import { useIntl } from 'react-intl'

import { Features, useIsSplitOn }                                                             from '@acx-ui/feature-toggle'
import { useGetApModelFamiliesQuery }                                                         from '@acx-ui/rc/services'
import { ApIncompatibleFeature, ApRequirement, CompatibilityDeviceEnum, IncompatibleFeature } from '@acx-ui/rc/utils'

import { ApModelFamiliesItem } from '../../ApModelFamiliesItem'
import * as UI                 from '../styledComponents'

export interface SupportedFirmwareInfoProps {
  deviceType: CompatibilityDeviceEnum
  data: ApIncompatibleFeature | IncompatibleFeature
}

export const SupportedFirmwareInfo = (props: SupportedFirmwareInfoProps) => {
  const { $t } = useIntl()
  const { deviceType } = props
  const isApCompatibilitiesByModel = useIsSplitOn(Features.WIFI_COMPATIBILITY_BY_MODEL)

  const { data: apModelFamilies } = useGetApModelFamiliesQuery({}, {
    skip: !isApCompatibilitiesByModel || deviceType !== CompatibilityDeviceEnum.AP,
    // this is a defined data, no need to refetch everytime mounted.
    refetchOnMountOrArgChange: false
  })

  if ('requirements' in props.data) {
    const data = props.data as IncompatibleFeature

    return data.requirements
      ? <>{data.requirements.map((requirement: ApRequirement, reqIndex) => (
        <React.Fragment key={`requirements_${reqIndex}`}>
          <UI.StyledFormItem
            label={$t({ defaultMessage: 'Minimum required version' })}
          >
            {requirement.firmware}
          </UI.StyledFormItem>

          { requirement.models && deviceType === CompatibilityDeviceEnum.SWITCH &&
            <UI.StyledFormItem
              label={$t({ defaultMessage: 'Supported ICX Models' })}
            >
              {requirement.models.join(', ')}
            </UI.StyledFormItem>}

          { apModelFamilies && requirement?.models && deviceType === CompatibilityDeviceEnum.AP &&
            <UI.StyledFormItem
              label={$t({ defaultMessage: 'Supported AP Models' })}
            >
              <ApModelFamiliesItem
                apModelFamilies={apModelFamilies}
                models={requirement.models}
              />
            </UI.StyledFormItem>}
        </React.Fragment>
      ))}</>
      : null
  } else {
    const data = props.data as ApIncompatibleFeature

    return <>
      <UI.StyledFormItem
        label={$t({ defaultMessage: 'Minimum required version' })}
      >
        {data.requiredFw}
      </UI.StyledFormItem>
      { data.supportedModelFamilies
        ? <UI.StyledFormItem
          label={$t({ defaultMessage: 'Supported AP Model Family' })}
        >
          {data.supportedModelFamilies?.join(', ')}
        </UI.StyledFormItem>
        : undefined}
    </>
  }
}