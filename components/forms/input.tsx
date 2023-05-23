"use client";

import { ChangeEvent, FormEvent, useRef, useState } from "react";
import Image from "next/image";
import Webcam from "react-webcam";
import Toggle from "@/components/buttons/toggle";

enum EImage {
  PREVIEW = "preview",
  RESULT = "result",
}

export default function Input() {
  const [loading, setLoading] = useState(false);
  const [toggle, setToggle] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [fileSelected, setFile] = useState<File | string | null>();
  const [fileMaskSelected, setMaskFile] = useState<File | string | null>();
  const [image, setUrl] = useState<{ src: string; type: EImage } | null>(null);
  // const [imageResult, setImageResult] = useState<string | null>(null);
  const [isCaptureImg, setIsCaptureImage] = useState<boolean>(true);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileMaskName, setMaskFileName] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);

  const postRequest = async (value: FormEvent<HTMLFormElement>) => {
    setLoading(true);
    setUrl(null);
    value.preventDefault();
    let formData = new FormData();
    formData.append("prompt", prompt);
    if (fileMaskSelected) {
      formData.append("masking", fileMaskSelected);
    }
    // if (image) {
    // 	formData.append("image", image);
    // }
    if (fileSelected) {
      formData.append("image", fileSelected);
    }
    const req = await fetch("/api/generate", {
      method: "POST",
      body: formData,
      // headers: {
      // 'Content-Type': 'application/json',
      // 'Content-Type': 'multipart/form-data'
      // }
    });
    const res = await req.json();
    setUrl({ src: res.res, type: EImage.RESULT });
    // console.log("response", imageResult, res);
    setLoading(false);
  };

  const toBase64 = (file: File) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    setFile(null);
    // setImageResult(null)
    setIsCaptureImage(false);
    setFileName(null);
    if (e && e.target && e.target.files) {
      const reader = await toBase64(e.target.files[0]);
      setFile(reader as string);
      // setUrl(reader as string)
      setUrl({ src: reader as string, type: EImage.PREVIEW });
      setFileName(e.target.files[0].name);
    }
  };

  const handleMaskFile = async (e: ChangeEvent<HTMLInputElement>) => {
    setMaskFile(null);
    setMaskFileName(null);
    if (e && e.target && e.target.files) {
      const reader = await toBase64(e.target.files[0]);
      setMaskFile(reader as string);
      setMaskFileName(e.target.files[0].name);
    }
  };

  const captureImage = async () => {
    setFile(null);
    // setImageResult(null)
    setIsCaptureImage(true);
    setFileName(null);
    if (webcamRef && webcamRef.current) {
      const srcImg = webcamRef.current.getScreenshot({
        width: 512,
        height: 512,
      });
      if (srcImg) {
        // setUrl(srcImg);
        setUrl({ src: srcImg, type: EImage.PREVIEW });
        setFile(srcImg);
      }
    }
  };

  return (
    <div className="flex-row gap-3 flex center">
      <form onSubmit={postRequest} method="POST" className="w-1/2" action="">
        <div className="space-y-12">
          <div className="border-b border-gray-900/10 pb-12">
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Stability AI Example
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Write your prompt and upload your photo or take a picture from
              your webcam.
            </p>
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="col-span-full">
                <label
                  htmlFor="about"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Prompt
                </label>
                <div className="mt-2">
                  <textarea
                    id="about"
                    name="prompt"
                    rows={3}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    defaultValue={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  ></textarea>
                </div>
                {/* <p className="mt-3 text-sm leading-6 text-gray-600">Write a few prompt.</p> */}
              </div>

              <div className="col-span-full">
                <label
                  htmlFor="cover-photo"
                  className="flex flex-row gap-3 text-sm font-medium leading-6 text-gray-900"
                >
                  Take picture
                  <Toggle
                    value={toggle}
                    onChange={() => {
                      !loading && setToggle(!toggle);
                    }}
                  />
                  Upload existing image.
                </label>
                <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                  <div className="text-center">
                    {!toggle ? (
                      <>
                        <Webcam
                          ref={webcamRef}
                          width="512px"
                          height="512px"
                          screenshotQuality={1}
                          screenshotFormat="image/png"
                        />
                        <button
                          type="button"
                          onClick={captureImage}
                          disabled={loading}
                          className="mt-1 rounded-md bg-gray-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                          Take Picture
                        </button>
                      </>
                    ) : (
                      <>
                        <svg
                          className="mx-auto h-12 w-12 text-gray-300"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {fileName ? (
                          <div className="mt-4 flex text-sm leading-6 text-gray-600">
                            <p className="pl-1">{fileName}</p>
                          </div>
                        ) : (
                          <div className="mt-4 flex text-sm leading-6 text-gray-600">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500 px-2"
                            >
                              <span>Upload a file</span>
                              <input
                                onChange={handleFile}
                                disabled={loading}
                                id="file-upload"
                                name="image"
                                type="file"
                                className="sr-only"
                              />
                            </label>
                            <p className="pl-1">PNG or JPG</p>
                          </div>
                        )}
                        <p className="mt-1 text-xs leading-5 text-gray-600">
                          Make sure your image dimentions are 512x512 pixel
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-span-full">
                <label
                  htmlFor="cover-photo"
                  className="flex flex-row gap-3 text-sm font-medium leading-6 text-gray-900"
                >
                  Upload mask image
                </label>
                <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                  <div className="text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-300"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {fileMaskName ? (
                      <div className="mt-4 flex text-sm leading-6 text-gray-600">
                        <p className="pl-1">{fileMaskName}</p>
                      </div>
                    ) : (
                      <div className="mt-4 flex text-sm leading-6 text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500 px-2"
                        >
                          <span>Upload a file</span>
                          <input
                            onChange={handleMaskFile}
                            disabled={loading}
                            id="file-upload"
                            name="image"
                            type="file"
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">PNG or JPG</p>
                      </div>
                    )}
                    <p className="mt-1 text-xs leading-5 text-gray-600">
                      Make sure your image dimentions are 512x512 pixel
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-x-6">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            {loading ? "Loading..." : "Submit"}
          </button>
        </div>
      </form>
      <div className="flex flex-col center w-1/2">
        <h2 className="text-base font-semibold leading-7 text-gray-900 ">
          Results / Preview
        </h2>
        {image ? (
          <div className="col-span-full">
            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
              <div className="text-center">
                {image.type === EImage.RESULT ? (
                  <Image
                    width="0"
                    style={{ width: "512px", height: "512px" }}
                    // className="w-full h-full"
                    height="0"
                    src={image.src}
                    alt="image result"
                  />
                ) : (
                  <Image
                    width="0"
                    style={
                      isCaptureImg
                        ? { width: "612px", height: "460px" }
                        : { width: "512px", height: "512px" }
                    }
                    // className="w-full h-full"
                    height="0"
                    src={image.src}
                    alt="image preview"
                  />
                )}
              </div>
            </div>
          </div>
        ) : loading ? (
          <div className="items-center flex flex-col justify-center w-full h-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="text-gray-900 animate-spin w-9 h-9"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
