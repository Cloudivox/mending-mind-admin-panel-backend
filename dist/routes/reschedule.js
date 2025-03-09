"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../middleware/auth"));
const reschedule_1 = require("../controllers/reschedule");
const router = express_1.default.Router();
router.post("/reschedule-request/:availibilityId", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, reschedule_1.requestReschedule)(req, res);
}));
router.put("/reschedule-approve/:rescheduleId", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, reschedule_1.approveReschedule)(req, res);
}));
router.put("/reschedule-reject/:rescheduleId", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, reschedule_1.rejectReschedule)(req, res);
}));
router.get("/reschedule-requests", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, reschedule_1.getAllReschedules)(req, res);
}));
exports.default = router;
