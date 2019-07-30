export function loadScript(src: string, id: string) {
  const tag = document.createElement('script')
  tag.async = true
  tag.src = src
  tag.id = id
  document.getElementsByTagName('body')[0].appendChild(tag)
}
