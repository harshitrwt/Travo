const fetch = require("node-fetch");

async function translateWithLingo(text, targetLang) {
  try {
    const res = await fetch("https://lingva.ml/api/v1/auto/" + targetLang + "/" + encodeURIComponent(text));
    if (!res.ok) {
      throw new Error("Lingo API error " + res.status);
    }

    const data = await res.json();
    return data?.translation || "";
  } catch (err) {
    console.error("Lingo translation failed:", err);
    throw err;
  }
}

module.exports = { translateWithLingo };
