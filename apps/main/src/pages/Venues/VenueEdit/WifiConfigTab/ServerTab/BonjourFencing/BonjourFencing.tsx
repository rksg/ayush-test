import { createContext, useContext, useEffect, useRef, useState } from 'react'

import { Col, Form, Row, Switch } from 'antd'
import _                          from 'lodash'
import { useIntl }                from 'react-intl'
import { useParams }              from 'react-router-dom'

import { Loader, showActionModal, StepsForm } from '@acx-ui/components'
import {
  useGetVenueBonjourFencingQuery,
  useUpdateVenueBonjourFencingMutation
} from '@acx-ui/rc/services'
import { BonjourFencingService, VenueBonjourFencingPolicy } from '@acx-ui/rc/utils'

import { VenueEditContext } from '../../..'

import { BonjourFencingServiceTable } from './BonjourFencingServiceTable'
import { updateRowIds }               from './utils'

export interface BonjourFencingContextType {
  bonjourFencingServices: BonjourFencingService[],
  setBonjourFencingServices: (bonjourFencingServices: BonjourFencingService[]) => void,
  setEnableBonjourFencing: (enable: boolean) => void
}

export const BonjourFencingContext = createContext({} as BonjourFencingContextType)



export function BonjourFencing () {
  const { $t } = useIntl()
  const { venueId } = useParams()

  const {
    editContextData,
    setEditContextData,
    editServerContextData,
    setEditServerContextData
  } = useContext(VenueEditContext)

  const getVenueBonjourFencing = useGetVenueBonjourFencingQuery({ params: { venueId } })
  const [updateVenueBonjourFencing,
    { isLoading: isUpdatingVenueBonjourFencing }] = useUpdateVenueBonjourFencingMutation()

  const [enableBonjourFencing, setEnableBonjourFencing] = useState(false)
  const [bonjourFencingServices, setBonjourFencingServices]= useState([] as BonjourFencingService[])
  const isUserSetting = useRef(false)
  const [ initData, setInitData ] = useState<VenueBonjourFencingPolicy>()

  const onInit = (data?: VenueBonjourFencingPolicy, needToSetInitData=false) => {
    const { enabled=false, services = [] } = data || {}
    setEnableBonjourFencing(enabled)
    const newData = updateRowIds(services)
    setBonjourFencingServices(newData)

    if (needToSetInitData) {
      setInitData({
        enabled: enabled,
        services: [ ...newData ]
      })
    }

  }


  useEffect(() => {
    const { data: venueBonjourFencing, isLoading } = getVenueBonjourFencing || {}
    if (isLoading === false && venueBonjourFencing) {
      onInit(venueBonjourFencing, true)
    }
  }, [getVenueBonjourFencing])

  useEffect(() => {
    if (isUserSetting.current) {
      onBonjourFencingDataChanged()
    }
  }, [enableBonjourFencing, bonjourFencingServices])

  const handleEnableChanged = (checked: boolean) => {
    isUserSetting.current = true
    setEnableBonjourFencing(checked)
  }

  const handleServicesChanged = (data: BonjourFencingService[]) => {
    isUserSetting.current = true
    setBonjourFencingServices(data)
  }

  const updateBonjourFencingSettings = async () => {

    try {

      if (enableBonjourFencing === true && bonjourFencingServices.length === 0) {
        showActionModal({
          type: 'error',
          content:
              $t({ defaultMessage:
                // eslint-disable-next-line max-len
                'You must have at least one mDNS Fencing Service when the Use mDNS Fencing Service button is Enabled' })
        })

        await discardBonjourFencingSettings()
        return
      }

      setEditContextData && setEditContextData({
        ...editContextData,
        unsavedTabKey: 'servers',
        tabTitle: $t({ defaultMessage: 'Servers' }),
        isDirty: false,
        hasError: false
      })

      isUserSetting.current = false

      const newServices = bonjourFencingServices.map((service) => {
        if (!service.wiredRules) service.wiredRules = []
        if (!service.customStrings) service.customStrings = []
        return _.omit(service, ['rowId'])
      })

      const payload = {
        enabled: enableBonjourFencing,
        services: newServices
      }

      await updateVenueBonjourFencing({
        params: { venueId },
        payload
      }).unwrap()

    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const discardBonjourFencingSettings = async () => {
    setEditContextData && setEditContextData({
      ...editContextData,
      unsavedTabKey: 'servers',
      tabTitle: $t({ defaultMessage: 'Servers' }),
      isDirty: false,
      hasError: false
    })

    onInit(initData)
    isUserSetting.current = false
  }

  const onBonjourFencingDataChanged = () => {

    setEditContextData && setEditContextData({
      ...editContextData,
      unsavedTabKey: 'servers',
      tabTitle: $t({ defaultMessage: 'Servers' }),
      isDirty: true
    })

    setEditServerContextData && setEditServerContextData({
      ...editServerContextData,
      updateBonjourFencing: () => updateBonjourFencingSettings(),
      discardBonjourFencing: () => discardBonjourFencingSettings()
    })

  }

  return (
    <Loader states={[{
      isLoading: getVenueBonjourFencing.isLoading,
      isFetching: isUpdatingVenueBonjourFencing
    }]}>
      <BonjourFencingContext.Provider
        value={{
          bonjourFencingServices,
          setBonjourFencingServices: handleServicesChanged,
          setEnableBonjourFencing }}>
        <Row>
          <Col span={5}>
            <StepsForm.FieldLabel width='200px'>
              { $t({ defaultMessage: 'Use mDNS Fencing Service' }) }
              <Form.Item
                valuePropName='checked'
                children={
                  <Switch
                    checked={enableBonjourFencing}
                    onClick={(checked) => {
                      handleEnableChanged(checked)
                    }}
                  />
                }
              />
            </StepsForm.FieldLabel>
          </Col>
        </Row>
        {enableBonjourFencing &&
          <Row>
            <Col flex='650px' >
              <Form.Item required
                label={$t({ defaultMessage: 'Manage Fencing services' })}
                children={
                  <BonjourFencingServiceTable />
                }
              />
            </Col>
          </Row>
        }
      </BonjourFencingContext.Provider>
    </Loader>
  )
}
