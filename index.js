const { PDFDocument , StandardFonts, rgb} = require('pdf-lib');

const fs = require('fs');

createPDF().catch(err => {
    console.log(err);
});

mergePDFDocs().catch(err => {
    console.log(err);
});

addPageNumber().catch(err => {
    console.log(err);
});

async function createPDF() {
    //create a new document and add a new page

    const doc = await PDFDocument.create();
    const page = doc.addPage();

    //load the image and store it as a nodejs buffer in memory
    let img = fs.readFileSync('./logo.png');
    img = await doc.embedPng(img);

    //Draw the image on the centre of the page
    const { width, hight } = img.scale(1);
    page.drawImage(img, {
        x: page.getWidth() /2 - width / 2,
        y: page.getHeight() /2 - width / 2
    });

    //write the pdf to a file
    fs.writeFileSync('./test.pdf', await doc.save());
}

async function mergePDFDocs() {


    //load pdf documents to be merged

    const doc1 = await PDFDocument.load(fs.readFileSync('./test.pdf'));
    const doc2 = await PDFDocument.load(fs.readFileSync('./atlassian-git-cheatsheet.pdf'));

    //create a new document
    const mergedDoc = await PDFDocument.create();

    //Add doc1 to the new merged doc
    const [coverPage] = await mergedDoc.copyPages(doc1, [0]);
    mergedDoc.addPage(coverPage);

    //add the the content pages
    const contentPages = await mergedDoc.copyPages(doc2, doc2.getPageIndices());

    for (const page of contentPages) {
        mergedDoc.addPage(page);
    }

    fs.writeFileSync('./test2.pdf', await mergedDoc.save());

}

async function addPageNumber() {
    
    //read the contents of the file
    const content  = await PDFDocument.load(fs.readFileSync('./test2.pdf'));

    //Add a font to the document
    const helveticaFont = content.embedFont(StandardFonts.Helvetica);

    
    //Draw a line at the bottone of each page
    //Note that the botton of the page is 

    const pages = await content.getPages();
    for(const [i, page] of Object.entries(pages)){
        page.drawText(`${+i +1}`, {
            x:page.getWidth() / 2,
            y:10,
            size: 15,
            font: helveticaFont,
            color: rgb(0,0,0)
        });
    }

    //Write the pdf to a file
    fs.writeFileSync('./test_pagesNumbers.pdf', await content.save());
}