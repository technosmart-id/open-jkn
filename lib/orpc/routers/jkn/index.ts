import { bankRouter } from "./bank";
import { changeRequestRouter } from "./change-request";
import { facilityRouter } from "./facility";
import { participantRouter } from "./participant";
import { paymentRouter } from "./payment";
import { registrationRouter } from "./registration";

export const jknRouter = {
  participant: participantRouter,
  registration: registrationRouter,
  changeRequest: changeRequestRouter,
  facility: facilityRouter,
  payment: paymentRouter,
  bank: bankRouter,
};
