/* eslint-disable max-len */
import { FormattedMessage, useIntl } from 'react-intl'

import { Modal } from '../Modal'


export function ScheduleTipsModal (props: { isModalOpen: boolean, onOK: () => void }) {
  const { $t } = useIntl()

  return (
    <Modal
      title='Network Scheduler Tips'
      width={800}
      cancelButtonProps={{ style: { display: 'none' } }}
      visible={props.isModalOpen}
      onOk={props.onOK}
      maskClosable={false}
      destroyOnClose={true}
      keyboard={false}
      closable={false}
    >
      <p>{$t({ defaultMessage: 'You can set custom schedule using the following options:' })}</p>
      <p>- <FormattedMessage
        defaultMessage='Activate or deactivate the network for <b>entire day</b>'
        values={{
          b: (contents) => <b>{contents}</b>
        }}
      />
      </p>
      <p>- <FormattedMessage
        // eslint-disable-next-line max-len
        defaultMessage='Activate or deactivate the network for <b>any time-slot</b> by clicking on it'
        values={{
          b: (contents) => <b>{contents}</b>
        }}
      />
      </p>
      <p>- <FormattedMessage
        // eslint-disable-next-line max-len
        defaultMessage='Activate or deactivate the network for <b>multiple adjacent time-slots</b> by dragging your mouse over them'
        values={{
          b: (contents) => <b>{contents}</b>
        }}
      />
      </p>
      <video preload='auto' controls>
        <source src='./assets/videos/scheduling/entireDay.mp4' type='video/mp4' />
      </video>
      <p>{$t({ defaultMessage: 'To set the network schedule for entire day use the checkbox next to it' })}</p>
      <video preload='auto' controls>
        <source src='./assets/videos/scheduling/partOfDay.mp4' type='video/mp4' />
      </video>
      <p>{$t({ defaultMessage: 'To set the network schedule for any time-slot, click the time slot' })}</p>
      <video preload='auto' controls>
        <source src='./assets/videos/scheduling/multipleDays.mp4' type='video/mp4' />
      </video>
      <p>- <FormattedMessage
        defaultMessage='To set the network schedule for <b>multiple adjacent time-slots</b>, drag the mouse over them'
        values={{
          b: (contents) => <b>{contents}</b>
        }}
      />
      </p>
      <p>- {$t({ defaultMessage: 'All the rectangles in the drag area will receive the same status – opposite the status of the rectangle where the drag started' })}</p>
    </Modal>
  )
}
