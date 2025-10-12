import { messageAdminRouter, messagePublicRouter } from "@/api/message/message.router";
import { Router } from "express";

export const messageRouter = Router();

messageRouter.use('/admin', messageAdminRouter);
messageRouter.use('/public', messagePublicRouter);