import { PUBLIC_URL } from '../store/api'

export function updateFavicon(unreadCount: number) {
  const favicon = document.getElementById('favicon') as HTMLLinkElement
  if (favicon) {
    if (unreadCount === 0) {
      favicon.href = `${PUBLIC_URL}/favicon.png`
    } else if (unreadCount >= 5) {
      favicon.href = `${PUBLIC_URL}/favicon-5p.png`
    } else {
      favicon.href = `${PUBLIC_URL}/favicon-${unreadCount}.png`
    }
  }
}
