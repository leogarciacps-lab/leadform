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
        IPAddress,
        consentText,
        ConsentGiven,
        country
    } = req.body;

    const countryValue = country && country.trim() ? country : 'USA';
    const consentOk = ConsentGiven === 'Yes';

    if (!IPAddress || !consentText || !consentOk) {
        return res.status(400).send('TCPA consent not captured properly.');
    }

    const payload = {
        source: {
            vid: 70193,
            aid: 30518,
            lid: 6632,
            sendDelay: 0,
            returnUrl: ""
        },
        leads: [{
            properties: { reference: "", noSell: false },
            fields: {
                FirstName: firstName || "",
                LastName: lastName || "",
                Email: email || "",
                Phone: phone || "",
                Zip: zip || "",
                IPAddress,
                ConsentText: consentText,
                ConsentDateTime: new Date().toISOString(),
                ConsentGiven: "Yes",
                UserAgent: req.headers['user-agent'] || "",
                Country: countryValue
            }
        }]
    };

    try {
        await axios.post(
            'https://leads.leadexec.net/processor/insert/general/json/async',
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': '[YOUR_API_KEY]'
                }
            }
        );
        res.send('Lead submitted successfully with consent!');
    } catch (err) {
        console.error(err.response?.data || err.message);
        res.status(500).send('Error submitting lead to LeadExec');
    }
});

app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
);
