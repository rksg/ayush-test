/* eslint-disable max-len */
import { FormattedMessage, useIntl } from 'react-intl'

import { Modal } from '../Modal'

export function PoeSchedulerTipsModal (props: { isModalOpen: boolean, onOK: () => void }) {
  const { $t } = useIntl()


  type VideoSectionProps = {
    marginTop: string
    message: string
    videoSrc: string
    additionalContent?: React.ReactNode
  }

  const VideoSection: React.FC<VideoSectionProps> = ({ marginTop, message, videoSrc, additionalContent = null }) => (
    <div style={{ marginTop }}>
      <p style={{ marginBottom: '10px' }}>
        {message}
      </p>
      {additionalContent}
      <video preload='auto' controls style={{ width: '500px' }}>
        <source src={videoSrc} type='video/mp4' />
      </video>
    </div>
  )

  return (
    <Modal
      title='Scheduler Tips'
      width={800}
      cancelButtonProps={{ style: { display: 'none' } }}
      visible={props.isModalOpen}
      onOk={props.onOK}
      maskClosable={false}
      destroyOnClose={true}
      keyboard={false}
      closable={false}
    >
      <p>{$t({ defaultMessage: 'You can customize the PoE schedule using the following options:' })}</p>
      <p>• <FormattedMessage
        defaultMessage='Turn PoE <b>on or off for the entire day</b> using the checkbox next to the day label.'
        values={{
          b: (contents) => <b>{contents}</b>
        }}
      />
      </p>
      <p>• <FormattedMessage
        defaultMessage='Turn PoE <b>on or off for a specific time slot</b> by clicking on that time slot.'
        values={{
          b: (contents) => <b>{contents}</b>
        }}
      />
      </p>
      <p>• <FormattedMessage
        defaultMessage='Turn PoE <b>on or off for multiple consecutive time slots</b> by clicking and dragging across them.'
        values={{
          b: (contents) => <b>{contents}</b>
        }}
      />
      </p>

      <>
        <VideoSection
          marginTop='30px'
          message={$t({ defaultMessage: 'To enable or disable PoE for an entire day, use the checkbox next to the day label.' })}
          videoSrc='./assets/videos/scheduling/switchEntireDay.mp4'
        />
        <VideoSection
          marginTop='20px'
          message={$t({ defaultMessage: 'To enable PoE during a specific time slot, click directly on the desired slot.' })}
          videoSrc='./assets/videos/scheduling/switchPartOfDay.mp4'
        />
        <VideoSection
          marginTop='20px'
          message={$t({ defaultMessage: 'To enable PoE for multiple consecutive time slots, click and drag across the desired time range.' })}
          videoSrc='./assets/videos/scheduling/switchMultipleDays.mp4'
          additionalContent={
            <p style={{ marginBottom: '10px', marginLeft: '20px' }}>
              • <FormattedMessage
                defaultMessage='When dragging, all selected slots will be set to the opposite state of the slot where the drag began.'
                values={{
                  b: (contents) => <b>{contents}</b>
                }}
              />
            </p>
          }
        />
      </>
    </Modal>
  )
}
