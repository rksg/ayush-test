import { useContext, useEffect, useState } from 'react'

import { Space, Switch } from 'antd'
import { useIntl }       from 'react-intl'
import { useParams }     from 'react-router-dom'

import { Loader, StepsFormLegacy }                                                                     from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                      from '@acx-ui/feature-toggle'
import { ApCompatibilityToolTip, ApCompatibilityDrawer, ApCompatibilityType, InCompatibilityFeatures } from '@acx-ui/rc/components'
import { useGetVenueBssColoringQuery, useUpdateVenueBssColoringMutation }                              from '@acx-ui/rc/services'

import { VenueEditContext } from '../../../index'

export function BssColoring () {
  const { $t } = useIntl()
  const { tenantId, venueId } = useParams()

  const {
    editContextData,
    setEditContextData,
    editAdvancedContextData,
    setEditAdvancedContextData
  } = useContext(VenueEditContext)

  /* eslint-disable-next-line max-len */
  const tooltipInfo = $t({ defaultMessage: 'BSS coloring reduces interference between Wi-Fi access points by assigning unique colors, minimizing collisions. Supported model family: 802.11ax, 802.11be' })
  const supportApCompatibleCheck = useIsSplitOn(Features.WIFI_COMPATIBILITY_CHECK_TOGGLE)
  const [ drawerVisible, setDrawerVisible ] = useState(false)
  const [enableBssColoring, setEnableBssColoring] = useState(false)
  const getVenueBssColoring = useGetVenueBssColoringQuery({ params: { venueId } })
  const [updateVenueBssColoring, { isLoading: isUpdatingVenueBssColoring }] =
    useUpdateVenueBssColoringMutation()

  useEffect(() => {
    const { data } = getVenueBssColoring
    if (!getVenueBssColoring?.isLoading) {
      setEnableBssColoring(data?.bssColoringEnabled ?? false)
    }
  }, [getVenueBssColoring])

  const handleChanged = (checked: boolean) => {
    const newData = { enabled: checked }
    setEnableBssColoring(newData.enabled)
    setEditContextData && setEditContextData({
      ...editContextData,
      unsavedTabKey: 'settings',
      tabTitle: $t({ defaultMessage: 'Advanced' }),
      isDirty: true
    })

    setEditAdvancedContextData && setEditAdvancedContextData({
      ...editAdvancedContextData,
      updateBssColoring: () => updateBssColoring(newData.enabled)
    })
  }

  const updateBssColoring = async (checked: boolean) => {
    try {
      await updateVenueBssColoring({
        params: { tenantId, venueId },
        payload: { bssColoringEnabled: checked }
      }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <Loader states={[{
      isLoading: getVenueBssColoring.isLoading,
      isFetching: isUpdatingVenueBssColoring
    }]}>
      <Space align='start'>
        <StepsFormLegacy.FieldLabel
          width='max-content'
          style={{ height: '32px', display: 'flex', alignItems: 'center', paddingLeft: '10px' }}
        >
          <span>{$t({ defaultMessage: 'Enable BSS Coloring' })}</span>
          <div style={{ margin: '2px' }}></div>
          <ApCompatibilityToolTip
            title={tooltipInfo}
            visible={supportApCompatibleCheck}
            placement='bottom'
            onClick={() => setDrawerVisible(true)}
          />
          <Switch
            data-testid='bss-coloring-switch'
            checked={enableBssColoring}
            onClick={(checked) => {
              handleChanged(checked)
            }}
            style={{ marginLeft: '20px' }}
          />
          {supportApCompatibleCheck &&
            <ApCompatibilityDrawer
              visible={drawerVisible}
              type={venueId?ApCompatibilityType.VENUE:ApCompatibilityType.ALONE}
              venueId={venueId}
              featureName={InCompatibilityFeatures.QOS_MIRRORING}
              onClose={() => setDrawerVisible(false)}
            />
          }
        </StepsFormLegacy.FieldLabel>
      </Space>
    </Loader>
  )
}