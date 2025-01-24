import { useContext, useEffect, useState } from 'react'

import { Space, Switch } from 'antd'
import { useIntl }       from 'react-intl'
import { useParams }     from 'react-router-dom'

import {
  AnchorContext,
  Loader,
  StepsFormLegacy
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  ApCompatibilityToolTip,
  ApCompatibilityDrawer,
  ApCompatibilityType,
  InCompatibilityFeatures
} from '@acx-ui/rc/components'
import {
  useGetVenueBssColoringQuery,
  useGetVenueTemplateBssColoringQuery,
  useUpdateVenueBssColoringMutation,
  useUpdateVenueTemplateBssColoringMutation
} from '@acx-ui/rc/services'
import { VenueBssColoring, useConfigTemplate } from '@acx-ui/rc/utils'

import {
  useVenueConfigTemplateMutationFnSwitcher,
  useVenueConfigTemplateQueryFnSwitcher
} from '../../../../venueConfigTemplateApiSwitcher'
import { VenueEditContext, VenueWifiConfigItemProps } from '../../../index'

export function BssColoring (props: VenueWifiConfigItemProps) {
  const { $t } = useIntl()
  const { tenantId, venueId } = useParams()
  const { isAllowEdit=true } = props

  const {
    editContextData,
    setEditContextData,
    editAdvancedContextData,
    setEditAdvancedContextData
  } = useContext(VenueEditContext)
  const { setReadyToScroll } = useContext(AnchorContext)

  /* eslint-disable-next-line max-len */
  const tooltipInfo = $t({ defaultMessage: 'BSS coloring reduces interference between Wi-Fi access points by assigning unique colors, minimizing collisions. Supported model family: 802.11ax, 802.11be' })
  const { isTemplate } = useConfigTemplate()
  const isUseRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)
  const isConfigTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const resolvedRbacEnabled = isTemplate ? isConfigTemplateRbacEnabled : isUseRbacApi

  const [ drawerVisible, setDrawerVisible ] = useState(false)
  const [enableBssColoring, setEnableBssColoring] = useState(false)
  const getVenueBssColoring = useVenueConfigTemplateQueryFnSwitcher<VenueBssColoring>({
    useQueryFn: useGetVenueBssColoringQuery,
    useTemplateQueryFn: useGetVenueTemplateBssColoringQuery,
    enableRbac: isUseRbacApi
  })
  const [updateVenueBssColoring, { isLoading: isUpdatingVenueBssColoring }] =
    useVenueConfigTemplateMutationFnSwitcher(
      useUpdateVenueBssColoringMutation,
      useUpdateVenueTemplateBssColoringMutation
    )

  useEffect(() => {
    const { data } = getVenueBssColoring
    if (!getVenueBssColoring?.isLoading) {
      setEnableBssColoring(data?.bssColoringEnabled ?? false)

      setReadyToScroll?.(r => [...(new Set(r.concat('BSS-Coloring')))])
    }
  }, [getVenueBssColoring, setReadyToScroll])

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
        payload: { bssColoringEnabled: checked },
        enableRbac: resolvedRbacEnabled
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
            showDetailButton
            placement='bottom'
            onClick={() => setDrawerVisible(true)}
          />
          <Switch
            data-testid='bss-coloring-switch'
            disabled={!isAllowEdit}
            checked={enableBssColoring}
            onClick={(checked) => {
              handleChanged(checked)
            }}
            style={{ marginLeft: '20px' }}
          />
          <ApCompatibilityDrawer
            visible={drawerVisible}
            type={venueId ? ApCompatibilityType.VENUE : ApCompatibilityType.ALONE}
            venueId={venueId}
            featureName={InCompatibilityFeatures.BSS_COLORING}
            onClose={() => setDrawerVisible(false)}
          />
        </StepsFormLegacy.FieldLabel>
      </Space>
    </Loader>
  )
}
