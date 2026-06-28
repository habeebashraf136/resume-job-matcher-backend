import pdf from '@cedrugs/pdf-parse';
import fs from 'fs/promises';

export const extractTextFromPDF = async (filePath: string): Promise<string> => {
    try {
        const dataBuffer = await fs.readFile(filePath);
        const data = await pdf(dataBuffer);
        const extractedText = data.text?.trim();

        if (!extractedText || extractedText.length === 0) {
            throw new Error('Could not extract any text from PDF. It may be scanned or empty.');
        }

        return extractedText;

    } catch (error: any) {
        throw new Error(`PDF text extraction failed: ${error.message}`);
    } finally {
        // always delete the temp file whether success or failure
        await fs.unlink(filePath).catch(() => {});
    }
};