export const xhr = async <T>(
  url: string,
  postData?: {},
  isResponseJson: boolean = false
): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const req = new XMLHttpRequest()
    let response
    req.onreadystatechange = () => {
      if (req.readyState === req.DONE) {
        response = req.responseText
        if (response) {
          if (isResponseJson) {
            response = JSON.parse(response)
          }
          resolve(response)
        }
      }
    }
    req.open(postData ? "POST" : "GET", url.trim(), true)
    req.send(postData && JSON.stringify(postData))
    req.onerror = err => {
      reject({ error: `XHR Error: ${err}` })
    }
  })
