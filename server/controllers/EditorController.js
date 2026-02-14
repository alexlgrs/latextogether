import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function compileToPdf(req, res) {
    var { content } = req.body;
    var tempId = `doc_${Date.now()}`;
    var folderPath = path.join(__dirname, '../temp');
    var latexFile = path.join(folderPath, `${tempId}.tex`);

    if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath);

    fs.writeFileSync(latexFile, content);

    console.log(folderPath, latexFile);
    exec(`pdflatex -interaction=nonstopmode -output-directory=${folderPath} ${latexFile}`, (err, stdout, stderr) => {

        const pdfFile = path.join(folderPath, `${tempId}.pdf`);

        if (fs.existsSync(pdfFile)) {
            res.contentType("application/pdf");
            fs.createReadStream(pdfFile).pipe(res);
        } else {
            res.status(500).json({ error: "compilation ratée", details: stdout });
        }
    });
};

export default compileToPdf;