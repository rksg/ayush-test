import { createContext, useContext, useEffect, useRef, useState } from 'react'

import { Col, Form, Row, Switch } from 'antd'
import { omit }                   from 'lodash'
import { useIntl }                from 'react-intl'
import { useParams }              from 'react-router-dom'

import {
  AnchorContext,
  Loader,
  showActionModal,
  StepsFormLegacy
} from '@acx-ui/components'
import { Features, useIsSplitOn }              from '@acx-ui/feature-toggle'
import {
  useGetVenueMdnsFencingQuery,
  useGetVenueTemplateMdnsFencingQuery,
  useUpdateVenueMdnsFencingMutation,
  useUpdateVenueTemplateMdnsFencingMutation
} from '@acx-ui/rc/services'
import {
  MdnsFencingService,
  useConfigTemplate,
  VenueMdnsFencingPolicy
} from '@acx-ui/rc/utils'

import { VenueEditContext, VenueWifiConfigItemProps } from '../../..'
import {
  useVenueConfigTemplateMutationFnSwitcher,
  useVenueConfigTemplateQueryFnSwitcher
} from '../../../../venueConfigTemplateApiSwitcher'

import { MdnsFencingServiceTable } from './MdnsFencingServiceTable'
import { updateRowIds }            from './utils'

export interface MdnsFencingContextType {
  mdnsFencingServices: MdnsFencingService[],
  setMdnsFencingServices: (mdnsFencingServices: MdnsFencingService[]) => void,
  setEnableMdnsFencing: (enable: boolean) => void
}

export const MdnsFencingContext = createContext({} as MdnsFencingContextType)


export function MdnsFencing (props: VenueWifiConfigItemProps) {
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
    editServerContextData,
    setEditServerContextData
  } = useContext(VenueEditContext)
  const { setReadyToScroll } = useContext(AnchorContext)

  const getVenueMdnsFencing = useVenueConfigTemplateQueryFnSwitcher<VenueMdnsFencingPolicy>({
    useQueryFn: useGetVenueMdnsFencingQuery,
    useTemplateQueryFn: useGetVenueTemplateMdnsFencingQuery,
    enableRbac: isUseRbacApi
  })

  const [updateVenueMdnsFencing, { isLoading: isUpdatingVenueMdnsFencing }] =
    useVenueConfigTemplateMutationFnSwitcher(
      useUpdateVenueMdnsFencingMutation,
      useUpdateVenueTemplateMdnsFencingMutation
    )

  const [enableMdnsFencing, setEnableMdnsFencing] = useState(false)
  const [mdnsFencingServices, setMdnsFencingServices]= useState([] as MdnsFencingService[])
  const isUserSetting = useRef(false)
  const [initData, setInitData] = useState<VenueMdnsFencingPolicy>()

  const onInit = (data?: VenueMdnsFencingPolicy, needToSetInitData=false) => {
    const { enabled=false } = data || {}

    const services = ((resolvedRbacEnabled)? data?.rules : data?.services) ?? []
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

      setReadyToScroll?.(r => [...(new Set(r.concat('mDNS-Fencing')))])
    }
  }, [getVenueMdnsFencing, setReadyToScroll])

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
        return omit(service, ['rowId'])
      })

      const payload = (resolvedRbacEnabled)? {
        enabled: enableMdnsFencing,
        rules: newServices
      } : {
        enabled: enableMdnsFencing,
        services: newServices
      }

      await updateVenueMdnsFencing({
        params: { venueId },
        payload,
        enableRbac: resolvedRbacEnabled
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
                    disabled={!isAllowEdit}
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
                  <MdnsFencingServiceTable isAllowEdit={isAllowEdit}/>
                }
              />
            </Col>
          </Row>
        }
      </MdnsFencingContext.Provider>
    </Loader>
  )
}
