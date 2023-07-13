import React, { useContext, useEffect, useState } from 'react'

import { Form }    from 'antd'
import { get }     from 'lodash'
import { useIntl } from 'react-intl'

import { Button }          from '@acx-ui/components'
import { NetworkSaveData } from '@acx-ui/rc/utils'



import NetworkFormContext from '../NetworkFormContext'

import MoreSettingsForm from './MoreSettingsForm'

export function NetworkMoreSettingsForm (props: {
  wlanData: NetworkSaveData | null;
}) {
  const { editMode, cloneMode, data } = useContext(NetworkFormContext)
  const form = Form.useFormInstance()
  const wlanData = editMode ? props.wlanData : form.getFieldsValue()

  const { $t } = useIntl()
  useEffect(() => {
    if ((editMode || cloneMode) && data) {
      form.setFieldsValue({
        wlan: {
          ...data.wlan,
          advancedCustomization: {
            ...data?.wlan?.advancedCustomization,
            vlanPool: get(data, 'wlan.advancedCustomization.vlanPool')
          }
        },
        enableUploadLimit:
          data.wlan?.advancedCustomization?.userUplinkRateLimiting &&
          data.wlan?.advancedCustomization?.userUplinkRateLimiting > 0,
        enableDownloadLimit:
          data.wlan?.advancedCustomization?.userDownlinkRateLimiting &&
          data.wlan?.advancedCustomization?.userDownlinkRateLimiting > 0,
        enableOfdmOnly:
          get(
            data,
            'wlan.advancedCustomization.radioCustomization.phyTypeConstraint'
          ) === 'OFDM',
        enableVlanPooling: get(data, 'wlan.advancedCustomization.vlanPool'),
        managementFrameMinimumPhyRate: get(
          data,
          'wlan.advancedCustomization.radioCustomization.managementFrameMinimumPhyRate'
        ),
        bssMinimumPhyRate: get(
          data,
          'wlan.advancedCustomization.radioCustomization.bssMinimumPhyRate'
        )
      })
    }
  }, [data, editMode, cloneMode])

  /* Please be advised that why we use clone mode as state here
   * usually edit mode will show more setting in step form separately
   * and clone mode just like usual adding network.
   * But when MoreSettingForm is not rendered (user didn't click
   * the show more button), the copied value in more setting will be
   * ignored.
   * In cause this scenario happen, MoreSettingsForm will auto expand
   * under clone mode, user can collapse manually, it will force React
   * to render MoreSettingsForm.
   * There should be no side effect when adding/editing a network.
   */
  const [enableMoreSettings, setEnabled] = useState(cloneMode)

  if (data && editMode) {
    return <MoreSettingsForm wlanData={wlanData} />
  }
  else {
    return (
      <>
        <Button
          type='link'
          onClick={() => {
            setEnabled(!enableMoreSettings)
          }}
        >
          {enableMoreSettings ?
            $t({ defaultMessage: 'Show less settings' }) :
            $t({ defaultMessage: 'Show more settings' })}
        </Button>
        { enableMoreSettings && <MoreSettingsForm wlanData={wlanData} /> }
      </>
    )
  }
}
