import { NextRequest, NextResponse } from "next/server";
// import fs from "fs";
// import path from "path";
import * as Generation from "@/generation/generation_pb";
import {
  buildGenerationRequest,
  executeGenerationRequest,
  // onGenerationComplete,
} from "@/helpers/helper";

import { client, metadata } from "@/helpers/features";

export async function POST(request: NextRequest) {
  try {
    let varResponse: string = "";
    const form = await request.formData();
    const prompt = form.get("prompt");
    const image = form.get("image") as string;
    if (image && prompt) {
      const reqImage = await fetch(image);
      const result = await reqImage.blob();
      const stream: any = result.stream();
      const chunks = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      // console.log("req----", buffer);
      const imageStrength = 0.35;

      const generationRequest = buildGenerationRequest(
        "stable-diffusion-xl-beta-v2-2-2",
        {
          type: "image-to-image",
          prompts: [
            {
              text: prompt as string,
            },
          ],
          stepScheduleStart: 1 - imageStrength,
          initImage: buffer,
          seed: 1413160511,
          samples: 1,
          cfgScale: 8,
          steps: 30,
          sampler: Generation.DiffusionSampler.SAMPLER_K_DPMPP_2M,
        }
      );

      await executeGenerationRequest(client, generationRequest, metadata)
        .then((response) => {
          if (response instanceof Error) {
            console.error("Generation failed", response);
            throw response;
          }

          console.log(
            `${response.imageArtifacts.length} image${
              response.imageArtifacts.length > 1 ? "s" : ""
            } were successfully generated.`
          );

          if (response.filteredArtifacts.length > 0) {
            console.log(
              `${response.filteredArtifacts.length} artifact` +
                `${response.filteredArtifacts.length > 1 ? "s" : ""}` +
                ` were filtered by the NSFW classifier and need to be retried.`
            );
          }

          console.log("artifact.getBinary_asB64", response);
          response.imageArtifacts.forEach((artifact: Generation.Artifact) => {
            varResponse = `data:${artifact.getMime()};base64,${artifact.getBinary_asB64()}`;
          });
        })
        .catch((error) => {
          console.error("Failed to make image-to-image request:", error);
        });
      return NextResponse.json({ res: varResponse });
    }

    return NextResponse.json({ res: "All input is required !" });
  } catch (error) {
    console.log("errorki=====", error);
  }
}
