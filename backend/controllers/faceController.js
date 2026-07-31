const path = require("path");
const canvas = require("canvas");
const faceapi = require("@vladmandic/face-api");
const User = require("../models/User");

// Patch face-api to use node canvas
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

let modelsLoaded = false;

const loadModels = async () => {
  if (modelsLoaded) return;
  const modelsPath = path.join(__dirname, "../public/models");

  await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelsPath);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(modelsPath);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(modelsPath);

  modelsLoaded = true;
  console.log("✅ Face-api models loaded");
};

const getDescriptorFromBase64 = async (base64String) => {
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");
  const img = await canvas.loadImage(buffer);

  const detection = await faceapi
    .detectSingleFace(img)
    .withFaceLandmarks()
    .withFaceDescriptor();

  return detection ? detection.descriptor : null;
};

// @desc   Enrol face
// @route  POST /api/auth/face/enrol
// @access Private
const enrolFace = async (req, res) => {
  try {
    await loadModels();

    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }

    const descriptor = await getDescriptorFromBase64(imageBase64);
    if (!descriptor) {
      return res.status(400).json({
        success: false,
        message: "No face detected. Ensure your face is clearly visible in good lighting.",
      });
    }

    await User.findByIdAndUpdate(req.user._id, {
      faceDescriptor: Array.from(descriptor),
      faceEnrolled: true,
    });

    res.status(200).json({ success: true, message: "Face enrolled successfully" });
  } catch (error) {
    console.error("Face enrol error:", error.message);
    res.status(500).json({ success: false, message: "Face enrolment failed. Please try again." });
  }
};

// @desc   Verify face
// @route  POST /api/auth/face/verify
// @access Private
const verifyFace = async (req, res) => {
  try {
    await loadModels();

    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }

    const user = await User.findById(req.user._id).select("+faceDescriptor");
    if (!user.faceEnrolled || !user.faceDescriptor) {
      return res.status(400).json({
        success: false,
        message: "No face enrolled for this account",
      });
    }

    const incomingDescriptor = await getDescriptorFromBase64(imageBase64);
    if (!incomingDescriptor) {
      return res.status(400).json({
        success: false,
        message: "No face detected. Please try in better lighting.",
      });
    }

    const storedDescriptor = new Float32Array(user.faceDescriptor);
    const distance = faceapi.euclideanDistance(storedDescriptor, incomingDescriptor);
    const isMatch = distance < 0.5;

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Face does not match. Please try again.",
      });
    }

    res.status(200).json({ success: true, message: "Face verified successfully" });
  } catch (error) {
    console.error("Face verify error:", error.message);
    res.status(500).json({ success: false, message: "Face verification failed. Please try again." });
  }
};

module.exports = { enrolFace, verifyFace };