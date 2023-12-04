// To connect with local GPT repo
const GPT_URL_ORIGIN='http://localhost:8000'
// const GPT_URL_BASE_PATH=''
// const GPT_ROUTE_PATH=''

const summaryApiUrl = `${GPT_URL_ORIGIN}/ruckus_analytics/summary`


export const getSummary = async ()=>{
  const body={}
  const response= await fetch(summaryApiUrl,{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
  const json = await response.json()
  return json
}