import {
    PageSizes,
    PDFDocument,
    PDFFont,
    StandardFonts,
    rgb,
    grayscale,
    PDFPageDrawTextOptions,
    layoutMultilineText,
    TextAlignment, PDFPage
} from "pdf-lib";
import {hexToRgb, IconButton} from "@mui/material";
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import download from 'downloadjs'
import {Recipe} from "../Recipe";
import {DateTime} from "luxon";

export type PageMargins = {
    top: number
    bottom: number
    left: number
    right: number
}

const defaultMargins = {top: 75, bottom: 75, left: 75, right: 75}

type Props = {
    recipe: Recipe
    margin?: PageMargins
    size?: [number, number]
    font?: string
    fontSize?: number
}

export function PdfConverter(props: Props): JSX.Element {
    const {
        recipe,
        margin = defaultMargins,
        size = PageSizes.Letter,
        font = StandardFonts.Helvetica,
        fontSize = 12
    } = props


    async function handleCreatePdf(): Promise<void> {
        const doc = await PDFDocument.create()
        const documentFont = await doc.embedFont(font)

        let [page, pageNumber] = newPage(0, recipe.author)
        const {width, height} = page.getSize()

        const titleFontSize = fontSize + 2
        const smallFontSize = Math.max(fontSize - 3, 8)
        const lineSpacing = fontSize / 2

        const basics: PDFPageDrawTextOptions = {
            font: documentFont,
            size: fontSize,
            color: rgb(0, 0.2, 0.3),
        }

        page.setFont(documentFont)
        page.setFontSize(fontSize)

        // recipe name
        page.moveTo(margin.left, height - margin.top)
        page.setFontSize(titleFontSize)
        page.setFontColor(rgb(0, 0.2, 0.3))
        page.drawText(recipe.name)

        // recipe id
        page.setFontSize(smallFontSize)
        page.setFontColor(grayscale(0.75))
        page.moveDown(smallFontSize + lineSpacing)
        page.drawText(recipe._id.toString(),)

        // dates
        // yCursor -= smallFontSize + 2 * lineSpacing
        page.moveDown(smallFontSize + 2 * lineSpacing)
        page.drawText("Created:  " + formatDate(recipe.createdOn as number))
        page.moveDown(smallFontSize)
        page.drawText("Modified: " + formatDate(recipe.modifiedOn as number))

        // author and added by
        const author = recipe.author !== "" && recipe.author !== null ? `Author: ${recipe.author} ` : ""
        const addedBy = recipe.addedBy !== "" && recipe.addedBy !== null ? `(added by: ${recipe.addedBy})` : ""
        if (author !== "" || addedBy !== "") {
            page.moveDown(fontSize + lineSpacing)
            page.setFontSize(fontSize)
            page.setFontColor(rgb(0, 0, 0))
            page.drawText(`${author} ${addedBy}`)
        }

        // story
        if (recipe.story !== "") {
            page.moveDown(fontSize + 2 * lineSpacing)
            page.setFontSize(fontSize + 1)
            page.drawText("Story")

            const story = layoutMultilineText(recipe.story, {
                alignment: TextAlignment.Left,
                font: documentFont,
                fontSize: fontSize,
                bounds: {x: margin.left, y: page.getY(), width: width - margin.left - margin.right, height: height}
            })

            // let startingPosition = page.getY()
            page.setFontSize(fontSize)
            page.setFontColor(rgb(0, 0, 0))
            for (let i = 0; i < story.lines.length; ++i) {
                if (page.getY() < margin.bottom) {
                    [page, pageNumber] = newPage(pageNumber, recipe.author)
                    page.moveTo(margin.left, height - margin.top)
                }

                page.moveDown(fontSize + lineSpacing / 2)
                page.drawText(story.lines[i].text)
            }
        }

        // download
        const pdfBytes = await doc.save()
        download(pdfBytes, "recipe.pdf")

        function newPage(pageNumber: number, author?: string): [PDFPage, number] {
            const page = doc.addPage(size)
            page.setFont(documentFont)
            page.setFontSize(fontSize)
            page.setFontColor(rgb(0, 0, 0))
            addFooter(page, ++pageNumber, author)
            return [page, ++pageNumber]
        }

        function addFooter(page: PDFPage, pageNumber: number, author?: string): void {
            const footerFontSize = 9
            page.drawText(`City Recipes`, {
                size: footerFontSize,
                color: grayscale(0.75),
                x: margin.left,
                y: (margin.bottom - documentFont.heightAtSize(footerFontSize)) / 2
            })
            page.drawText(`- ${pageNumber} -`, {
                size: footerFontSize,
                color: grayscale(0.75),
                x: (page.getWidth() - documentFont.widthOfTextAtSize(`- ${pageNumber} -`, footerFontSize)) / 2,
                y: (margin.bottom - documentFont.heightAtSize(footerFontSize)) / 2
            })
            if (author) {
                page.drawText(author, {
                    size: footerFontSize,
                    color: grayscale(0.75),
                    x: (page.getWidth() - margin.right - documentFont.widthOfTextAtSize(`- ${pageNumber} -`, footerFontSize)),
                    y: (margin.bottom - documentFont.heightAtSize(footerFontSize)) / 2
                })

            }
        }

    }

    function formatDate(millis: number): string {
        return DateTime.fromMillis(millis, {zone: 'utc'})
            .toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
    }

    return (
        <IconButton onClick={handleCreatePdf}>
            <PictureAsPdfIcon/>
        </IconButton>
    )
}