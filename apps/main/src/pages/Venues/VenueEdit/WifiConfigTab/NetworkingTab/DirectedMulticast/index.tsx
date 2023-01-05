import { useContext, useEffect, useState } from 'react'

import { Col, Form, Row, Switch } from 'antd'
import { useIntl }                from 'react-intl'
import { useParams }              from 'react-router-dom'

import { Loader, showToast }                 from '@acx-ui/components'
import {
  useGetVenueDirectedMulticastQuery,
  useUpdateVenueDirectedMulticastMutation
} from '@acx-ui/rc/services'


import { VenueEditContext } from '../../../index'

export function DirectedMulticast () {
  const { $t } = useIntl()
  const { tenantId, venueId } = useParams()

  const {
    editContextData,
    setEditContextData,
    editNetworkingContextData,
    setEditNetworkingContextData
  } = useContext(VenueEditContext)


  const directedMulticast = useGetVenueDirectedMulticastQuery({ params: { tenantId, venueId } })
  const [updateVenueDirectedMulticast, { isLoading: isUpdatingVenueDirectedMulticast }] =
    useUpdateVenueDirectedMulticastMutation()

  const [isUserSetting, setIsUserSetting] = useState(false)
  const [isWiredEnabled, setIsWiredEnabled] = useState(true)
  const [isWirelessEnabled, setIsWirelessEnabled] = useState(true)
  const [isNetworkEnabled, setIsNetworkEnabled] = useState(true)

  useEffect(() => {
    const directedMulticastData = directedMulticast?.data
    if (directedMulticastData) {
      const { wiredEnabled, wirelessEnabled, networkEnabled } = directedMulticastData
      setIsWiredEnabled(wiredEnabled)
      setIsWirelessEnabled(wirelessEnabled)
      setIsNetworkEnabled(networkEnabled)
    }
  }, [ directedMulticast?.data ])

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
        payload
      }).unwrap()

    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
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
    <Row gutter={0}>
      <Col span={4}>
        {$t({ defaultMessage: 'Wired Client' })}
      </Col>
      <Col span={4}>
        <Form.Item
          name='wiredEnabled'
          valuePropName='checked'
          initialValue={isWiredEnabled}
          style={{ marginTop: '-5px' }}
          children={
            <Switch
              data-testid='wired-switch'
              checked={isWiredEnabled}
              onClick={(checked) => onToggleDirectedMulticast(checked, 'wired')}
            />
          }
        />
      </Col>
    </Row>
    <Row gutter={0}>
      <Col span={4}>
        {$t({ defaultMessage: 'Wireless Client' })}
      </Col>
      <Col span={4}>
        <Form.Item
          name='wirelessEnabled'
          valuePropName='checked'
          initialValue={isWirelessEnabled}
          style={{ marginTop: '-5px' }}
          children={
            <Switch
              data-testid='wireless-switch'
              checked={isWirelessEnabled}
              onClick={(checked) => onToggleDirectedMulticast(checked, 'wireless')}
            />
          }
        />
      </Col>
    </Row>
    <Row gutter={0}>
      <Col span={4}>
        {$t({ defaultMessage: 'Network' })}
      </Col>
      <Col span={4}>
        <Form.Item
          name='networkEnabled'
          valuePropName='checked'
          initialValue={isNetworkEnabled}
          style={{ marginTop: '-5px' }}
          children={
            <Switch
              data-testid='network-switch'
              checked={isNetworkEnabled}
              onClick={(checked) => onToggleDirectedMulticast(checked, 'network')}
            />
          }
        />
      </Col>
    </Row>
  </Loader>
  )
}
