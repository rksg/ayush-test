import { useEffect, useState } from 'react'

import Icon from '@ant-design/icons'

import { useGetPlmMessageBannerQuery } from '@acx-ui/rc/services'
import { useParams  }                  from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

export function CloudMessageBanner () {

  const params = useParams()
  const [showMessage, setMessageFlag] = useState(false)

  const { data } = useGetPlmMessageBannerQuery({ params })
  useEffect(() => {
    if (data) {
      if (data?.description) setMessageFlag(true)
    }
  }, [data])

  return (
    showMessage ? (<UI.Container>
      <UI.Label>
        <span style={{ float: 'left', marginRight: '7px' }}>
          <Icon component={UI.InformationIcon}/>
        </span>
        {data?.description}
        <span
          style={{ float: 'right', cursor: 'pointer' }}
          onClick={() => {
            setMessageFlag(false)
          }}>
          <Icon component={UI.CloseIcon}/>
        </span>
      </UI.Label>
    </UI.Container>)
      : null
  )
}
