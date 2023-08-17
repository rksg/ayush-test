import { createContext, useContext, useEffect, useRef, useState } from 'react'

import { Col, Form, Row, Switch } from 'antd'
import _                          from 'lodash'
import { useIntl }                from 'react-intl'
import { useParams }              from 'react-router-dom'

import { Loader, showActionModal, StepsFormLegacy } from '@acx-ui/components'
import {
  useGetVenueMdnsFencingQuery,
  useUpdateVenueMdnsFencingMutation
} from '@acx-ui/rc/services'
import { MdnsFencingService, VenueMdnsFencingPolicy } from '@acx-ui/rc/utils'

import { VenueEditContext } from '../../..'

import { MdnsFencingServiceTable } from './MdnsFencingServiceTable'
import { updateRowIds }            from './utils'

export interface MdnsFencingContextType {
  mdnsFencingServices: MdnsFencingService[],
  setMdnsFencingServices: (mdnsFencingServices: MdnsFencingService[]) => void,
  setEnableMdnsFencing: (enable: boolean) => void
}

export const MdnsFencingContext = createContext({} as MdnsFencingContextType)



export function MdnsFencing () {
  const { $t } = useIntl()
  const { venueId } = useParams()

  const {
    editContextData,
    setEditContextData,
    editServerContextData,
    setEditServerContextData
  } = useContext(VenueEditContext)

  const getVenueMdnsFencing = useGetVenueMdnsFencingQuery({ params: { venueId } })
  const [updateVenueMdnsFencing,
    { isLoading: isUpdatingVenueMdnsFencing }] = useUpdateVenueMdnsFencingMutation()

  const [enableMdnsFencing, setEnableMdnsFencing] = useState(false)
  const [mdnsFencingServices, setMdnsFencingServices]= useState([] as MdnsFencingService[])
  const isUserSetting = useRef(false)
  const [initData, setInitData] = useState<VenueMdnsFencingPolicy>()

  const onInit = (data?: VenueMdnsFencingPolicy, needToSetInitData=false) => {
    const { enabled=false, services = [] } = data || {}
    setEnableMdnsFencing(enabled)
    const newData = updateRowIds(services).sort((a, b) => {
      const serviceA = a.service
      const serviceB = b.service

      if (serviceA > serviceB) return -1
      if (serviceA < serviceB) return 1

      return 0
    })
    setMdnsFencingServices(newData)

    if (needToSetInitData) {
      setInitData({
        enabled: enabled,
        services: [ ...newData ]
      })
    }

  }

  useEffect(() => {
    const { data: venueMdnsFencing, isLoading } = getVenueMdnsFencing || {}
    if (isLoading === false && venueMdnsFencing) {
      onInit(venueMdnsFencing, true)
    }
  }, [getVenueMdnsFencing])

  useEffect(() => {
    if (isUserSetting.current) {
      onMdnsFencingDataChanged()
    }
  }, [enableMdnsFencing, mdnsFencingServices])

  const handleEnableChanged = (checked: boolean) => {
    isUserSetting.current = true
    setEnableMdnsFencing(checked)
  }

  const handleServicesChanged = (data: MdnsFencingService[]) => {
    isUserSetting.current = true
    setMdnsFencingServices(data)
  }

  const updateMdnsFencingSettings = async () => {

    try {

      if (enableMdnsFencing === true && mdnsFencingServices.length === 0) {
        showActionModal({
          type: 'error',
          content:
              $t({ defaultMessage:
                // eslint-disable-next-line max-len
                'You must have at least one mDNS Fencing Service when the Use mDNS Fencing Service button is Enabled' })
        })

        await discardMdnsFencingSettings()
        return
      }

      setEditContextData && setEditContextData({
        ...editContextData,
        unsavedTabKey: 'servers',
        tabTitle: $t({ defaultMessage: 'Network Control' }),
        isDirty: false,
        hasError: false
      })

      isUserSetting.current = false

      const newServices = mdnsFencingServices.map((service) => {
        if (!service.wiredRules) service.wiredRules = []
        if (!service.customStrings) service.customStrings = []
        return _.omit(service, ['rowId'])
      })

      const payload = {
        enabled: enableMdnsFencing,
        services: newServices
      }

      await updateVenueMdnsFencing({
        params: { venueId },
        payload
      }).unwrap()

    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const discardMdnsFencingSettings = async () => {
    setEditContextData && setEditContextData({
      ...editContextData,
      unsavedTabKey: 'servers',
      tabTitle: $t({ defaultMessage: 'Network Control' }),
      isDirty: false,
      hasError: false
    })

    onInit(initData)
    isUserSetting.current = false
  }

  const onMdnsFencingDataChanged = () => {

    setEditContextData && setEditContextData({
      ...editContextData,
      unsavedTabKey: 'servers',
      tabTitle: $t({ defaultMessage: 'Network Control' }),
      isDirty: true
    })

    setEditServerContextData && setEditServerContextData({
      ...editServerContextData,
      updateMdnsFencing: () => updateMdnsFencingSettings(),
      discardMdnsFencing: () => discardMdnsFencingSettings()
    })

  }

  return (
    <Loader states={[{
      isLoading: getVenueMdnsFencing.isLoading,
      isFetching: isUpdatingVenueMdnsFencing
    }]}>
      <MdnsFencingContext.Provider
        value={{
          mdnsFencingServices: mdnsFencingServices,
          setMdnsFencingServices: handleServicesChanged,
          setEnableMdnsFencing: setEnableMdnsFencing }}>
        <Row>
          <Col span={5}>
            <StepsFormLegacy.FieldLabel width='200px'>
              { $t({ defaultMessage: 'Use mDNS Fencing Service' }) }
              <Form.Item
                valuePropName='checked'
                children={
                  <Switch
                    checked={enableMdnsFencing}
                    onClick={(checked) => {
                      handleEnableChanged(checked)
                    }}
                  />
                }
              />
            </StepsFormLegacy.FieldLabel>
          </Col>
        </Row>
        {enableMdnsFencing &&
          <Row>
            <Col flex='650px' >
              <Form.Item required
                label={$t({ defaultMessage: 'Manage Fencing services' })}
                children={
                  <MdnsFencingServiceTable />
                }
              />
            </Col>
          </Row>
        }
      </MdnsFencingContext.Provider>
    </Loader>
  )
}
