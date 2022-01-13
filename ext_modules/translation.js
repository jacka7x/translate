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
const subscriptionKey = '22c1faa52e564c72ab2a2946d457a429';
const endpoint = 'API KEY';
const region = 'koreacentral';
function translate(inputText, fromLang, toLang) {
    var _a, _b, _c;
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
            const translationResult = (_c = (_b = (_a = data === null || data === void 0 ? void 0 : data[0]) === null || _a === void 0 ? void 0 : _a["translations"]) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c["text"];
            if (!translationResult || translationResult.length === 0) {
                console.error('No translation found');
                return null;
            }
            return translationResult;
        }
        catch (error) {
            console.error(error);
            return null;
        }
    });
}
export { translate };
