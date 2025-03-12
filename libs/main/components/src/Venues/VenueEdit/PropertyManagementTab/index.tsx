import { useContext } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { VenuePropertyManagementForm }           from '@acx-ui/rc/components'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { VenueEditContext } from '../index'

export function PropertyManagementTab () {
  const { $t } = useIntl()
  const basePath = useTenantLink('/venues/')
  const { venueId } = useParams()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const { editContextData, setEditContextData } = useContext(VenueEditContext)

  const navigateToVenueOverview = () => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${venueId}/venue-details/overview`
    })
  }

  const preSubmit = () => {
    setEditContextData({
      ...editContextData,
      isDirty: false
    })
  }

  const postSubmit = () => {
    navigateToVenueOverview()
  }

  const handleFormChange = async () => {
    setEditContextData({
      ...editContextData,
      isDirty: true,
      tabTitle: $t({ defaultMessage: 'Property' }),
      updateChanges: () => form.submit()
    })
  }

  return (
    <VenuePropertyManagementForm
      form={form}
      venueId={venueId ?? ''}
      onCancel={navigateToVenueOverview}
      onValueChange={handleFormChange}
      preSubmit={preSubmit}
      postSubmit={postSubmit}
      editMode={true}
    />
  )
}
