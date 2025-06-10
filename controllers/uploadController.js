//JB: Disclaimer: It is just me playing around with stuff

import multer from "multer";
import dotenv from "dotenv";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import crypto from "crypto";
import sharp from "sharp";
import { getDB } from "../utils/db.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

dotenv.config();

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.BUCKET_ACCESS_KEY;
const secretAccessKey = process.env.BUCKET_SECRET_ACCESS_KEY;

const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
  region: bucketRegion,
});

const randomImageName = () => crypto.randomBytes(16).toString("hex");
// ------------ USERPICTURE - UPLOADER ----------------
export const uploadImage = async (req, res) => {
  const db = getDB();

  const imageKey = randomImageName();

  try {
    console.log("req.body", req.body);
    console.log("req.file", req.file);
    console.log("userId", req.body.userId);

    const buffer = await sharp(req.file.buffer)
      .resize({ height: 250, width: 250 })
      .toBuffer();

    const params = {
      Bucket: bucketName,
      Key: imageKey,
      Body: buffer,
      ContenType: req.file.mimetype,
    };

    const command = new PutObjectCommand(params);

    await s3.send(command);

    const userId = req.body.userId;

    const query =
      "INSERT INTO user_images (user_id, image, mime_type, uploaded_at) VALUES (?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE image = VALUES(image), image_url = VALUES(image_url), mime_type = VALUES(mime_type),uploaded_at = NOW()";

    db.execute(query, [userId, imageKey, req.file.mimetype], (err, results) => {
      if (err) {
        console.error("DB insert error:", err);
        return res
          .status(500)
          .json({ message: "Failed to save image metadata" });
      }

      res.status(200).json({
        message: "Image uploaded and metadata saved",
        key: imageKey,
        url: imageUrl,
      });
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Something went wrong during upload" });
  }
};

// ------------- USERPICTURE - GETTER ----------------
export const getImage = async (req, res) => {
    const db = getDB();
    const userId = req.params.id;
  
    try {
      const user = await db.execute(
        "SELECT * FROM user_images WHERE user_id = ?",
        [userId]
      );
  
      const currentUser = user[0][0]
  
      const getObjectParams = {
        Bucket: bucketName,
        Key: currentUser.image,
      };
  
      //console.log(currentUser.image);
  
      const command = new GetObjectCommand(getObjectParams);
      const url = await getSignedUrl(s3, command);
      currentUser.image_url = url;
  
      res.send(currentUser);
  
      if (!user) {
        return res.status(404).json({ message: "No avatar found for this user" });
      }
  
    } catch (error) {
      console.error("Error fetching avatar:", error);
      res.status(500).json({ message: "Failed to fetch avatar" });
    }
  }