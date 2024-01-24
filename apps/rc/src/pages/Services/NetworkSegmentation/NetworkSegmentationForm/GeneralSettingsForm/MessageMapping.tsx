/* eslint-disable max-len */
import { FormattedMessage } from 'react-intl'

export const MessageMapping = {
  pin_preparation_list_desc_1: <FormattedMessage
    defaultMessage={'Deploy a <b>SmartEdge</b> device at the venue where you intend to segment the clients'}
    values={{
      b: (content) => <b >{content}</b>
    }}
  />,
  pin_preparation_list_desc_2: <FormattedMessage
    defaultMessage={'Enable the <b>Property management</b>service for the venue on the venue configuration page'}
    values={{
      b: (content) => <b >{content}</b>
    }}
  />,
  pin_preparation_list_desc_2_1: <FormattedMessage
    defaultMessage={'When enabling the property management, it’s necessary to create a <b>persona group</b> or select an existing persona group to associate with the property.'}
    values={{
      b: (content) => <b >{content}</b>
    }}
  />,
  pin_preparation_list_desc_2_2: <FormattedMessage
    defaultMessage={'When creating the persona group, it’s necessary to select an existing <b>DPSK pool service</b> or create a new one to apply to the personas from the persona group'}
    values={{
      b: (content) => <b >{content}</b>
    }}
  />,
  pin_preparation_list_for_wifi: <FormattedMessage
    defaultMessage={'For Wi-Fi client segmentation'}
  />,
  pin_preparation_list_for_wifi_desc_1: <FormattedMessage
    defaultMessage={'Create <b>DPSK networks</b> and activate them on the venue'}
    values={{
      b: (content) => <b >{content}</b>
    }}
  />,
  pin_preparation_list_for_wifi_desc_1_1: <FormattedMessage
    defaultMessage={'Ensure the DPSK networks are using the <b>DPSK pool service</b> selected in the persona group in the venue’s property management. A DPSK network only can be associated with one personal identity network'}
    values={{
      b: (content) => <b >{content}</b>
    }}
  />,
  pin_preparation_list_for_switch: <FormattedMessage
    defaultMessage={'For Switch clients segmentation'}
  />,
  pin_preparation_list_for_switch_desc_1: <FormattedMessage
    defaultMessage={'Configure the <b>Static routes</b> on SmartEdge for the distribution switch lookback IP addresses to establish the connection'}
    values={{
      b: (content) => <b >{content}</b>
    }}
  />,
  pin_preparation_list_start_desc: <FormattedMessage
    defaultMessage={'Now, let’s get started to create a Personal Identity Network for your clients.'}
  />,
  pin_preparation_list_diagram_desc: <FormattedMessage
    defaultMessage={'<b>See how everything connects together:</b>'}
    values={{
      b: (content) => <b >{content}</b>
    }}
  />

}