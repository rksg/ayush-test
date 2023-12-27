import { useIntl } from 'react-intl'

import { Drawer, useStepFormContext } from '@acx-ui/components'
import { useVenuesListQuery }         from '@acx-ui/rc/services'
import { useParams }                  from '@acx-ui/react-router-dom'

import { NetworkSegmentationGroupFormData } from '..'

import { PersonalIdentityDiagram } from './PersonalIdentityDiagram'
import * as UI                     from './styledComponents'

const venueOptionsDefaultPayload = {
  fields: [
    'name',
    'id',
    'switches'
  ],
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}


export function PersonalIdentityDrawer (props: {
  open: boolean;
  onClose?: () => void;
}) {
  const { $t } = useIntl()
  useParams()
  const { open, onClose = ()=>{} } = props

  const { form: nsgForm } = useStepFormContext<NetworkSegmentationGroupFormData>()
  const venueId = nsgForm.getFieldValue('venueId')

  const {
    venueMap = {} as { [key: string]: { switchCount: number } }
  } = useVenuesListQuery(
    { payload: venueOptionsDefaultPayload }, {
      selectFromResult: ({ data, isLoading }) => {
        return {
          venueOptions: data?.data.map(item => ({ label: item.name, value: item.id })),
          isVenueOptionsLoading: isLoading,
          venueMap: data?.data.reduce((a, item) => ({
            ...a,
            [item.id]: { switchCount: item.switches ?? 0 }
          }), {}) as { [key: string]: { switchCount: number } }
        }
      }
    })

  return (
    <Drawer
      title={$t({ defaultMessage: 'Get prepared for Network Segmentation:' })}
      visible={open}
      onClose={onClose}
      destroyOnClose={true}
      width={550}
    >

      <UI.List>
        <ol>
          <li>
            Deploy a <b>SmartEdge</b> device at the venue where you intend to segment the clients
          </li>
          <li>
            Enable the <b>Property management</b>
            service for the venue on the venue configuration page
            <ul >
              <li>
                When enabling the property management, it’s necessary to
                create a <b>persona group</b> or
                select an existing persona group to associate with the property.
              </li>
              <li>
                When creating the persona group, it’s necessary to select an existing
                <b>DPSK pool service</b> or
                create a new one to apply to the personas from the persona group
              </li>
            </ul>
          </li>
        </ol>
        <dl>
          <u>For Wi-Fi client segmentation</u>
          <dt>Create <b>DPSK networks</b> and activate them on the venue</dt>
          <dd><ul><li>
              Ensure the DPSK networks are using the
            <b>DPSK pool service</b> selected in the persona group
               in the venue’s property management.
              A DPSK network only can be associated with one network segmentation
          </li></ul></dd>
        </dl>
        <dl>
          <u>For Switch clients segmentation</u>
          <dt>
            Configure the <b>Static routes</b> on SmartEdge
            for the distribution switch lookback IP addresses to establish the connection
          </dt>
        </dl>
      </UI.List>
      <UI.List>
        <dl>
        Now, let’s get started to create a Network Segmentation for your clients.
        </dl>
      </UI.List>
      <UI.List>
        <dl>
          <b>See how everything connects together:</b>
        </dl>
      </UI.List>
      <PersonalIdentityDiagram venueInfo={venueMap[venueId]} />
    </Drawer>
  )
}

