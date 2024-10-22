const express = require('express');
const bodyParser = require('body-parser');
const jaroWinkler = require('jaro-winkler');

const app = express();
const port = 2121;

app.use(bodyParser.json());

const removeTitles = (name) => {
    const titlePatterns = [
        'Mr', 'Mrs', 'Ms', 'Dr', 'Mohd', 'Md', 'Prof', 'Ch', 'Er'
    ];
    let lowerName = name.toLowerCase();
    titlePatterns.forEach(title => {
        const regex = new RegExp(`\\b${title}\\b\\.?`, 'gi');
        lowerName = lowerName.replace(regex, '');
    });
    return lowerName.trim();
};

const cleanString = (s) => {
    return s.toLowerCase().replace(/\s*([^\w\s-])\s*|\s+|-+|\.+/g, (match, p1) => p1 ? '' : ' ').trim();
};

const jaroWinklerMatch = (name1, name2) => {
    const similarity = jaroWinkler(name1, name2);
    return similarity; // Returns a score between 0 and 1
};

const checkName = (name1, name2) => {
    const score = jaroWinklerMatch(name1, name2);
    return {
        input_name:name1,
        kyc_name:name2,
        result: score > 0.9 ? 'true' : 'false', // You can adjust this threshold
        score
    };
};

const stringMatchingService = (inputName, kycName) => {
    const inputNameCleaned = removeTitles(inputName);
    const kycNameCleaned = removeTitles(kycName);
    const inputNameCleanString = cleanString(inputNameCleaned);
    const kycNameCleanString = cleanString(kycNameCleaned);
    return checkName(inputNameCleanString, kycNameCleanString);
};

// API Endpoint
app.post('/v1/match-names', (req, res) => {
    const { input_name, kyc_name } = req.body;
    if (!input_name || !kyc_name) {
        return res.status(400).json({ error: 'input_name and kyc_name are required' });
    }
    const result = stringMatchingService(input_name, kyc_name);
    res.json(result);
});

app.listen(port, () => {
    console.log(`String matching service running at http://localhost:${port}`);
});
