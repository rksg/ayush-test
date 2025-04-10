import React, { useState, useRef, useEffect, useContext } from 'react'

import { Row, Col, Form, Input, Select } from 'antd'
import _                                 from 'lodash'
import { useIntl }                       from 'react-intl'

import {
  GoogleMap,
  GoogleMapMarker, Loader,
  PageHeader,
  StepsFormLegacy,
  StepsFormLegacyInstance
} from '@acx-ui/components'
import { Features, useIsSplitOn }                              from '@acx-ui/feature-toggle'
import { SearchOutlined }                                      from '@acx-ui/icons'
import {
  GoogleMapWithPreference, ProtectedEnforceTemplateToggleVenue,
  usePlacesAutocomplete, wifiCountryCodes, useEnforcedStatus
} from '@acx-ui/rc/components'
import {
  useAddVenueMutation,
  useLazyVenuesListQuery,
  useUpdateVenueMutation,
  useAddVenueTemplateMutation,
  useUpdateVenueTemplateMutation,
  useLazyGetVenuesTemplateListQuery,
  useLazyGetTimezoneQuery,
  useGetVenueTagListQuery
} from '@acx-ui/rc/services'
import {
  Address,
  LocationExtended,
  VenueExtended,
  checkObjectNotExists,
  redirectPreviousPage,
  useConfigTemplateBreadcrumb,
  useConfigTemplate,
  whitespaceOnlyRegExp,
  useConfigTemplateLazyQueryFnSwitcher,
  Venue,
  TableResult,
  useConfigTemplateMutationFnSwitcher,
  useConfigTemplatePageHeaderTitle,
  CommonResult,
  ConfigTemplateType,
  validateTags
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams,
  useLocation
} from '@acx-ui/react-router-dom'
import { RequestPayload }     from '@acx-ui/types'
import { validationMessages } from '@acx-ui/utils'

import { MessageMapping }      from '../MessageMapping'
import { useGetVenueInstance } from '../venueConfigTemplateApiSwitcher'
import { VenueEditContext }    from '../VenueEdit'

interface AddressComponent {
  long_name?: string;
  short_name?: string;
  types?: Array<string>;
}

