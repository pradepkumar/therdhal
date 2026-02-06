/**
 * Convert 2021_results.csv to elections-2021.json
 * Captures ALL candidate data per constituency including:
 * - votes, vote_share, winner, incumbent, deposit_lost
 * - myneta_education, profession, description
 */

const fs = require('fs');
const path = require('path');

// Path to source CSV
const CSV_PATH = './data/2021_results.csv';
const OUTPUT_PATH = './data/elections-2021.json';
const CONSTITUENCIES_OUTPUT = './data/constituencies.json';

function parseCSV(content) {
    const lines = content.split('\n');
    const headers = parseCSVLine(lines[0]);
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = parseCSVLine(line);
        const row = {};
        headers.forEach((header, idx) => {
            row[header.trim()] = values[idx] ? values[idx].trim() : '';
        });
        rows.push(row);
    }
    return rows;
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}

function convertToJSON(rows) {
    const elections = {
        year: 2021,
        constituencies: {}
    };

    const constituencyMeta = {};

    // Group by constituency
    const grouped = {};
    rows.forEach(row => {
        const constNo = row.Constituency_No;
        if (!constNo) return;

        if (!grouped[constNo]) {
            grouped[constNo] = [];
        }
        grouped[constNo].push(row);
    });

    // Process each constituency
    Object.entries(grouped).forEach(([constNo, candidates]) => {
        // Sort by position (winner first)
        candidates.sort((a, b) => parseInt(a.Position) - parseInt(b.Position));

        const firstCandidate = candidates[0];

        // Constituency-level data
        elections.constituencies[constNo] = {
            name: firstCandidate.Constituency_Name || '',
            district: firstCandidate.District_Name || '',
            type: firstCandidate.Constituency_Type || 'GEN',
            total_votes: parseInt(firstCandidate.Valid_Votes) || 0,
            electors: parseInt(firstCandidate.Electors) || 0,
            turnout_percent: parseFloat(firstCandidate.Turnout_Percentage) || 0,
            num_candidates: parseInt(firstCandidate.N_Cand) || candidates.length,
            candidates: []
        };

        // Add each candidate
        candidates.forEach(c => {
            // Skip if NOTA
            const isNota = c.Candidate === 'None Of The Above' || c.Party === 'NOTA';

            const candidate = {
                name: c.Candidate || '',
                party: c.Party || '',
                votes: parseInt(c.Votes) || 0,
                vote_share: parseFloat(c.Vote_Share_Percentage) || 0,
                winner: parseInt(c.Position) === 1 && !isNota,
                incumbent: c.Incumbent === 'TRUE',
                deposit_lost: c.Deposit_Lost === 'yes',
                sex: c.Sex || '',
                age: parseInt(c.Age) || null,
                myneta_education: c.MyNeta_education || '',
                profession: c.TCPD_Prof_Main_Desc || '',
                profession_secondary: c.TCPD_Prof_Second_Desc || ''
            };

            // Add optional fields if present
            if (c.Margin && !isNota) {
                candidate.margin = parseInt(c.Margin) || 0;
                candidate.margin_percent = parseFloat(c.Margin_Percentage) || 0;
            }

            if (c.No_Terms && c.No_Terms !== '0') {
                candidate.terms = parseInt(c.No_Terms) || 0;
            }

            if (c.Turncoat === 'TRUE') {
                candidate.turncoat = true;
            }

            elections.constituencies[constNo].candidates.push(candidate);
        });

        // Build constituency metadata
        constituencyMeta[constNo] = {
            name: firstCandidate.Constituency_Name || '',
            district: firstCandidate.District_Name || '',
            type: firstCandidate.Constituency_Type || 'GEN',
            electors: parseInt(firstCandidate.Electors) || 0,
            sub_region: firstCandidate.Sub_Region || ''
        };
    });

    return { elections, constituencyMeta };
}

function main() {
    console.log('Reading CSV file...');
    const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');

    console.log('Parsing CSV...');
    const rows = parseCSV(csvContent);
    console.log(`Parsed ${rows.length} candidate rows`);

    console.log('Converting to JSON...');
    const { elections, constituencyMeta } = convertToJSON(rows);

    const constCount = Object.keys(elections.constituencies).length;
    console.log(`Processed ${constCount} constituencies`);

    // Write elections JSON
    console.log(`Writing ${OUTPUT_PATH}...`);
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(elections, null, 2));

    // Write constituency metadata
    console.log(`Writing ${CONSTITUENCIES_OUTPUT}...`);
    fs.writeFileSync(CONSTITUENCIES_OUTPUT, JSON.stringify(constituencyMeta, null, 2));

    console.log('Done!');

    // Print sample
    const sampleConstNo = Object.keys(elections.constituencies)[0];
    console.log('\nSample constituency:', sampleConstNo);
    console.log(JSON.stringify(elections.constituencies[sampleConstNo], null, 2));
}

main();
