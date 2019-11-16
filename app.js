const express = require('express')
const app = express()
const port = process.env.PORT || 3000;
const os = require('os');
const puppeteer = require('puppeteer');
const fs = require('fs');
const uuidv1 = require('uuid/v1');
const base64 = require('binary-base64');

app.use(express.json())    // <==== parse request body as JSON
app.get('/', (req, res) => res.send('Hello World!'))
app.post('/test',async (req, res) => {
    try {
        
        let tempDir = os.tmpdir();
        let tempFile = `${tempDir}/${uuidv1()}.pdf`;
        const browser = await puppeteer.launch({ headless:true });
        const page = await browser.newPage();

        const base64format = req.query.base64 === "true" || false;
        if (req.params.url) {
            await page.goto(req.params.url, { waitUntil: 'networkidle0' });
        }
        else {
            var local_html = req.body.local ? fs.readFileSync("test_html.html"): null;
            await page.setContent(local_html ?local_html.toString() : req.body.html);
        }
        await page.waitFor('*');
        await page.pdf({ path: tempFile,  printBackground: true,  width:"13in", height:"9in", format: 'A4' ,preferCSSPageSize : true});
        await page.screenshot({path: 'example.png'});
        await browser.close();

        var data = fs.readFileSync(tempFile);
        fs.unlinkSync(tempFile);

        if(base64format){
            res.setHeader("content-type", "application/json");
            res.send({base64: base64.encode(data)});
        }
        else{
            res.setHeader("content-type", "application/pdf");
            res.attachment("TEST NAME.pdf");
            res.send(data);
        }

    } catch (ex) {
        console.log(ex);
    }
});


app.listen(port, () => console.log(`Example app listening on port ${port}!`))