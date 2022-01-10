var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// API key should be hidden in backend (and new key generated)
// For now, keep in apikey.txt (.gitignore)
const subscriptionKey = '035f3a01345d4519b0579ca20757717c';
const endpoint = 'https://api.cognitive.microsofttranslator.com';
const region = 'koreacentral';
function translate(inputText, fromLang, toLang) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const url = `/translate?api-version=3.0&to=${toLang}&from=${fromLang}`;
            const options = {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-type': 'application/json',
                    'Ocp-Apim-Subscription-Key': subscriptionKey,
                    'Ocp-Apim-Subscription-Region': region
                },
                body: JSON.stringify([{ 'text': inputText }])
            };
            const response = yield fetch(endpoint + url, options);
            const data = yield response.json();
            const translationResult = data[0]["translations"][0]["text"];
            console.log(translationResult ? translationResult : "No translation found.");
            return translationResult;
        }
        catch (error) {
            console.error(error);
            return null;
        }
    });
}
export { translate };
