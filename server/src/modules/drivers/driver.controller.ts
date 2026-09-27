import type { Response } from "express";

import type { AuthenticatedRequest } from "../../middleware/authenticate.js";

import { getAvailablePools, acceptPool } from "./driver.service.js";

export async function availablePoolsController(
  req: AuthenticatedRequest,

  res: Response,
) {
  try {
    const pools = await getAvailablePools(req.user!.userId);

    return res.status(200).json({
      success: true,

      data: pools,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,

      message: (error as Error).message,
    });
  }
}

export async function acceptPoolController(
  req: AuthenticatedRequest,

  res: Response,
) {
  try {


    const poolId = req.params.id;


    if (!poolId || Array.isArray(poolId)) {

      return res.status(400).json({

        success:false,

        message:"Invalid pool id"

      });

    }



    const pool = await acceptPool(
      req.user!.userId,

      poolId,
    );



    return res.status(200).json({

      success: true,

      data: pool,

    });


  } catch (error) {


    return res.status(400).json({

      success:false,

      message:(error as Error).message,

    });


  }
}