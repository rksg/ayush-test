import { useContext, useEffect, useState } from 'react'

import { Col, Form, Row, Switch } from 'antd'
import { defineMessage, useIntl } from 'react-intl'
import { useParams }              from 'react-router-dom'

import { AnchorContext, Loader }                     from '@acx-ui/components'
import { Features, useIsSplitOn }                    from '@acx-ui/feature-toggle'
import {
  useGetVenueDirectedMulticastQuery,
  useGetVenueTemplateDirectedMulticastQuery,
  useUpdateVenueDirectedMulticastMutation,
  useUpdateVenueTemplateDirectedMulticastMutation
} from '@acx-ui/rc/services'
import { VenueDirectedMulticast, useConfigTemplate } from '@acx-ui/rc/utils'

import {
  useVenueConfigTemplateMutationFnSwitcher,
  useVenueConfigTemplateQueryFnSwitcher
} from '../../../../venueConfigTemplateApiSwitcher'
import { VenueEditContext, VenueWifiConfigItemProps } from '../../../index'
import { FieldLabel }                                 from '../../styledComponents'

export function DirectedMulticast (props: VenueWifiConfigItemProps) {
  const { $t } = useIntl()
  const { venueId } = useParams()
  const { isTemplate } = useConfigTemplate()
  const { isAllowEdit=true } = props
  const isUseRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)
  const isConfigTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const resolvedRbacEnabled = isTemplate ? isConfigTemplateRbacEnabled : isUseRbacApi

  const {
    editContextData,
    setEditContextData,
    editNetworkingContextData,
    setEditNetworkingContextData
  } = useContext(VenueEditContext)
  const { setReadyToScroll } = useContext(AnchorContext)

  const directedMulticast = useVenueConfigTemplateQueryFnSwitcher<VenueDirectedMulticast>({
    useQueryFn: useGetVenueDirectedMulticastQuery,
    useTemplateQueryFn: useGetVenueTemplateDirectedMulticastQuery,
    enableRbac: isUseRbacApi
  })

  const [updateVenueDirectedMulticast, { isLoading: isUpdatingVenueDirectedMulticast }] =
    useVenueConfigTemplateMutationFnSwitcher(
      useUpdateVenueDirectedMulticastMutation,
      useUpdateVenueTemplateDirectedMulticastMutation
    )

  const [isUserSetting, setIsUserSetting] = useState(false)
  const [isWiredEnabled, setIsWiredEnabled] = useState(true)
  const [isWirelessEnabled, setIsWirelessEnabled] = useState(true)
  const [isNetworkEnabled, setIsNetworkEnabled] = useState(true)

  const directedMulticastSettings = [
    {
      key: 'wired',
      label: defineMessage({ defaultMessage: 'Wired Client' }),
      value: isWiredEnabled
    },
    {
      key: 'wireless',
      label: defineMessage({ defaultMessage: 'Wireless Client' }),
      value: isWirelessEnabled
    },
    {
      key: 'network',
      label: defineMessage({ defaultMessage: 'Network' }),
      value: isNetworkEnabled
    }
  ]

  useEffect(() => {
    const directedMulticastData = directedMulticast?.data
    if (directedMulticastData) {
      const { wiredEnabled, wirelessEnabled, networkEnabled } = directedMulticastData
      setIsWiredEnabled(wiredEnabled)
      setIsWirelessEnabled(wirelessEnabled)
      setIsNetworkEnabled(networkEnabled)

      setReadyToScroll?.(r => [...(new Set(r.concat('Directed-Multicast')))])
    }
  }, [directedMulticast?.data, setReadyToScroll])

  useEffect(() => {
    if (isUserSetting) {
      setEditContextData && setEditContextData({
        ...editContextData,
        unsavedTabKey: 'networking',
        tabTitle: $t({ defaultMessage: 'Networking' }),
        isDirty: true
      })

      setEditNetworkingContextData && setEditNetworkingContextData({
        ...editNetworkingContextData,
        updateDirectedMulticast: handleUpdateDirectedMulticast
      })
    }

  }, [ isWiredEnabled, isWirelessEnabled, isNetworkEnabled, isUserSetting ])

  const onToggleDirectedMulticast = (checked: boolean, type: string) => {
    setIsUserSetting(true)
    switch (type) {
      case 'wired':
        setIsWiredEnabled(checked)
        break
      case 'wireless':
        setIsWirelessEnabled(checked)
        break
      case 'network':
        setIsNetworkEnabled(checked)
    }
  }

  const handleUpdateDirectedMulticast = async () => {
    try {
      const payload = {
        wiredEnabled: isWiredEnabled,
        wirelessEnabled: isWirelessEnabled,
        networkEnabled: isNetworkEnabled
      }

      await updateVenueDirectedMulticast({
        params: { venueId },
        payload,
        enableRbac: resolvedRbacEnabled
      }).unwrap()

    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (<Loader states={[{
    isLoading: directedMulticast.isLoading,
    isFetching: isUpdatingVenueDirectedMulticast
  }]}>
    <Row gutter={0} style={{ height: '40px' }}>
      <Col span={8}>
        {$t({ defaultMessage: 'Multicast Traffic from:' })}
      </Col>
    </Row>
    {
      directedMulticastSettings.map(({ key, value, label }) => (
        <FieldLabel width='180px' key={key} >
          {$t(label)}
          <Form.Item
            valuePropName='checked'
            initialValue={value}
            style={{ marginTop: '-5px' }}
            children={
              <Switch
                data-testid={key+'-switch'}
                disabled={!isAllowEdit}
                checked={value}
                onClick={(checked) => onToggleDirectedMulticast(checked, key)}
              />
            }
          />
        </FieldLabel>
      ))
    }
  </Loader>
  )
}
