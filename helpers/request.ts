import fs from "fs";
import * as Generation from "@/generation/generation_pb";
import {
  buildGenerationRequest,
  executeGenerationRequest,
  onGenerationComplete,
} from "@/helpers/helper";

import { client, metadata } from "@/helpers/features";

// DreamStudio uses an Image Strength slider to control the influence of the initial image on the final result.
// This "Image Strength" is a value from 0-1, where values close to 1 yield images very similar to the init_image
// and values close to 0 yield imges wildly different than the init_image. This is just another way to calculate
// stepScheduleStart, which is done via the following formula: stepScheduleStart = 1 - imageStrength.  This means
// an image strength of 35% would result in a stepScheduleStart of 0.65.
const imageStrength = 0.35;
const request = buildGenerationRequest("stable-diffusion-xl-beta-v2-2-2", {
  type: "image-to-image",
  prompts: [
    {
      text: "sketchy cartoon anime",
    },
  ],
  stepScheduleStart: 1 - imageStrength,
  initImage: fs.readFileSync("./example_person.png"),
  seed: 1413160511,
  samples: 1,
  cfgScale: 8,
  steps: 30,
  sampler: Generation.DiffusionSampler.SAMPLER_K_DPMPP_2M,
});

executeGenerationRequest(client, request, metadata)
  .then(onGenerationComplete)
  .catch((error) => {
    console.error("Failed to make image-to-image request:", error);
  });
