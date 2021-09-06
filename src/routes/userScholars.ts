import { Request, Response, Router } from "express";
import { IErrorResponse } from "types";
import {
  addScholar,
  getDashboardData,
  managerHasScholar,
} from "../controllers/userScholarsController";
import { authenticateToken } from "../utils/token";

const router = Router();
router.use(authenticateToken);

// list of scholars
router.get("/dashboard/:managerId", async (req: Request, res: Response) => {
  const { managerId } = req.params;

  if (!managerId) {
    res.status(400).send({ msg: "Missing managerId" });
    return;
  }

  try {
    // get my schollars data
    const scholarData = await getDashboardData(managerId);
    res.status(200).send(scholarData);
    return;
  } catch (error) {
    console.log(error);
    const response: IErrorResponse = { msg: "internal server error", error };
    res.status(500).json(response);
    return;
  }
});

router.post("/add", async (req: Request, res: Response) => {
  const { managerId, scholarAddress } = req.body;

  if (!managerId) {
    res.status(400).send({ msg: "Missing managerId" });
    return;
  }

  if (!scholarAddress) {
    res.status(400).send({ msg: "Missing scholarAddress" });
    return;
  }

  try {
    const alreadyExists = await managerHasScholar(managerId, scholarAddress);
    if (alreadyExists) {
      res.status(409).send({ msg: "You already added that Scholar" });
      return;
    }

    const newScholar = await addScholar(managerId, scholarAddress);
    res.status(200).send({ msg: "Scholar added", data: newScholar });
  } catch (error) {
    console.log(error);
    const response: IErrorResponse = { msg: "internal server error", error };
    res.status(500).json(response);
    return;
  }
});

export default router;
