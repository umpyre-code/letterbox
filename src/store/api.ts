import axios, { AxiosInstance } from 'axios'
import { ApplicationState } from '.'

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || 'https://api.staging.umpyre.io'
export default API_ENDPOINT

export function clientFromState(state: ApplicationState): AxiosInstance {
  const API_KEY = state.clientState.client!.token
  return axios.create({ baseURL: API_ENDPOINT, headers: { 'X-UMPYRE-APIKEY': API_KEY } })
}