export const retrieveCityState = (addressComponents: Array<AddressComponent>, country: string) => {

  // array reverse applied since search should be done from general to specific, google provides from vice-versa
  const reversedAddrComponents = addressComponents.reverse()

  /** Step 1. Looking for locality / sublocality_level_X / postal_town */
  let cityComponent = reversedAddrComponents.find(el => {
    return el.types?.includes('locality')
      || el.types?.some((t: string) => /sublocality_level_[1-5]/.test(t))
      || el.types?.includes('postal_town')
  })

  /** Step 2. If nothing found, proceed with administrative_area_level_2-5 / neighborhood
   * administrative_area_level_1 excluded from search since considered as `political state`
   */
  if (!cityComponent) {
    cityComponent = reversedAddrComponents.find(el => {
      return el.types?.includes('neighborhood')
        || el.types?.some((t: string) => /administrative_area_level_[2-5]/.test(t))
    })
  }

  const stateComponent = addressComponents
    .find(el => el.types?.includes('administrative_area_level_1'))


  // Address in some country doesn't have city and state component, we will use the country as the default value of the city.
  if (!cityComponent && !stateComponent) {
    cityComponent = { long_name: country }
  }

  return {
    city: cityComponent? cityComponent.long_name: '',
    state: stateComponent ? stateComponent.long_name : null
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const addressParser = async (place: google.maps.places.PlaceResult, getTimezone: any) => {
  const address: Address = {}
  const lat = place.geometry?.location?.lat()
  const lng = place.geometry?.location?.lng()
  address.latitude = lat
  address.longitude = lng

  const { data: timezone } = await getTimezone({
    params: { lat: lat?.toString(), lng: lng?.toString() }
  })
  address.timezone = timezone.timeZoneId
  address.addressLine = place.formatted_address

  const latlng = new google.maps.LatLng({
    lat: Number(lat),
    lng: Number(lng)
  })

  const countryObj = place?.address_components?.find(
    el => el.types.includes('country')
  )
  const country = countryObj?.long_name ?? ''
  address.country = country

  if (place && place.address_components) {
    const cityObj = retrieveCityState(
      place.address_components,
      country
    )
    if (cityObj) {
      address.city = cityObj.state
        ? `${cityObj.city}, ${cityObj.state}` : cityObj.city
    }
  }
  return { latlng, address }
}

const defaultAddress: Address = {
  addressLine: '350 W Java Dr, Sunnyvale, CA 94089, USA',
  city: 'Sunnyvale, California',
  country: 'United States',
  latitude: 37.4112751,
  longitude: -122.0191908,
  timezone: 'America/Los_Angeles'
}

interface VenuesFormProps {
  modalMode?: boolean
  modalCallBack?: (venue?: VenueExtended) => void
  specifiedAction?: 'override'
  dataFromParent?: VenueExtended | undefined
}

export function VenuesForm (props: VenuesFormProps) {
  const { modalMode = false, modalCallBack, specifiedAction, dataFromParent } = props
  const intl = useIntl()
  const isMapEnabled = useIsSplitOn(Features.G_MAP)
  const isTagsEnabled = useIsSplitOn(Features.VENUE_TAG_TOGGLE)

  const navigate = useNavigate()
  const formRef = useRef<StepsFormLegacyInstance<VenueExtended>>()
  const params = useParams()
  const [getTimezone] = useLazyGetTimezoneQuery()

  const linkToVenues = useTenantLink('/venues')
  const [ addVenue ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useAddVenueMutation,
    useTemplateMutationFn: useAddVenueTemplateMutation
  })
  // eslint-disable-next-line max-len
  const [ updateVenue, { isLoading: updateVenueIsLoading } ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useUpdateVenueMutation,
    useTemplateMutationFn: useUpdateVenueTemplateMutation
  })
  const [zoom, setZoom] = useState(1)
  const [center, setCenter] = useState<google.maps.LatLngLiteral>({
    lat: 0,
    lng: 0
  })
  const [marker, setMarker] = React.useState<google.maps.LatLng>()
  const [address, updateAddress] = useState<Address>(isMapEnabled? {} : defaultAddress)
  const [countryCode, setCountryCode] = useState('')
  const [validating, setValidating] = useState(false)

  const action = specifiedAction ?? params.action ?? 'add'
  const { data = dataFromParent } = useGetVenueInstance()
  const previousPath = usePreviousPath()

  // Config Template related states
  const breadcrumb = useConfigTemplateBreadcrumb([
    { text: intl.$t({ defaultMessage: '<VenuePlural></VenuePlural>' }), link: '/venues' }
  ])
  const pageTitle = useConfigTemplatePageHeaderTitle({
    isEdit: action === 'edit',
    instanceLabel: intl.$t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
    addLabel: intl.$t({ defaultMessage: 'Add New' })
  })
  const { saveEnforcementConfig } = useConfigTemplate()
  const { getEnforcedStepsFormProps } = useEnforcedStatus(ConfigTemplateType.VENUE)
  const venueTagList = useGetVenueTagListQuery({ params })
  const venueTagOptions =
    venueTagList.data?.map((item) =>({
      label: item,
      value: item
    }))

  useEffect(() => {
    if (data) {
      const defaultCountryCode = data.address?.countryCode
      ?? wifiCountryCodes.find(code => code.label === data.address.country)?.value
      ?? ''
      setCountryCode(defaultCountryCode)

      formRef.current?.setFieldsValue({
        name: data?.name,
        description: data?.description,
        address: { ...data?.address, countryCode: defaultCountryCode },
        tags: data?.tags
      })
      updateAddress(data?.address as Address)


      if (isMapEnabled && window.google) {
        const latlng = new google.maps.LatLng({
          lat: Number(data?.address?.latitude),
          lng: Number(data?.address?.longitude)
        })
        setMarker(latlng)
        setCenter(latlng.toJSON())
        setZoom(16)
      }
    }

    if (action === 'add') {
      const initialAddress = isMapEnabled ? '' : defaultAddress.addressLine
      formRef.current?.setFieldValue(['address', 'addressLine'], initialAddress)
    }
  }, [data, isMapEnabled, window.google])

  useEffect(() => {
    if (action === 'edit' && address.country && data ) {
      const isSameCountry =
        (!data.address.country || (data.address.country === address.country)) || false
      let errors = []
      if (!isSameCountry) {
        errors.push(intl.$t(
          { defaultMessage: 'Address must be in {country}' },
          { country: data.address.country }
        ))
      }
      formRef.current?.setFields([{
        name: ['address', 'addressLine'],
        errors
      }])
    }
  }, [data, address, action])

  const venuesListPayload = {
    searchString: '',
    fields: ['name', 'id'],
    searchTargetFields: ['name'],
    filters: {},
    pageSize: 10000
  }
  const [ venuesList ] = useConfigTemplateLazyQueryFnSwitcher<TableResult<Venue>>({
    useLazyQueryFn: useLazyVenuesListQuery,
    useLazyTemplateQueryFn: useLazyGetVenuesTemplateListQuery
  })

  const nameValidator = async (value: string) => {
    if ([...value].length !== JSON.stringify(value).normalize().slice(1, -1).length) {
      return Promise.reject(intl.$t(validationMessages.name))
    }
    const payload = { ...venuesListPayload, searchString: value }
    const list = (await venuesList({ params, payload }, true)
      .unwrap()).data.filter(n => n.id !== data?.id).map(n => ({ name: n.name }))
    return checkObjectNotExists(list, { name: value },
      intl.$t({ defaultMessage: '<VenueSingular></VenueSingular>' }))
  }

  const addressValidator = async (value: string) => {
    const isEdit = action === 'edit'
    const isSameValue = value === formRef.current?.getFieldValue('address')?.addressLine
    const isSameCountry =
      (!data?.address.country || (data?.address.country === address?.country)) || false

    if (isEdit && !address.country) {
      return Promise.reject(
        intl.$t(
          { defaultMessage:
            'Please select <VenueSingular></VenueSingular> address from suggested list' }
        )
      )
    }

    if(!address.addressLine){
      return Promise.reject(
        intl.$t({ defaultMessage: 'Please select address from suggested list' })
      )
    }

    if (address.country === address.city && address.city === address.addressLine) {
      return Promise.reject(
        intl.$t(
          { defaultMessage: 'Make sure to include a city and country in the address' }
        )
      )
    }

    if (isEdit && !_.isEmpty(value) && isSameValue && !isSameCountry) {
      return Promise.reject(
        intl.$t(
          { defaultMessage: 'Address must be in {country}' },
          { country: data?.address.country }
        )
      )
    }
    return Promise.resolve()
  }

  const addressOnChange = async (place: google.maps.places.PlaceResult) => {
    const { latlng, address } = await addressParser(place, getTimezone)
    formRef.current?.setFieldValue('address',
      action === 'edit' ? { ...address, countryCode } : address) // Keep countryCode for edit mode
    setMarker(latlng)
    setCenter(latlng.toJSON())
    updateAddress(address)
    setZoom(16)
  }
  const { ref: placeInputRef } = usePlacesAutocomplete({
    onPlaceSelected: addressOnChange
  })

  const handleSubmit = async (
    values: VenueExtended,
    trigger?: (args: RequestPayload<unknown>) => { unwrap: () => Promise<CommonResult> },
    needRedirect: boolean = true
  ) => {
    try {
      const formData = { ...values }
      formData.address = countryCode ? { ...address, countryCode } : address

      if (trigger) {
        const result = await trigger({ params, payload: formData }).unwrap()

        if (result.response?.id) {
          await saveEnforcementConfig(result.response.id)
        }
      }

      if (modalMode) {
        modalCallBack?.(formData)
      } else {
        needRedirect && redirectPreviousPage(navigate, previousPath, linkToVenues)
      }
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleAddVenue = async (values: VenueExtended) => {
    await checkNameExists(values.name)
    if (checkFormIsInvalid())
      return
    await handleSubmit(values, addVenue)
  }

  const handleEditVenue = async (values: VenueExtended) => {
    await checkNameExists(values.name)
    if (checkFormIsInvalid())
      return
    await handleSubmit(values, updateVenue, false)
  }

  const handleOverrideVenue = async (values: VenueExtended) => {
    await checkNameExists(values.name)
    if (checkFormIsInvalid())
      return
    await handleSubmit(values, undefined, false)
  }

  const saveHandlerMap: Record<string, (values: VenueExtended) => Promise<boolean | void>> = {
    edit: handleEditVenue,
    add: handleAddVenue,
    override: handleOverrideVenue
  }

  const onCancel = () => {
    modalMode ? modalCallBack?.() : redirectPreviousPage(navigate, previousPath, linkToVenues)
  }

  const isHeaderVisible = (): boolean => {
    return action !== 'edit' && !modalMode
  }

  const checkFormIsInvalid = () => {
    const errors = formRef.current?.getFieldsError()
    const hasErrors = errors?.some((field) => field.errors.length > 0)
    return hasErrors
  }

  const onBlurNameHandling = async (ev: React.FocusEvent<HTMLInputElement, Element>) => {
    if (checkFormIsInvalid())
      return
    checkNameExists(ev.target.value)
  }

  const checkNameExists = async (name: string) => {
    setValidating(true)
    formRef.current?.setFields([{ name: 'name', validating: true }])
    try {
      await nameValidator(name)
      formRef.current?.setFields([{ name: 'name', errors: [],
        validating: false }])
    } catch (error: unknown | string) {
      formRef.current?.setFields([{ name: 'name', errors: [error as string],
        validating: false }])
    } finally {
      setValidating(false)
    }
  }


  return (
    <>
      {isHeaderVisible() && <PageHeader
        title={pageTitle}
        breadcrumb={breadcrumb}
      />}
      <Loader states={[{
        isLoading: false,
        isFetching: updateVenueIsLoading
      }]}>
        <StepsFormLegacy
          formRef={formRef}
          onFinish={saveHandlerMap[action]}
          onCancel={onCancel}
          buttonLabel={{ submit: action === 'edit' ?
            intl.$t({ defaultMessage: 'Save' }):
            intl.$t({ defaultMessage: 'Add' }) }}
          {...getEnforcedStepsFormProps('StepsFormLegacy')}
        >
          <StepsFormLegacy.StepForm>
            <Row gutter={20}>
              <Col span={modalMode ? 20 : 8}>
                <Form.Item
                  name='name'
                  label={intl.$t({ defaultMessage: '<VenueSingular></VenueSingular> Name' })}
                  validateStatus={validating ? 'validating' : undefined}
                  rules={[
                    { type: 'string', required: true },
                    { min: 2, transform: (value) => value.trim() },
                    { max: 63, transform: (value) => value.trim() },
                    { validator: (_, value) => whitespaceOnlyRegExp(value) }
                  ]}
                  validateFirst
                  hasFeedback
                  validateTrigger={'onChange'}
                  children={<Input onBlur={onBlurNameHandling}/>}
                />
                <Form.Item
                  name='description'
                  label={intl.$t({ defaultMessage: 'Description' })}
                  children={<Input.TextArea rows={2} maxLength={180} />}
                />
                {isTagsEnabled && <Form.Item
                  name='tags'
                  label={intl.$t({ defaultMessage: 'Tags' })}
                  rules={[{
                    validator: (_, value) => validateTags(value)
                  }]}
                  children={<Select
                    options={venueTagOptions}
                    mode='tags'
                    maxLength={24} />}
                />}

              </Col>
            </Row>
            <Row gutter={20}>
              <Col span={modalMode ? 20 : 10}>
                <GoogleMap.FormItem
                  label={intl.$t({ defaultMessage: 'Address' })}
                  required
                  extra={intl.$t({
                    defaultMessage: 'Make sure to include a city and country in the address'
                  })}
                >
                  <Form.Item
                    noStyle
                    label={intl.$t({ defaultMessage: 'Address' })}
                    name={['address', 'addressLine']}
                    rules={[{
                      required: isMapEnabled ? true : false
                    }, {
                      validator: (_, value) => addressValidator(value),
                      validateTrigger: 'onBlur'
                    }
                    ]}
                  >
                    <Input
                      allowClear
                      placeholder={intl.$t({ defaultMessage: 'Set address here' })}
                      prefix={<SearchOutlined />}
                      data-testid='address-input'
                      ref={placeInputRef}
                      disabled={!isMapEnabled}
                    />
                  </Form.Item>
                  {isMapEnabled ?
                    <GoogleMapWithPreference
                      libraries={['places']}
                      mapTypeControl={false}
                      streetViewControl={false}
                      fullscreenControl={false}
                      zoom={zoom}
                      center={center}
                    >
                      {marker && <GoogleMapMarker position={marker} />}
                    </GoogleMapWithPreference>
                    :
                    <GoogleMap.NotEnabled />
                  }
                </GoogleMap.FormItem>
              </Col>
            </Row>
            {isMapEnabled &&
              <Row gutter={20}>
                <Col span={modalMode ? 20 : 8}>
                  <Form.Item
                    label={intl.$t({ defaultMessage: 'Wi-Fi Country Code' })}
                    tooltip={intl.$t( MessageMapping.wifi_country_code_tooltip )}
                    name={['address', 'countryCode']}
                  >
                    <Select
                      options={wifiCountryCodes}
                      onChange={(countryCode: string) => setCountryCode(countryCode)}
                      showSearch
                      allowClear
                      optionFilterProp='label'
                      placeholder='Please select a country'
                      disabled={action === 'edit'}
                    />
                  </Form.Item>
                </Col>
              </Row>
            }
            {!modalMode &&
              <Row gutter={20}>
                <Col span={8}>
                  <ProtectedEnforceTemplateToggleVenue templateId={data?.id} />
                </Col>
              </Row>
            }
          </StepsFormLegacy.StepForm>
        </StepsFormLegacy>
      </Loader>
    </>
  )
}

function usePreviousPath (): string {
  const { previousPath } = useContext(VenueEditContext)
  const { isTemplate } = useConfigTemplate()
  const location = useLocation()

  return isTemplate
    ? (previousPath ?? (location as LocationExtended)?.state?.from?.pathname)
    : previousPath
}
