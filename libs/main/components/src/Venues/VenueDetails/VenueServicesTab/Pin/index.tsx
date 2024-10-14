
import { Space }     from 'antd'
import { useParams } from 'react-router-dom'

import { Loader }                                                                      from '@acx-ui/components'
import { PersonalIdentityNetworkDetailTableGroup, PersonalIdentityNetworkServiceInfo } from '@acx-ui/rc/components'
import { useGetEdgePinViewDataListQuery }                                              from '@acx-ui/rc/services'

export const EdgePin = () => {

  const { venueId } = useParams()

  const {
    pinId,
    isPinViewDataLoading
  } = useGetEdgePinViewDataListQuery({
    payload: {
      fields: ['id'],
      filters: { venueId: [venueId] }
    }
  }, {
    skip: !!!venueId,
    selectFromResult: ({ data, isLoading }) => {
      return {
        pinId: data?.data[0]?.id,
        isPinViewDataLoading: isLoading
      }
    }
  })

  return (
    <Loader states={[{
      isLoading: isPinViewDataLoading,
      isFetching: false
    }]}>
      {
        pinId &&
          <Space direction='vertical'>
            <PersonalIdentityNetworkServiceInfo pinId={pinId || ''} />
            <PersonalIdentityNetworkDetailTableGroup pinId={pinId || ''} />
          </Space>
      }
    </Loader>
  )

}
