const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/submit-form', async (req, res) => {
    const {
        firstName,
        lastName,
        email,
        phone,
        zip,
        MobilePhone,
        IsMobile,
        IPAddress,
        consentText,
        ConsentGiven,
        country
    } = req.body;

    // Default country to USA
    const countryValue = country && country.trim() !== '' ? country : 'USA';

    if (!IPAddress || !consentText || ConsentGiven !== "Yes") {
        return res.status(400).send('TCPA consent not captured properly.');
    }

    const userAgent = req.headers['user-agent'] || "";

    const payload = {
        source: {
            vid: 99804,
            aid: 43,
            lid: 12,
            sendDelay: 0,
            returnUrl: ""
        },
        leads: [
            {
                properties: { reference: "", noSell: True },
                fields: {
                    FirstName: firstName || "",
                    LastName: lastName || "",
                    Email: email || "",
                    Phone: phone || "",
                    Zip: zip || "",
                    MobilePhone: MobilePhone || "",
                    IsMobile: IsMobile || "",
                    IPAddress: IPAddress || "",
                    ConsentText: consentText || "",
                    ConsentDateTime: new Date().toISOString(),
                    ConsentGiven: "Yes",
                    UserAgent: userAgent,
                    Country: countryValue
                }
            }
        ]
    };

    try {
        const response = await axios.post(
            'https://leads-dev.leadexec.net/processor/insert/general',
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': '[YOUR_API_KEY]' // replace with your real API key
                }
            }
        );
        res.send('Lead submitted successfully with consent!');
    } catch (err) {
        console.error(err.response?.data || err.message);
        res.status(500).send('Error submitting lead to LeadExec');
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
