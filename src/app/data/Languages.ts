import { LanguageFlag } from "~/app/model"

const data = [
  ["Afrikaans", "Afrikaans", "af", "afr"],
  ["Albanian", "shqip", "sq", "sqi"],
  ["Amharic", "አማርኛ", "am", "amh"],
  ["Arabic", "العربية", "ar", "ara", LanguageFlag.Rtl],
  ["Armenian", "Հայերեն", "hy", "hye"],
  ["Azeerbaijani", "azərbaycanca", "az", "aze"],
  ["Basque", "euskara", "eu", "eus"],
  ["Belarusian", "беларуская", "be", "bel"],
  ["Bengali", "বাংলা", "bn", "ben"],
  ["Bosnian", "bosanski", "bs", "bos"],
  ["Bulgarian", "български", "bg", "bul"],
  ["Catalan", "català", "ca", "cat"],
  ["Cebuano", "Cebuano", "ceb", "ceb"],
  ["Chinese (Simplified)", "简化字", "zh-CN", "cmn", LanguageFlag.Spaceless],
  ["Chinese (Traditional)", "正體字", "zh-TW", "lzh", LanguageFlag.Spaceless],
  ["Corsican", "corsu", "co", "cos"],
  ["Croatian", "hrvatski", "hr", "hrv"],
  ["Czech", "čeština", "cs", "ces"],
  ["Danish", "dansk", "da", "dan"],
  ["Dutch", "Nederlands", "nl", "nld"],
  ["English", "English", "en", "eng"],
  ["Esperanto", "Esperanto", "eo", "epo"],
  ["Estonian", "eesti", "et", "est"],
  ["Finnish", "suomi", "fi", "fin"],
  ["French", "français", "fr", "fra"],
  ["Galician", "galego", "gl", "glg"],
  ["Georgian", "ქართული", "ka", "kat"],
  ["German", "Deutsch", "de", "deu"],
  ["Greek", "Ελληνικά", "el", "ell"],
  ["Gujarati", "ગુજરાતી", "gu", "guj"],
  ["Haitian Creole", "Kreyòl ayisyen", "ht", "hat"],
  ["Hausa", "Hausa", "ha", "hau"],
  ["Hawaiian", "Hawaiʻi", "haw", ""],
  ["Hebrew", "עברית", "iw", "heb", LanguageFlag.Rtl],
  ["Hindi", "हिन्दी", "hi", "hin"],
  ["Hmong", "Hmong", "hmn", ""],
  ["Hungarian", "magyar", "hu", "hun"],
  ["Icelandic", "íslenska", "is", "isl"],
  ["Igbo", "Igbo", "ig", "ibo"],
  ["Indonesian", "Bahasa Indonesia", "id", "ind"],
  ["Irish", "Gaeilge", "ga", "gle"],
  ["Italian", "italiano", "it", "ita"],
  ["Japanese", "日本語", "ja", "jpn", LanguageFlag.Spaceless],
  ["Javanese", "Basa Jawa", "jw", "jav"],
  ["Kannada", "ಕನ್ನಡ", "kn", "kan"],
  ["Kazakh", "қазақша", "kk", "kaz"],
  ["Khmer", "ភាសាខ្មែរ", "km", ""],
  ["Kirghiz", "Кыргызча", "ky", ""],
  ["Korean", "한국어", "ko", "kor"],
  ["Kurdish", "Kurdî", "ku", "ckb"],
  ["Lao", "ລາວ", "lo", ""],
  ["Latin", "Latina", "la", "lat"],
  ["Latvian", "latviešu", "lv", "lvs"],
  ["Lithuanian", "lietuvių", "lt", "lit"],
  ["Luxembourgish", "Lëtzebuergesch", "lb", ""],
  ["Macedonian", "македонски", "mk", ""],
  ["Malagasy", "Malagasy", "mg", ""],
  ["Malay", "Bahasa Melayu", "ms", "zlm"],
  ["Malayalam", "മലയാളം", "ml", "mal"],
  ["Maori", "Māori", "mi", "mri"],
  ["Marathi", "मराठी", "mr", "mar"],
  ["Mongolian", "монгол", "mn", "mon"],
  ["Myanmar (Burmese)", "မြန်မာစာ", "my", "mya"],
  ["Nepali", "नेपाली", "ne", "nep"],
  ["Norwegian (Bokmål)", "norsk", "no", "nob"],
  ["Nyanja (Chichewa)", "Chi-Chewa", "ny", ""],
  ["Pashto", "پښتو", "ps", "", LanguageFlag.Rtl],
  ["Persian", "فارسی", "fa", "fas", LanguageFlag.Rtl],
  ["Polish", "polski", "pl", "pol"],
  ["Portuguese", "português", "pt", "por"],
  ["Punjabi", "ਪੰਜਾਬੀ", "pa", ""],
  ["Romanian", "română", "ro", "ron"],
  ["Russian", "русский", "ru", "rus"],
  ["Samoan", "Gagana Samoa", "sm", ""],
  ["Scots Gaelic", "Gàidhlig", "gd", "gla"],
  ["Serbian", "српски/srpski", "sr", "srp"],
  ["Sesotho", "Sesotho", "st", ""],
  ["Shona", "chiShona", "sn", ""],
  ["Sindhi", "سنڌي", "sd", "", LanguageFlag.Rtl],
  ["Sinhala (Sinhalese)", "සිංහල", "si", "sin"],
  ["Slovak", "slovenčina", "sk", "slk"],
  ["Slovenian", "slovenščina", "sl", "slv"],
  ["Somali", "Soomaaliga", "so", ""],
  ["Spanish", "español", "es", "spa"],
  ["Sundanese", "Basa Sunda", "su", "sun"],
  ["Swahili", "Kiswahili", "sw", "swh"],
  ["Swedish", "svenska", "sv", "swe"],
  ["Tagalog (Filipino)", "Tagalog", "tl", "tgl"],
  ["Tajik", "тоҷикӣ", "tg", ""],
  ["Tamil", "தமிழ்", "ta", "tam"],
  ["Telugu", "తెలుగు", "te", "tel"],
  ["Thai", "ไทย", "th", "tha"],
  ["Turkish", "Türkçe", "tr", "tur"],
  ["Ukrainian", "українська", "uk", "ukr"],
  ["Urdu", "اردو", "ur", "urd", LanguageFlag.Rtl],
  ["Uzbek", "oʻzbekcha/ўзбекча", "uz", "uzn"],
  ["Vietnamese", "Tiếng Việt", "vi", "vie"],
  ["Welsh", "Cymraeg", "cy", "cym"],
  ["West Frisian", "Frysk", "fy", "fry"],
  ["Xhosa", "isiXhosa", "xh", ""],
  ["Yiddish", "ייִדיש", "yi", "yid", LanguageFlag.Rtl],
  ["Yoruba", "Yorùbá", "yo", "tor"],
  ["Zulu", "isiZulu", "zu", ""]
]

export const languages = data
  .filter(d => d[3] !== "")
  .map(d => ({
    name: d[0] as string,
    localName: d[1] as string,
    codeGt: d[2] as string,
    code6393: d[3] as string,
    flags: d.length === 5 ? d[4] as LanguageFlag : LanguageFlag.None
  }))
  .sort((a, b) => a.localName.localeCompare(b.localName))
