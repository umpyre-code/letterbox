export function loadScript(src: string, id: string, loaded: () => void) {
  if (document.querySelector(id) === null) {
    const tag = document.createElement('script')
    tag.async = true
    tag.src = src
    tag.id = id
    document.querySelectorAll('body')[0].appendChild(tag)
    document.querySelector('#stripe-js').addEventListener('load', loaded)
  } else {
    loaded()
  }
}
