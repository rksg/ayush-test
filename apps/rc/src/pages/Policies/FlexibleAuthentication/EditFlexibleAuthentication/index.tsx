import { Form } from 'antd'

import { FlexibleAuthenticationForm }          from '@acx-ui/rc/components'
import {
  useGetFlexAuthenticationProfilesQuery,
  useUpdateFlexAuthenticationProfileMutation
}                      from '@acx-ui/rc/services'
import { FlexibleAuthentication }                from '@acx-ui/rc/utils'
import { useParams, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

const EditFlexibleAuthentication = () => {
  const navigate = useNavigate()
  const basePath = useTenantLink('/policies/')

  const [form] = Form.useForm()
  const params = useParams()
  const [ updateFlexAuthenticationProfile ] = useUpdateFlexAuthenticationProfileMutation()

  const { profileDetail } = useGetFlexAuthenticationProfilesQuery(
    { payload: {
      filters: { id: [params.policyId] }
    } }, {
      selectFromResult: ( { data, isLoading, isFetching } ) => {
        return {
          profileDetail: data?.data?.[0],
          isLoading,
          isFetching
        }
      }
    }
  )

  const onFinish = async (data: FlexibleAuthentication) => {
    try {
      await updateFlexAuthenticationProfile({
        params: { profileId: profileDetail?.id },
        payload: {
          ...data,
          id: profileDetail?.id,
          profileId: profileDetail?.id
        }
      }).unwrap()
      navigate(`${basePath.pathname}/authentication/${profileDetail?.id}/detail`)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error)
    }
  }

  return (
    <FlexibleAuthenticationForm
      form={form}
      editMode={true}
      onFinish={onFinish}
      data={profileDetail}
    />
  )
}

export default EditFlexibleAuthentication