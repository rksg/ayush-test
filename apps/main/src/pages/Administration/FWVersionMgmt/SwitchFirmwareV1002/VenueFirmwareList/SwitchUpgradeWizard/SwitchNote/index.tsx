import { useIntl } from 'react-intl'

import { SwitchFirmwareV1002 } from '@acx-ui/rc/utils'

import * as UI from '../../styledComponents'


export enum NotesEnum {
  NOTE7150_1 = 'NOTE7150_1',
  NOTE8200_1 = 'NOTE8200_1'
}

export interface NoteProps {
  type: NotesEnum,
  data: SwitchFirmwareV1002[][]
}

interface SwitchNoteProps {
  notes: NoteProps[]
}

export function SwitchNote (props: SwitchNoteProps) {
  const { $t } = useIntl()
  // const switchListArray = props.icx7150C08pGroupedData

  const noteMesage = {
    [NotesEnum.NOTE7150_1]:
      $t({
        // eslint-disable-next-line max-len
        defaultMessage: 'The following switches will not be upgraded because the ICX7150-C08P/PT models do not support FastIron versions 10.0.x. You can still upgrade them to the desired 09.0.10x version by selecting these switches separately.'
      }),
    [NotesEnum.NOTE8200_1]:
      $t({
        // eslint-disable-next-line max-len
        defaultMessage: 'The following switches will not be upgraded because the ICX8200-AV models only support version 10.0.10e and above. You can still upgrade them to 10.0.10e and above by selecting the switches separately.'
      })
  }

  return (
    <UI.Description>
      <b>{$t({ defaultMessage: 'Note' })}</b>
      <ol>
        {props.notes.map(note => (<div id={note.type} key={note.type}>
          <li key={note.type}>  {noteMesage[note.type]}
            <ul>
              {note.data.map((switchList, index) => (
                <li key={index}>
                  <div>
                    <span style={{ fontWeight: '600' }}>
                      {$t({ defaultMessage: '<venueSingular></venueSingular>:' })} </span>
                    {switchList[0]?.venueName}
                  </div>
                  <div>
                    <span style={{ fontWeight: '600' }}>
                      {$t({ defaultMessage: 'Switch(es):' })} </span>
                    {switchList.map(switchItem => switchItem.switchName).join(', ')}
                  </div>
                </li>
              ))}
            </ul>
          </li>
        </div>)
        )}
      </ol>
    </UI.Description>
  )
}
