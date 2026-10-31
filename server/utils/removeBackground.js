import { removeBackground } from "@imgly/background-removal-node";
import fs from 'fs'

export const removeImageBackground= async(inputPath,outputPath)=>{
    try{
        const images= await removeBackground(inputPath)
        const buffer = Buffer.from(
            await images.arrayBuffer()
        )

        await fs.writeFile(outputPath,buffer)

        return outputPath
    }catch(error){
 console.error("Background removal failed:", error);
    throw new Error("Unable to remove image background");
    
    }
}