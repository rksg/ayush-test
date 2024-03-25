import { useState } from 'react'

import { Button } from '@acx-ui/components'

import { UpdateNowPerApModel } from './UpdateNowPerApModel'

export function VenueFirmwareListPerApModel () {
  const [ updateNowDialog, setUpdateNowDialog ] = useState(false)
  return (<>
    <div>Venue Firmware List Per AP Model </div>
    <Button type='link' onClick={() => setUpdateNowDialog(true)}>Update Now</Button>
    {updateNowDialog && <UpdateNowPerApModel
      onCancel={() => setUpdateNowDialog(false)}
    />}
  </>)
}
