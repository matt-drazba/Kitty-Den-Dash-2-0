import { Router, type IRouter } from "express";
import path from "path";

const router: IRouter = Router();

router.get("/dashboard", (_req, res) => {
  res.sendFile(path.resolve(__dirname, "../dashboard.html"));
});

export default router;
