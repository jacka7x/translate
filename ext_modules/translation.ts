
// API key should be hidden in backend (and new key generated)
// For now, keep in apikey.txt (.gitignore)
const subscriptionKey: string = '22c1faa52e564c72ab2a2946d457a429'
const endpoint: string = 'https://api.cognitive.microsofttranslator.com'
const region: string = 'koreacentral'

// languages supported by extension
type supportedLang = 'en' | 'ko'

async function translate(inputText: string,
    fromLang: supportedLang, toLang: supportedLang): Promise<string | null> {
    
    try {
        const url: string = `/translate?api-version=3.0&to=${toLang}&from=${fromLang}`

        const options: RequestInit = {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-type': 'application/json',
                'Ocp-Apim-Subscription-Key': subscriptionKey,
                'Ocp-Apim-Subscription-Region': region
            },
            body: JSON.stringify([{'text': inputText}])
        }

        const response = await fetch(endpoint + url, options)
        const data = await response.json()
        const translationResult = data?.[0]?.["translations"]?.[0]?.["text"]

        if (!translationResult || translationResult.length === 0){
            console.error('No translation found')
            return null
        }

        return translationResult

    } catch (error) {
        console.error(error)
        return null
    }
}

export { translate }