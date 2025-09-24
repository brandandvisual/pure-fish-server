import { env } from "@/common/utils/envConfig";
import { logger } from "@/server";
import mongoose from "mongoose";

export async function dbConnect({ dbName }: { dbName: string }) {
	await mongoose.connect(env.MONGO_URI, { dbName });
	logger.info(`[+] Database connected successfully`);
}
