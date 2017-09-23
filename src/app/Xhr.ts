export const xhr = async <T>(
  url: string,
  postData?: {},
  isResponseJson: boolean = false
): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const req = new XMLHttpRequest()
    req.onreadystatechange = () => {
      if (req.readyState === req.DONE) {
        const response = req.responseText
        if (req.status === 200 && response) {
          if (isResponseJson) {
            try {
              resolve(JSON.parse(response))
            } catch (e) {
              reject(e.message)
            }
          }
          resolve(response as any)
        } else {
          reject()
        }
      }
    }
    req.open(postData ? "POST" : "GET", url.trim(), true)
    req.send(postData && JSON.stringify(postData))
    req.onerror = err => {
      reject({ error: `XHR Error: ${err}` })
    }
  })
