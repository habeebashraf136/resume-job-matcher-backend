import { extractTextFromPDF } from '../services/pdf.service.ts';

export const parseResume = async (state: any) => {
    if(!state?.filePath){
        throw new Error('File path is required.');
    }
    
    try{
        const rawText = await extractTextFromPDF(state.filePath);
        return { rawText };
    }catch(error: any){
        throw new Error(`PDF text extraction failed: ${error.message}`);
    }  
};