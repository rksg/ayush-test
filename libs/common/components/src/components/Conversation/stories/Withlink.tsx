import { BrowserRouter } from 'react-router-dom'

import { Conversation, Content } from '..'


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
    },
    {
      payload: {
        richContent: [
          [
            {
              // eslint-disable-next-line max-len
              link: '<origin>https://slack.com/oauth/v2/authorize?scope=app_mentions%3Aread%2Ccalls%3Aread%2Ccalls%3Awrite%2Cchannels%3Ahistory%2Cchannels%3Aread%2Cchat%3Awrite%2Cgroups%3Ahistory%2Cim%3Ahistory%2Cim%3Aread%2Cim%3Awrite%2Cincoming-webhook%2Cmpim%3Ahistory%2Cmpim%3Aread%2Cteam%3Aread%2Cusers%3Aread%2Cusers%3Aread.email&state=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpbnN0YWxsT3B0aW9ucyI6eyJzY29wZXMiOlsiYXBwX21lbnRpb25zOnJlYWQiLCJjYWxsczpyZWFkIiwiY2FsbHM6d3JpdGUiLCJjaGFubmVsczpoaXN0b3J5IiwiY2hhbm5lbHM6cmVhZCIsImNoYXQ6d3JpdGUiLCJncm91cHM6aGlzdG9yeSIsImltOmhpc3RvcnkiLCJpbTpyZWFkIiwiaW06d3JpdGUiLCJpbmNvbWluZy13ZWJob29rIiwibXBpbTpoaXN0b3J5IiwibXBpbTpyZWFkIiwidGVhbTpyZWFkIiwidXNlcnM6cmVhZCIsInVzZXJzOnJlYWQuZW1haWwiXX0sIm5vdyI6IjIwMjMtMTAtMTlUMDY6NDU6NDMuMzg5WiIsImlhdCI6MTY5NzY5Nzk0M30.Gs2MsMlw2Jw3vLERcbkQZcjIBRp2d5bmW0r2qvP3pm0&client_id=2621849627333.2623441836566',
              type: 'button',
              icon: {
                color: '#42a5f5',
                type: 'launch'
              },
              text: 'Add to Slack'
            }
          ]
        ]
      }
    },
    {
      payload: {
        richContent: [
          [
            {
              // eslint-disable-next-line max-len
              link: 'https://teams.microsoft.com/l/chat/0/0?users=28:8329d97c-864c-4259-9920-3504585c6d98',
              type: 'button',
              icon: {
                color: '#42a5f5',
                type: 'launch'
              },
              text: 'Chat in Teams'
            }
          ]
        ]
      }
    }
  ]

  const content:Content[] =
  [ { type: 'user', contentList: [{ text: { text: [contentUser] } }] },
    { type: 'bot', contentList: fulfillmentMessagesWithLink }
  ]

  return <BrowserRouter>
    <Conversation
      content={content}
      classList='conversation'
      isReplying={false}
      style={{ height: 410, width: 416, whiteSpace: 'pre-line' }}></Conversation>
  </BrowserRouter>
}