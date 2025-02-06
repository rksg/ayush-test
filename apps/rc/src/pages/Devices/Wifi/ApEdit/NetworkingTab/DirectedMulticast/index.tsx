import { useContext, useEffect, useRef, useState } from 'react'

import { Col, Form, Row, Switch } from 'antd'
import { isEmpty }                from 'lodash'
import { defineMessage, useIntl } from 'react-intl'
import { useParams }              from 'react-router-dom'

import { AnchorContext, Loader, StepsFormLegacy, StepsFormLegacyInstance } from '@acx-ui/components'
import { Features, useIsSplitOn }                                          from '@acx-ui/feature-toggle'
import {
  useGetApDirectedMulticastQuery,
  useLazyGetVenueDirectedMulticastQuery,
  useResetApDirectedMulticastMutation,
  useUpdateApDirectedMulticastMutation
} from '@acx-ui/rc/services'
import {
  ApDirectedMulticast,
  VenueDirectedMulticast
} from '@acx-ui/rc/utils'

import { ApDataContext, ApEditContext, ApEditItemProps } from '../..'
import { FieldLabel }                                    from '../../styledComponents'
import { VenueSettingsHeader }                           from '../../VenueSettingsHeader'


export function DirectedMulticast (props: ApEditItemProps) {
  const { $t } = useIntl()
  const { tenantId, serialNumber } = useParams()
  const { isAllowEdit=true } = props

  const isUseRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)

  const {
    editContextData,
    setEditContextData,
    editNetworkingContextData,
    setEditNetworkingContextData
  } = useContext(ApEditContext)

  const { venueData } = useContext(ApDataContext)
  const { setReadyToScroll } = useContext(AnchorContext)
  const venueId = venueData?.id

  const directedMulticast = useGetApDirectedMulticastQuery({
    params: { venueId, serialNumber },
    enableRbac: isUseRbacApi
  }, { skip: !venueId })

  const [updateApDirectedMulticast, { isLoading: isUpdatingApDirectedMulticast }] =
    useUpdateApDirectedMulticastMutation()
  const [resetApDirectedMulticast, { isLoading: isResetApDirectedMulticast }] =
    useResetApDirectedMulticastMutation()

  const [getVenueDirectedMulticast] = useLazyGetVenueDirectedMulticastQuery()

  const formRef = useRef<StepsFormLegacyInstance<ApDirectedMulticast>>()
  const isUseVenueSettingsRef = useRef<boolean>(false)

  const [initData, setInitData] = useState({} as ApDirectedMulticast)
  const [apDirectedMulticast, setApDirectedMulticast] = useState({} as ApDirectedMulticast)
  const [venueDirectedMulticast, setVenueDirectedMulticast] = useState({} as VenueDirectedMulticast)
  const [isUseVenueSettings, setIsUseVenueSettings] = useState(true)

  const [formInitializing, setFormInitializing] = useState(true)

  const directedMulticastSettings = [
    {
      key: 'wired',
      label: defineMessage({ defaultMessage: 'Wired Client' }),
      fieldName: 'wiredEnabled'
    },
    {
      key: 'wireless',
      label: defineMessage({ defaultMessage: 'Wireless Client' }),
      fieldName: 'wirelessEnabled'
    },
    {
      key: 'network',
      label: defineMessage({ defaultMessage: 'Network' }),
      fieldName: 'networkEnabled'
    }
  ]


  useEffect(() => {
    const directedMulticastData = directedMulticast?.data

    if (venueId && directedMulticastData) {
      const setData = async () => {
        const venueDirectedMulticastData = (await getVenueDirectedMulticast({
          params: { tenantId, venueId },
          enableRbac: isUseRbacApi
        }, true).unwrap())

        setVenueDirectedMulticast(venueDirectedMulticastData)
        setIsUseVenueSettings(directedMulticastData.useVenueSettings)
        isUseVenueSettingsRef.current = directedMulticastData.useVenueSettings

        if (formInitializing) {
          setInitData(directedMulticastData)
          setFormInitializing(false)

          setReadyToScroll?.(r => [...(new Set(r.concat('Directed-Multicast')))])
        } else {
          formRef?.current?.setFieldsValue(directedMulticastData)
        }
      }

      setData()
    }
  }, [ venueId, directedMulticast?.data ])

  const handleVenueSetting = () => {
    let isUseVenue = !isUseVenueSettings
    setIsUseVenueSettings(isUseVenue)
    isUseVenueSettingsRef.current = isUseVenue

    if (isUseVenue) {
      if (formRef?.current) {
        const currentData = formRef.current.getFieldsValue()
        setApDirectedMulticast({ ...currentData } )
      }

      if (venueDirectedMulticast) {
        const data = {
          ...venueDirectedMulticast,
          useVenueSettings: true
        }
        formRef?.current?.setFieldsValue(data)
      }
    } else {
      if (!isEmpty(apDirectedMulticast)) {
        formRef?.current?.setFieldsValue(apDirectedMulticast)
      }
    }

    updateEditContext(formRef?.current as StepsFormLegacyInstance, true)
  }


  const handleUpdateDirectedMulticast = async (values: ApDirectedMulticast) => {
    try {
      setEditContextData && setEditContextData({
        ...editContextData,
        isDirty: false,
        hasError: false
      })

      const isUseVenue = isUseVenueSettingsRef.current
      const payload = {
        ...values,
        useVenueSettings: isUseVenue
      }

      if (isUseVenue && !isUseRbacApi) {
        await resetApDirectedMulticast({
          params: { serialNumber }
        }).unwrap()
      } else {
        await updateApDirectedMulticast({
          params: { venueId, serialNumber },
          payload,
          enableRbac: isUseRbacApi
        }).unwrap()
      }

    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const updateEditContext = (form: StepsFormLegacyInstance, isDirty: boolean) => {
    setEditContextData && setEditContextData({
      ...editContextData,
      unsavedTabKey: 'networking',
      tabTitle: $t({ defaultMessage: 'Networking' }),
      isDirty: isDirty
    })

    setEditNetworkingContextData && setEditNetworkingContextData({
      ...editNetworkingContextData,
      updateDirectedMulticast: () => handleUpdateDirectedMulticast(form?.getFieldsValue()),
      discardDirectedMulticastChanges: () => handleDiscard()
    })
  }

  const handleDiscard = () => {
    setIsUseVenueSettings(initData.useVenueSettings)
    isUseVenueSettingsRef.current = initData.useVenueSettings
    formRef?.current?.setFieldsValue(initData)
  }

  const handleChange = () => {
    updateEditContext(formRef?.current as StepsFormLegacyInstance, true)
  }

  return (<Loader states={[{
    isLoading: formInitializing,
    isFetching: isUpdatingApDirectedMulticast || isResetApDirectedMulticast
  }]}>
    <StepsFormLegacy
      formRef={formRef}
      onFormChange={handleChange}
    >
      <StepsFormLegacy.StepForm initialValues={initData}>
        <VenueSettingsHeader venue={venueData}
          disabled={!isAllowEdit}
          isUseVenueSettings={isUseVenueSettings}
          handleVenueSetting={handleVenueSetting} />
        <Row gutter={0} style={{ height: '40px' }}>
          <Col span={8}>
            {$t({ defaultMessage: 'Multicast Traffic from:' })}
          </Col>
        </Row>
        { directedMulticastSettings.map(({ key, fieldName, label }) => (
          <FieldLabel width='180px' key={key} >
            {$t(label)}
            <Form.Item
              name={fieldName}
              valuePropName='checked'
              style={{ marginTop: '-5px' }}
              children={
                isUseVenueSettings ?
                  <span data-testid={key+'-span'}>{formRef?.current?.getFieldValue(fieldName)?
                    $t({ defaultMessage: 'On' }): $t({ defaultMessage: 'Off' })}</span> :
                  <Switch
                    data-testid={key+'-switch'}
                    disabled={!isAllowEdit || isUseVenueSettings}
                  />
              }
            />
          </FieldLabel>
        ))}
      </StepsFormLegacy.StepForm>
    </StepsFormLegacy>
  </Loader>
  )
}
