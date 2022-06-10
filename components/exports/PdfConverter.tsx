import {
    PageSizes,
    PDFDocument,
    PDFFont,
    StandardFonts,
    rgb,
    grayscale,
    PDFPageDrawTextOptions,
    layoutMultilineText,
    TextAlignment, PDFPage, RGB
} from "pdf-lib";
import {hexToRgb, IconButton} from "@mui/material";
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import download from 'downloadjs'
import {ingredientAsText, Recipe} from "../Recipe";
import {DateTime} from "luxon";
import {formatNumber} from "../../lib/utils";

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
        const nameWidth = documentFont.widthOfTextAtSize(recipe.name, titleFontSize)

        page.moveTo(margin.left, height - margin.top)
        page.setFontSize(titleFontSize)
        page.setFontColor(rgb(0, 0.2, 0.3))
        page.drawText(recipe.name, {x: (width - nameWidth) / 2})
        const nameHeight = documentFont.heightAtSize(titleFontSize)
        page.drawLine({
            start: {x: margin.left, y: page.getY() + nameHeight / 2},
            end: {x: (width - nameWidth) / 2 - 10, y: page.getY() + nameHeight / 2},
            color: grayscale(0.7),
            thickness: 2
        })
        page.drawLine({
            start: {x: (width + nameWidth) / 2 + 10, y: page.getY() + nameHeight / 2},
            end: {x: width - margin.right, y: page.getY() + nameHeight / 2},
            color: grayscale(0.7),
            thickness: 2
        })
        page.drawLine({
            start: {x: margin.left, y: page.getY() + nameHeight / 2 - 2},
            end: {x: (width - nameWidth) / 2 - 10, y: page.getY() + nameHeight / 2 - 2},
            color: grayscale(0.8),
            thickness: 1
        })
        page.drawLine({
            start: {x: (width + nameWidth) / 2 + 10, y: page.getY() + nameHeight / 2 - 2},
            end: {x: width - margin.right, y: page.getY() + nameHeight / 2 - 2},
            color: grayscale(0.8),
            thickness: 1
        })
        page.drawCircle({
            x: (width - nameWidth) / 2 - 10,
            y: page.getY() + nameHeight / 2,
            size: 4,
            color: grayscale(0.4)
        })
        page.drawCircle({
            x: (width + nameWidth) / 2 + 10,
            y: page.getY() + nameHeight / 2,
            size: 4,
            color: grayscale(0.4)
        })


        // recipe id
        page.setFontSize(smallFontSize)
        page.setFontColor(grayscale(0.75))
        // page.moveDown(smallFontSize + lineSpacing)
        const recipeIdWidth = documentFont.widthOfTextAtSize(recipe._id.toString(), smallFontSize)
        const recipeIdHeight = documentFont.heightAtSize(smallFontSize)
        page.drawText(recipe._id.toString(), {
            x: width - recipeIdWidth - 3,
            y: height - smallFontSize - 3
            // y: page.getY() + nameHeight / 2 + 2
        })

        // dates
        page.moveDown(smallFontSize + 2 * lineSpacing)
        page.drawText("Created:  " + formatDate(recipe.createdOn as number))
        page.moveDown(smallFontSize)
        page.drawText("Modified: " + formatDate(recipe.modifiedOn as number))

        // author and added by
        const author = recipe.author !== "" && recipe.author !== null ? `Author: ${recipe.author} ` : ""
        const addedBy = recipe.addedBy !== "" && recipe.addedBy !== null ? `(added by: ${recipe.addedBy})` : ""
        if (author !== "" || addedBy !== "") {
            page.moveDown(fontSize + 2 * lineSpacing)
            page.setFontSize(fontSize-2)
            page.setFontColor(rgb(0, 0, 0))
            page.drawText(`${author} ${addedBy}`)
        }

        // story
        if (recipe.story !== "") {
            page.moveDown(fontSize + 2 * lineSpacing)
            const storyWidth = documentFont.widthOfTextAtSize("Story", fontSize + 1)
            const storyHeight = documentFont.heightAtSize(fontSize + 1)
            page.drawLine({
                start: {x: margin.left, y: page.getY() + storyHeight / 2},
                end: {x: margin.left + 20, y: page.getY() + storyHeight / 2},
                color: grayscale(0.7),
                thickness: 1,
            })
            page.drawLine({
                start: {x: margin.left, y: page.getY() + storyHeight / 2 - 2},
                end: {x: margin.left + 20, y: page.getY() + storyHeight / 2 - 2},
                color: grayscale(0.7),
                thickness: 1,
            })

            page.drawLine({
                start: {x: margin.left + 20 + storyWidth + 10 + 10, y: page.getY() + storyHeight / 2 - 1},
                end: {x: width - margin.right, y: page.getY() + storyHeight / 2 - 1},
                color: grayscale(0.8),
                thickness: 1
            })

            page.setFontSize(fontSize + 1)
            page.drawText("Story", {x: margin.left + 30})
            page.moveDown(lineSpacing)

            const story = layoutMultilineText(recipe.story, {
                alignment: TextAlignment.Left,
                font: documentFont,
                fontSize: fontSize,
                bounds: {x: margin.left, y: page.getY(), width: width - margin.left - margin.right, height: height}
            })

            renderMultiline(recipe.story, fontSize, rgb(0, 0, 0))
        }

        // ingredients
        page.setFontSize(fontSize + 2)
        page.setFontColor(rgb(0, 0.2, 0.3))
        page.moveDown(fontSize + 2 + 2 * lineSpacing)
        if (page.getY() < margin.bottom) {
            [page, pageNumber] = newPage(pageNumber, recipe.author)
        }
        const ingredientsWidth = documentFont.widthOfTextAtSize("Ingredients", fontSize + 1)
        const ingredientsHeight = documentFont.heightAtSize(fontSize + 1)
        page.drawLine({
            start: {x: margin.left, y: page.getY() + ingredientsHeight / 2},
            end: {x: margin.left + 20, y: page.getY() + ingredientsHeight / 2},
            color: grayscale(0.7),
            thickness: 1,
        })
        page.drawLine({
            start: {x: margin.left, y: page.getY() + ingredientsHeight / 2 - 2},
            end: {x: margin.left + 20, y: page.getY() + ingredientsHeight / 2 - 2},
            color: grayscale(0.7),
            thickness: 1,
        })

        page.drawLine({
            start: {x: margin.left + 20 + ingredientsWidth + 10 + 10, y: page.getY() + ingredientsHeight / 2 - 1},
            end: {x: width - margin.right, y: page.getY() + ingredientsHeight / 2 - 1},
            color: grayscale(0.8),
            thickness: 1
        })

        page.drawText("Ingredients", {x: margin.left + 30})

        page.setFontSize(fontSize)
        page.setFontColor(rgb(0, 0, 0))
        recipe.ingredients.forEach(ingredient => {
            if (ingredient.section) {
                sectionHeader(ingredient.section)
            }
            renderMultiline(
                cleanUnicodeFractions(ingredientAsText(ingredient)),
                fontSize,
                rgb(0, 0, 0)
            )
        })

        // steps
        page.setFontSize(fontSize + 2)
        page.setFontColor(rgb(0, 0.2, 0.3))
        page.moveDown(fontSize + 2 + 2 * lineSpacing)
        if (page.getY() < margin.bottom) {
            [page, pageNumber] = newPage(pageNumber, recipe.author)
        }
        const stepsWidth = documentFont.widthOfTextAtSize("Steps", fontSize + 1)
        const stepsHeight = documentFont.heightAtSize(fontSize + 1)
        page.drawLine({
            start: {x: margin.left, y: page.getY() + stepsHeight / 2},
            end: {x: margin.left + 20, y: page.getY() + stepsHeight / 2},
            color: grayscale(0.7),
            thickness: 1,
        })
        page.drawLine({
            start: {x: margin.left, y: page.getY() + stepsHeight / 2 - 2},
            end: {x: margin.left + 20, y: page.getY() + stepsHeight / 2 - 2},
            color: grayscale(0.7),
            thickness: 1,
        })

        page.drawLine({
            start: {x: margin.left + 20 + stepsWidth + 10 + 10, y: page.getY() + stepsHeight / 2 - 1},
            end: {x: width - margin.right, y: page.getY() + stepsHeight / 2 - 1},
            color: grayscale(0.8),
            thickness: 1
        })
        page.drawText("Steps", {x: margin.left + 30})

        page.setFontSize(fontSize)
        page.setFontColor(rgb(0, 0, 0))
        recipe.steps.forEach((step, index) => {
            if (step.title) {
                sectionHeader(step.title)
            }
            renderMultiline(
                `(${formatNumber(index+1, 'en-US', {maximumFractionDigits: 0,})}) ${cleanUnicodeFractions(step.text)}`,
                fontSize,
                rgb(0, 0, 0)
            )
        })


        // download
        const pdfBytes = await doc.save()
        download(pdfBytes, "recipe.pdf")

        function cleanUnicodeFractions(text: string): string {
            return text
                .replaceAll('⅒', '1/10')
                .replaceAll('⅑', '1/9')
                .replaceAll('⅛', '1/8')
                .replaceAll('⅐', '1/7')
                .replaceAll('⅙', '1/6')
                .replaceAll('⅕', '1/5')
                .replaceAll('¼', '1/4')
                .replaceAll('⅓', '1/3')
                .replaceAll('⅜', '3/8')
                .replaceAll('⅖', '2/5')
                .replaceAll('½', '1/2')
                .replaceAll('⅗', '3/5')
                .replaceAll('⅔', '2/3')
                .replaceAll('⅝', '5/8')
                .replaceAll('¾', '3/4')
                .replaceAll('⅘', '4/5')
                .replaceAll('⅚', '5/6')
                .replaceAll('⅞', '7/8')
        }

        function sectionHeader(header: string): void {
            page.setFontSize(fontSize + 1)
            page.moveDown(fontSize + 1 + 1.5 * lineSpacing)
            const headerWidth = documentFont.widthOfTextAtSize(header, fontSize + 1)
            const headerHeight = documentFont.heightAtSize(fontSize + 1)

            page.drawLine({
                start: {x: margin.left, y: page.getY() - 2},
                end: {x: margin.left + headerWidth, y: page.getY() - 2},
                // start: {x: margin.left + headerWidth + 10 + 10, y: page.getY() + headerHeight / 2},
                // end: {x: 0.75 * (width - margin.right), y: page.getY() + headerHeight / 2},
                color: grayscale(0.9),
                thickness: 1
            })
            page.drawText(header)
        }

        function renderMultiline(text: string, fontSize: number, fontColor: RGB): void {
            const multilineText = layoutMultilineText(text, {
                alignment: TextAlignment.Left,
                font: documentFont,
                fontSize: fontSize,
                bounds: {x: margin.left, y: page.getY(), width: width - margin.left - margin.right, height: height}
            })

            page.setFontSize(fontSize)
            page.setFontColor(fontColor)
            for (let i = 0; i < multilineText.lines.length; ++i) {
                if (page.getY() < margin.bottom) {
                    [page, pageNumber] = newPage(pageNumber, recipe.author)
                    page.moveTo(margin.left, height - margin.top)
                }

                page.moveDown(fontSize + lineSpacing / 2)
                page.drawText(multilineText.lines[i].text)
            }
        }

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