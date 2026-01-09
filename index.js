const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const FormData = require("form-data");
const { default: axios } = require("axios");

const app = express();
app.use(cors()); // allow React (localhost:3000)
app.use(express.json()); // read JSON body from React

app.post("/proxy/mhvoter", async (req, res) => {
  try {
    const { form = {}, headers = {} } = req.body || {};

    if (!form || typeof form !== "object") {
      return res
        .status(400)
        .json({ error: "Missing 'form' object in request body" });
    }

    const fd = new FormData();
    for (const [k, v] of Object.entries(form)) {
      fd.append(k, v ?? "");
    }

    const r = await axios.post(
      "https://digibitsearch.com/mh-search-engine-apis/mhvoterSearchAdvance.php",
      fd,
      {
        headers: {
          ...fd.getHeaders(), // ✅ multipart boundary
          ...headers, // ✅ your custom headers
          Accept: "application/json, text/plain, */*",
        },
        responseType: "text", // ✅ because API may return HTML/text
        validateStatus: () => true, // ✅ forward non-200s too
        maxBodyLength: Infinity, // 🔥 REQUIRED for multipart
        maxContentLength: Infinity, // 🔥 REQUIRED
        transformRequest: (x) => x, // 🔥 STOP axios from serializing
        responseType: "text",
        validateStatus: () => true,
      }
    );

    res.status(r.status).send(JSON.parse(r.data));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(process.env.PORT || 5000, () => {
  console.log("✅ Server Started");
});
