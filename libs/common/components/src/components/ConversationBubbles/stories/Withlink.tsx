import { Conversation, content } from '..'


export function Withlink () {
  const contentUser = 'List zones with higher co-channel interference in 2.4 GHz band'

  const fulfillmentMessagesWithLink = [
    {
      text: {
        text: [
          `There are 99 switchs having a name similar to "icx".
          \n            Showing C0:C5:20:82:3D:86 found in `
        ]
      }
    },
    {
      text: {
        text: [
          'Here is the summary of switch Access-AP from Oct 09 2023 14:19 to Oct 10 2023 14:19:'
        ]
      }
    },
    {
      text: {
        text: [
          `Switch Name: Access-AP
          \n  MAC Address: C0:C5:20:82:3D:86
          \n  Switch IP: 10.157.7.55
          \n  Switch Serial: FNG4348S01Z
          \n  Switch Status: ONLINE
          \n  Up Time: 0\n  Connected wired devices: 0
          \n  CPU utilization: 0%\n  Memory utilization: 0%\n  PoE utilization: 0%`
        ]
      }
    },
    {
      payload: {
        richContent: [
          [
            {
              link: '',
              type: 'button',
              icon: {
                color: '#42a5f5',
                type: 'launch'
              },
              text: 'Go to Switch Report',
              event: {
                parameters: {
                  url: `/analytics/report/switch/C0:C5:20:82:3D:86?date=
                  eyJyYW5nZSI6IkN1c3RvbSIsImVuZERhdGUiOiIyMDIzLTEwLTEwVDA4OjQ5OjEzL
                  jMyNFoiLCJzdGFydERhdGUiOiIyMDIzLTEwLTA5VDA4OjQ5OjEzLjMyNFoifQ==`
                },
                name: 'url',
                languageCode: 'en'
              }
            }
          ]
        ]
      }
    }
  ]

  const content:content[] =
  [ { type: 'user', isReplying: false, contentList: [{ text: { text: [contentUser] } }] },
    { type: 'bot', isReplying: false, contentList: fulfillmentMessagesWithLink }
  ]

  return <Conversation
    content={content}
    classList='conversation'
    style={{ height: 410, width: 416, whiteSpace: 'pre-line' }}></Conversation>
}